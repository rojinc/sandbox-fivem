-- Buying from NPC shops and player shops. CheckTransfer (server/access.lua)
-- has already confirmed the shop is the one the server opened for this
-- player, that they are near it, that the item and amount are what the shop
-- holds, and that the destination slot and their weight have room. This
-- charges for exactly what is handed over and never trusts a price or an item
-- name from the client.

local _shopBusy = {}

local function chargeBuyer(source, char, cost, description)
	if cost <= 0 then
		return true, nil
	end

	if (char:GetData("Cash") or 0) >= cost and Wallet:Modify(source, -cost) then
		return true, "cash"
	end

	local account = char:GetData("BankAccount")
	if account ~= nil and Banking.Balance:Has(account, cost) then
		local ok = Banking.Balance:Charge(account, cost, {
			type = "bill",
			title = "Store Purchase",
			description = description,
			data = {},
		})
		if ok then
			Phone.Notification:Add(source, "Bill Payment Successful", description, os.time(), 3000, "bank", {})
			return true, "bank"
		end
	end

	return false, nil
end

local function refundBuyer(source, char, amount, how, description)
	if amount <= 0 or how == nil then
		return
	end
	if how == "cash" then
		Wallet:Modify(source, amount)
	elseif how == "bank" then
		Banking.Balance:Deposit(char:GetData("BankAccount"), amount, {
			type = "deposit",
			title = "Store Refund",
			description = description,
			data = {},
		}, true)
	end
end

local function queueTakings(account, cost)
	if cost <= 0 then
		return
	end
	QueueShopDeposit(account, math.floor(cost * STORE_SHARE_AMOUNT))
	QueueShopDeposit(_govAccount, math.ceil(cost * (1.0 - STORE_SHARE_AMOUNT)), true)
end

local function markRefresh(sid, source, item)
	if WEAPON_PROPS[item.weapon or item.name] ~= nil then
		_refreshAttchs[sid] = source
	end
	if item.gangChain ~= nil then
		_refreshGangChain[sid] = source
	end
end

local function buyFromShop(source, char, data, cb)
	local sid = char:GetData("SID")
	local entity = LoadedEntitys[data.invTypeFrom]
	local slot = getShopSlot(source, data.ownerFrom, data.invTypeFrom, data.slotFrom)
	if slot == nil or slot.Name ~= data.name then
		return cb({ reason = "That item is not for sale here." })
	end

	local item = itemsDatabase[slot.Name]
	if item.type == 2 and item.requiresLicense and not Weapons:IsEligible(source) then
		return cb({ reason = "You need a weapons permit to buy this." })
	end
	if item.qualification and not hasValue(char:GetData("Qualifications"), item.qualification) then
		return cb({ reason = "You need an extra qualification to buy this." })
	end

	local count = data.countTo
	local cost = entity.free and 0 or math.ceil((tonumber(slot.Price) or 0) * count)
	local description = string.format("Bought x%s %s", count, item.label)

	local paid, how = chargeBuyer(source, char, cost, description)
	if not paid then
		return cb({ reason = "You cannot afford that." })
	end

	local added = INVENTORY:AddItem(sid, slot.Name, count, {}, 1, false, false, false, false, data.slotTo, false, false, false, true)
	if not added then
		refundBuyer(source, char, cost, how, description)
		return cb({ reason = "That item could not be added. You were not charged." })
	end

	queueTakings(storeBankAccounts[entity.id], cost)
	CreateStoreLog(data.ownerFrom, slot.Name, count, sid, added.MetaData, 0)
	markRefresh(sid, source, item)

	sendRefreshForClient(source, data.ownerFrom, data.invTypeFrom, data.slotFrom)
	sendRefreshForClient(source, data.ownerTo, data.invTypeTo, data.slotTo)
	return cb({ success = true })
end

local function buyFromPlayerShop(source, char, data, cb)
	local sid = char:GetData("SID")
	local shopId = data.ownerFrom
	local shop = _playerShops[shopId]
	if shop == nil then
		return cb({ reason = "This shop is closed." })
	end

	local isMod = IsShopModerator(shopId, source)
	if not isMod and not GlobalState[string.format("BasicShop:%s", shopId)] then
		return cb({ reason = "This shop is closed." })
	end

	local item = itemsDatabase[data.name]
	local count = data.countTo

	-- Pick the exact rows first; the price is theirs, not the client's.
	local rows = MySQL.rawExecute.await(
		"SELECT id, price FROM inventory WHERE owner = ? AND type = ? AND slot = ? AND item_id = ? ORDER BY id ASC LIMIT ?",
		{ tostring(shopId), data.invTypeFrom, data.slotFrom, data.name, count }
	) or {}
	if #rows < count then
		return cb({ reason = string.format("Only %s left.", #rows) })
	end

	local ids, cost = {}, 0
	for _, row in ipairs(rows) do
		table.insert(ids, math.tointeger(row.id))
		cost += tonumber(row.price) or 0
	end
	cost = isMod and 0 or math.ceil(cost)

	local description = string.format("Bought x%s %s From %s", count, item.label, shop.name)
	local paid, how = chargeBuyer(source, char, cost, description)
	if not paid then
		return cb({ reason = "You cannot afford that." })
	end

	local moved = MySQL.update.await(
		string.format("UPDATE inventory SET slot = ?, owner = ?, type = 1, price = 0 WHERE owner = ? AND type = ? AND id IN (%s)", table.concat(ids, ",")),
		{ data.slotTo, tostring(sid), tostring(shopId), data.invTypeFrom }
	) or 0

	if moved < count then
		local refund = cost - math.floor(cost * moved / count)
		refundBuyer(source, char, refund, how, description)
		cost -= refund
	end
	if moved < 1 then
		return cb({ reason = "Someone bought it first. You were not charged." })
	end

	if not isMod then
		queueTakings(shop.bank, cost)
	end
	markRefresh(sid, source, item)

	getInventory(source, shopId, data.invTypeFrom)
	getInventory(source, sid, 1)
	sendRefreshForClient(source, data.ownerFrom, data.invTypeFrom, data.slotFrom)
	sendRefreshForClient(source, data.ownerTo, data.invTypeTo, data.slotTo)
	return cb({ success = true })
end

-- Called by DoMove and DoMerge after CheckTransfer when the items come from
-- a shop or another owner's player shop.
function DoShopPurchase(source, data, cb)
	local char = Fetch:CharacterSource(source)
	if char == nil then
		return cb({ reason = "Something went wrong. Try again." })
	end
	if data.invTypeTo ~= 1 or tostring(data.ownerTo) ~= tostring(char:GetData("SID")) then
		return cb({ reason = "Buy into your own inventory." })
	end

	local entity = LoadedEntitys[data.invTypeFrom]
	if entity.shop then
		return buyFromShop(source, char, data, cb)
	end

	local shopId = tostring(data.ownerFrom)
	if _shopBusy[shopId] then
		return cb({ reason = "Someone else is buying from this shop. Try again." })
	end
	_shopBusy[shopId] = true
	local ok, err = pcall(buyFromPlayerShop, source, char, data, cb)
	_shopBusy[shopId] = nil
	if not ok then
		error(err, 0)
	end
end
