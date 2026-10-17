-- Give part or all of one slot to the player standing next to you.
-- The client only names the slot, the amount and who it thinks is nearest;
-- what the item is, whether they are close enough and whether it fits are all
-- checked here against the database before any row moves.

local GIVE_DISTANCE = 3.0
local GIVE_COOLDOWN_MS = 750

local _lastGive = {}

local function toInt(value)
	local n = tonumber(value)
	if n == nil then
		return nil
	end
	return math.tointeger(n)
end

local function cannotAct(state)
	return state.isDead or state.isCuffed or state.isHardCuffed
end

function DoGive(source, data, cb)
	if type(data) ~= "table" then
		return cb({ reason = "Something went wrong. Try again." })
	end

	local now = GetGameTimer()
	if _lastGive[source] ~= nil and now - _lastGive[source] < GIVE_COOLDOWN_MS then
		return cb({ reason = "Wait a moment before giving something else." })
	end
	_lastGive[source] = now

	local char = Fetch:CharacterSource(source)
	if char == nil or cannotAct(Player(source).state) or IsUsingItem(source) then
		return cb({ reason = "You cannot give items right now." })
	end

	-- Who: a different, loaded character in the same world, within reach.
	local target = toInt(data.target)
	if target == nil or target == source or GetPlayerName(target) == nil then
		return cb({ reason = "No one is close enough. Stand next to the person first." })
	end

	local tChar = Fetch:CharacterSource(target)
	if tChar == nil or Player(source).state.currentRoute ~= Player(target).state.currentRoute then
		return cb({ reason = "No one is close enough. Stand next to the person first." })
	end

	local distance = #(GetEntityCoords(GetPlayerPed(source)) - GetEntityCoords(GetPlayerPed(target)))
	if distance > GIVE_DISTANCE then
		return cb({ reason = "Stand closer to them and try again." })
	end

	-- What: the slot as the database has it, never the item the client names.
	local sid = char:GetData("SID")
	local slot = toInt(data.slot)
	local slotData = nil
	if slot ~= nil and slot >= 1 and slot <= (LoadedEntitys[1].slots or 10) then
		slotData = INVENTORY:GetSlot(sid, slot, 1)
	end
	if slotData == nil then
		return cb({ reason = "That item is no longer in your inventory." })
	end

	local def = itemsDatabase[slotData.Name]
	if def == nil then
		return cb({ reason = "This item has no definition, so it cannot be given." })
	end

	local max = def.isStackable and slotData.Count or 1
	local count = toInt(data.count)
	if count == nil or count < 1 or count > max then
		return cb({ reason = string.format("Choose an amount from 1 to %s.", max) })
	end

	-- Room: weight and a slot on their side.
	local tSid = tChar:GetData("SID")
	local capacity = getCapacity(1)
	if capacity ~= nil and StoredWeight(tSid, 1) + (def.weight or 0) * count > capacity then
		return cb({ reason = "They cannot carry that much." })
	end

	local tSlot = nil
	if def.isStackable then
		tSlot = INVENTORY:GetMatchingSlot(tSid, slotData.Name, count, 1)
	end
	if tSlot == nil then
		tSlot = INVENTORY:GetFreeSlotNumbers(tSid, 1)[1]
	end
	if tSlot == nil then
		return cb({ reason = "They have no free space for that." })
	end
	local tBefore = INVENTORY:CountInSlot(tSid, tSlot, 1) or 0

	-- Move the rows themselves so durability, quality and metadata go with them.
	local rows = MySQL.rawExecute.await(
		"SELECT id FROM inventory WHERE owner = ? AND type = 1 AND slot = ? AND item_id = ? ORDER BY id ASC LIMIT ?",
		{ tostring(sid), slot, slotData.Name, count }
	) or {}

	local ids = {}
	for _, row in ipairs(rows) do
		local id = math.tointeger(row.id)
		if id ~= nil then
			table.insert(ids, id)
		end
	end
	if #ids == 0 then
		return cb({ reason = "That item is no longer in your inventory." })
	end

	MySQL.update.await(
		string.format("UPDATE inventory SET owner = ?, type = 1, slot = ? WHERE id IN (%s)", table.concat(ids, ",")),
		{ tostring(tSid), tSlot }
	)
	local moved = #ids

	-- The same follow-up DoMove does when an item leaves a player's inventory.
	if not def.isStackable or moved == slotData.Count then
		if def.type == 2 then
			TriggerClientEvent("Weapons:Client:Remove", source, slotData, slot, {
				owner = tSid,
				type = 1,
				slot = tSlot,
			})
		elseif def.type == 10 then
			TriggerClientEvent("Inventory:Container:Remove", source, slotData, slot)
		end
	elseif def.isThrowable then
		TriggerClientEvent("Weapons:Client:UpdateCount", source, slot, slotData.Count - moved)
	end
	if def.isThrowable then
		TriggerClientEvent("Weapons:Client:UpdateCount", target, tSlot, tBefore + moved)
	end

	if WEAPON_PROPS[def.weapon or def.name] ~= nil then
		_refreshAttchs[sid] = source
		_refreshAttchs[tSid] = target
	end
	if def.gangChain ~= nil then
		_refreshGangChain[sid] = source
		_refreshGangChain[tSid] = target
	end

	refreshShit(sid)
	refreshShit(tSid)

	TriggerClientEvent("Inventory:Client:Changed", source, "removed", slotData.Name, moved)
	TriggerClientEvent("Inventory:Client:Changed", target, "add", slotData.Name, moved)
	TriggerClientEvent("Inventory:Client:Given", source, "give", _cachedInvs[string.format("%s-%s", sid, 1)])
	TriggerClientEvent("Inventory:Client:Given", target, "receive", _cachedInvs[string.format("%s-%s", tSid, 1)])

	Logger:Info(
		"Inventory",
		string.format("%s (SID %s) gave %sx %s to %s (SID %s)", GetPlayerName(source), sid, moved, slotData.Name, GetPlayerName(target), tSid)
	)

	cb({ success = true, count = moved })
end

AddEventHandler("playerDropped", function()
	_lastGive[source] = nil
end)
