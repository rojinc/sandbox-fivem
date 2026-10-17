local GRAPPLE_WEAPON = "WEAPON_BULLPUPSHOTGUN"
local GRAPPLE_MAX_DIST = 50.0 -- the client aims up to 40 m from the camera
local GRAPPLE_COOLDOWN = 2000 -- ms between ropes per player

local _ropes = {} -- [source] = grapple id of that player's live rope
local _lastRope = {} -- [source] = GetGameTimer() of the last CreateRope

-- The slot the client reported as equipped (Weapons:Server:Equipped) must hold
-- a grapple gun in the player's own inventory.
local function HasGrappleEquipped(source)
	local slot = _equipped[source]
	local char = Fetch:CharacterSource(source)
	if slot == nil or char == nil then
		return false
	end

	local item = INVENTORY:GetSlot(char:GetData("SID"), slot, 1)
	if item == nil or item.Name == nil then
		return false
	end

	local itemData = itemsDatabase[item.Name]
	return itemData ~= nil and string.upper(itemData.weapon or item.Name) == GRAPPLE_WEAPON
end

local function DestroyRope(source)
	if _ropes[source] ~= nil then
		TriggerClientEvent(string.format("Inventory:Client:Grapple:DestroyRope:%s", _ropes[source]), -1)
		_ropes[source] = nil
	end
end

RegisterNetEvent('Inventory:Server:Grapple:CreateRope', function(grappleid, dest)
	local src = source

	local now = GetGameTimer()
	if _lastRope[src] ~= nil and now - _lastRope[src] < GRAPPLE_COOLDOWN then
		return
	end
	_lastRope[src] = now

	grappleid = math.tointeger(tonumber(grappleid))
	local destType = type(dest)
	if
		grappleid == nil
		or (destType ~= "vector3" and destType ~= "table")
		or tonumber(dest.x) == nil
		or tonumber(dest.y) == nil
		or tonumber(dest.z) == nil
	then
		return
	end
	dest = vector3(dest.x + 0.0, dest.y + 0.0, dest.z + 0.0)

	local ped = GetPlayerPed(src)
	if not ped or ped == 0 or #(GetEntityCoords(ped) - dest) > GRAPPLE_MAX_DIST then
		return
	end

	if not HasGrappleEquipped(src) then
		return
	end

	DestroyRope(src) -- a new rope replaces one that never got its destroy
	_ropes[src] = grappleid
	TriggerClientEvent('Inventory:Client:Grapple:CreateRope', -1, src, grappleid, dest)
end)

-- Only the rope's owner can end it.
RegisterNetEvent('Inventory:Server:Grapple:DestroyRope', function(grappleid)
	local src = source
	grappleid = math.tointeger(tonumber(grappleid))
	if grappleid ~= nil and _ropes[src] == grappleid then
		DestroyRope(src)
	end
end)

AddEventHandler('playerDropped', function()
	local src = source
	DestroyRope(src)
	_lastRope[src] = nil
end)
