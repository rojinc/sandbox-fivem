local SHOP_REACH = 6.0

-- Open only within reach of the counter or shelf the player is using.
local function near(source, pos)
	if pos == nil or pos.x == nil then
		return false
	end
	return #(GetEntityCoords(GetPlayerPed(source)) - vector3(pos.x, pos.y, pos.z or 0.0)) <= SHOP_REACH
end

-- The same key GetSecondary writes: owner first, then type.
local function lockKey(owner, invType)
	return string.format("%s-%s", owner, invType)
end

function RegisterStashCallbacks()
	Callbacks:RegisterServerCallback("Stash:Server:Open", function(source, data, cb)
		if GlobalState[string.format("%s:Property", source)] ~= nil then
			local pid = GlobalState[string.format("%s:Property", source)]
			if not _openInvs[lockKey(string.format("stash:%s", pid), 13)] then
				Inventory.Stash:Open(source, 13, pid)
				cb({ type = 13, owner = string.format("stash:%s", pid) })
			else
				cb(nil)
			end
		else
			cb(nil)
		end
	end)

	Callbacks:RegisterServerCallback("Shop:Server:Open", function(source, data, cb)
		local k = type(data) == "table" and string.format("shop:%s", data.identifier) or nil
		if k ~= nil and shopLocations[k] ~= nil and near(source, shopLocations[k].coords) then
			local entId = shopLocations[k].entityId
			if not _openInvs[lockKey(k, entId)] then
				Inventory:OpenSecondary(source, entId, ("shop:%s"):format(data.identifier))
				cb(entId)
			else
				cb(false)
			end
		else
			cb(false)
		end
	end)

	Callbacks:RegisterServerCallback("Inventory:Server:Open", function(source, data, cb)
		-- Storages configured by other resources; never pockets, vehicles, the
		-- ground, shops or bags, which all have their own checked paths.
		if not ValidateConfiguredOpen(source, data) then
			return cb(false)
		end
		if not _openInvs[lockKey(data.owner, data.invType)] then
			if entityPermCheck(source, data.invType) then
				Inventory:OpenSecondary(source, data.invType, data.owner, data.class or false, data.model or false)
				cb(true)
			else
				cb(false)
			end
		else
			cb(false)
		end
	end)

	Callbacks:RegisterServerCallback("PlayerShop:Server:Open", function(source, data, cb)
		if type(data) == "table" and _playerShops[data.id] and near(source, _playerShops[data.id].position) then
			if not _openInvs[lockKey(data.id, 200)] then
				Inventory:OpenSecondary(source, 200, data.id)
				cb(200)
			else
				cb(false)
			end
		else
			cb(false)
		end
	end)
end
