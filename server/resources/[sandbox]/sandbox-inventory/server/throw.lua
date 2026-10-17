-- Throw: the client throws the item with physics and reports where it came
-- to rest. The item only leaves the inventory here, once the landing spot is
-- within reach, the slot still holds the item that was thrown and the ground
-- there has room. It then lies in a dropzone like anything else dropped.

local THROW_RANGE = 15.0
local THROW_COOLDOWN_MS = 1000

local _lastThrow = {}

local function toInt(value)
	local n = tonumber(value)
	if n == nil then
		return nil
	end
	return math.tointeger(n)
end

local function toFinite(value)
	local n = tonumber(value)
	if n == nil or n ~= n or n == math.huge or n == -math.huge then
		return nil
	end
	return n
end

function DoThrow(source, data, cb)
	if type(data) ~= "table" or type(data.coords) ~= "table" then
		return cb({ reason = "Something went wrong. Try again." })
	end

	local now = GetGameTimer()
	if _lastThrow[source] ~= nil and now - _lastThrow[source] < THROW_COOLDOWN_MS then
		return cb({ reason = "Wait a moment before throwing something else." })
	end
	_lastThrow[source] = now

	local char = Fetch:CharacterSource(source)
	local state = Player(source).state
	if char == nil or state.isDead or state.isCuffed or state.isHardCuffed or IsUsingItem(source) then
		return cb({ reason = "You cannot throw items right now." })
	end

	local ped = GetPlayerPed(source)
	if GetVehiclePedIsIn(ped, false) ~= 0 then
		return cb({ reason = "Get out of the vehicle to throw items." })
	end

	-- Where: within reach of where the server sees the player now.
	local x, y, z = toFinite(data.coords.x), toFinite(data.coords.y), toFinite(data.coords.z)
	if x == nil or y == nil or z == nil then
		return cb({ reason = "Something went wrong. Try again." })
	end
	local landing = vector3(x, y, z)
	if #(GetEntityCoords(ped) - landing) > THROW_RANGE then
		return cb({ reason = "It landed out of reach, so it is still in your inventory." })
	end

	-- What: the slot as stored, and it must still be the item that was thrown.
	local sid = char:GetData("SID")
	local slot = toInt(data.slot)
	local slotData = nil
	if slot ~= nil and slot >= 1 and slot <= (LoadedEntitys[1].slots or 10) then
		slotData = INVENTORY:GetSlot(sid, slot, 1)
	end
	if slotData == nil or slotData.Name ~= data.name then
		return cb({ reason = "The item moved before it landed, so nothing was thrown." })
	end

	local def = itemsDatabase[slotData.Name]
	if def == nil then
		return cb({ reason = "This item has no definition, so it cannot be thrown." })
	end

	local max = def.isStackable and slotData.Count or 1
	local count = toInt(data.count)
	if count == nil or count < 1 or count > max then
		return cb({ reason = string.format("Choose an amount from 1 to %s.", max) })
	end

	-- Room: join a zone already within 2 m, or start one where it landed.
	local route = state.currentRoute
	local zone = INVENTORY:CheckDropZones(route, landing)
	local owner = zone ~= nil and zone.id or INVENTORY:CreateDropzone(route, landing)

	local capacity = getCapacity(10)
	if capacity ~= nil and StoredWeight(owner, 10) + (def.weight or 0) * count > capacity then
		MarkDropzone(owner)
		return cb({ reason = "There is too much on the ground there already." })
	end

	local tSlot = nil
	if def.isStackable then
		tSlot = INVENTORY:GetMatchingSlot(owner, slotData.Name, count, 10)
	end
	if tSlot == nil then
		tSlot = INVENTORY:GetFreeSlotNumbers(owner, 10)[1]
	end
	if tSlot == nil then
		MarkDropzone(owner)
		return cb({ reason = "There is no room left on the ground there." })
	end

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
		MarkDropzone(owner)
		return cb({ reason = "The item moved before it landed, so nothing was thrown." })
	end

	MySQL.update.await(
		string.format("UPDATE inventory SET owner = ?, type = 10, slot = ? WHERE id IN (%s)", table.concat(ids, ",")),
		{ owner, tSlot }
	)
	local moved = #ids

	-- The same follow-up DoMove does when an item leaves a player's inventory.
	if not def.isStackable or moved == slotData.Count then
		if def.type == 2 then
			TriggerClientEvent("Weapons:Client:Remove", source, slotData, slot, {
				owner = owner,
				type = 10,
				slot = tSlot,
			})
		elseif def.type == 10 then
			TriggerClientEvent("Inventory:Container:Remove", source, slotData, slot)
		end
	elseif def.isThrowable then
		TriggerClientEvent("Weapons:Client:UpdateCount", source, slot, slotData.Count - moved)
	end

	if WEAPON_PROPS[def.weapon or def.name] ~= nil then
		_refreshAttchs[sid] = source
	end
	if def.gangChain ~= nil then
		_refreshGangChain[sid] = source
	end

	refreshShit(sid)
	MarkDropzone(owner)
	TriggerClientEvent("Inventory:Client:Changed", source, "removed", slotData.Name, moved)

	Logger:Info(
		"Inventory",
		string.format("%s (SID %s) threw %sx %s to %s", GetPlayerName(source), sid, moved, slotData.Name, owner)
	)

	cb({ success = true, count = moved })
end

AddEventHandler("playerDropped", function()
	_lastThrow[source] = nil
end)
