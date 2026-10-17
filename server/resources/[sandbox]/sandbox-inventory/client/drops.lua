-- Items on the ground. The server keeps the list of dropzones (with up to
-- three item names each); this draws them as real objects for this player
-- only. The objects are local, never networked, so they cost nothing to sync
-- and cannot be pushed, picked up or deleted by other players.

dropzones = {}

local RENDER_DISTANCE = 50.0
local SPREAD = { vector2(0.0, 0.0), vector2(0.28, 0.12), vector2(-0.22, 0.2) }

local _props = {}
local _running = false

local function itemsKey(dz)
	return table.concat(dz.items or {}, ",")
end

local function deleteProps(id)
	local set = _props[id]
	if set == nil then
		return
	end
	for _, obj in ipairs(set.entities) do
		if DoesEntityExist(obj) then
			DeleteEntity(obj)
		end
	end
	_props[id] = nil
end

local function deleteAllProps()
	for id in pairs(_props) do
		deleteProps(id)
	end
end

local function spawnProps(dz)
	local items = dz.items or {}

	local entities = {}
	local turn = GetHashKey(dz.id) % 360
	for i, name in ipairs(items) do
		if i > #SPREAD then
			break
		end
		local hash = DropModelFor(name)
		if LoadDropModel(hash) then
			local off = SPREAD[i]
			local obj = CreateObjectNoOffset(hash, dz.coords.x + off.x, dz.coords.y + off.y, dz.coords.z + 0.5, false, false, false)
			if obj ~= 0 then
				SetEntityHeading(obj, (turn + i * 97) % 360 + 0.0)
				PlaceObjectOnGroundProperly(obj)
				FreezeEntityPosition(obj, true)
				SetEntityCollision(obj, false, false)
				SetEntityInvincible(obj, true)
				table.insert(entities, obj)
			end
			SetModelAsNoLongerNeeded(hash)
		end
	end

	_props[dz.id] = { entities = entities, key = itemsKey(dz) }
end

local function updateProps()
	local pos = GetEntityCoords(PlayerPedId())
	local route = LocalPlayer.state.currentRoute

	local wanted = {}
	for _, dz in ipairs(dropzones) do
		-- A zone has no items listed until the server has read its rows; draw it then.
		if dz.route == route and dz.items ~= nil and #dz.items > 0 and #(pos - vector3(dz.coords.x, dz.coords.y, dz.coords.z)) <= RENDER_DISTANCE then
			wanted[dz.id] = dz
		end
	end

	for id, set in pairs(_props) do
		local dz = wanted[id]
		if dz == nil or set.key ~= itemsKey(dz) then
			deleteProps(id)
		end
	end

	for id, dz in pairs(wanted) do
		if _props[id] == nil then
			spawnProps(dz)
		end
	end
end

function startDropsTick()
	if _running then
		return
	end
	_running = true

	CreateThread(function()
		while LocalPlayer.state.loggedIn do
			updateProps()
			Wait(750)
		end
		deleteAllProps()
		_running = false
	end)
end

local function findDropzone(id)
	for k, v in ipairs(dropzones) do
		if v.id == id then
			return k, v
		end
	end
	return nil, nil
end

RegisterNetEvent("Inventory:Client:DropzoneForceUpdate", function(dzs)
	dropzones = dzs or {}
end)

RegisterNetEvent("Inventory:Client:AddDropzone", function(data)
	local k = findDropzone(data.id)
	if k ~= nil then
		dropzones[k] = data
	else
		table.insert(dropzones, data)
	end
end)

RegisterNetEvent("Inventory:Client:UpdateDropzone", function(id, items)
	local _, dz = findDropzone(id)
	if dz ~= nil then
		dz.items = items
	end
end)

RegisterNetEvent("Inventory:Client:RemoveDropzone", function(id)
	local k = findDropzone(id)
	if k ~= nil then
		table.remove(dropzones, k)
	end
	deleteProps(id)
end)

AddEventHandler("onResourceStop", function(resource)
	if resource == GetCurrentResourceName() then
		deleteAllProps()
	end
end)
