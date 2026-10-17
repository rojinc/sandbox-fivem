-- Throw: the item leaves the hand as a local object with real physics. Where
-- it comes to rest is sent to the server, which checks the range and the slot
-- and moves the item into a dropzone there (server/throw.lua). Until then the
-- item stays in the inventory, so a throw that fails costs nothing.

local THROW_SPEED = 9.0
local THROW_LIFT = 3.5
local SETTLE_MS = 400
local MAX_FLIGHT_MS = 6000
local ANIM_DICT = "anim@heists@narcotics@trash"
local ANIM_NAME = "throw_b"

local _throwing = false

local function loadDict(dict)
	if not DoesAnimDictExist(dict) then
		return false
	end
	RequestAnimDict(dict)
	local timeout = GetGameTimer() + 2000
	while not HasAnimDictLoaded(dict) do
		if GetGameTimer() > timeout then
			return false
		end
		Wait(10)
	end
	return true
end

local function camForward()
	local rot = GetGameplayCamRot(2)
	local pitch, yaw = math.rad(rot.x), math.rad(rot.z)
	local flat = math.abs(math.cos(pitch))
	return vector3(-math.sin(yaw) * flat, math.cos(yaw) * flat, math.sin(pitch))
end

local function throwItem(name, slot, count)
	local ped = PlayerPedId()
	local hash = DropModelFor(name)
	if not LoadDropModel(hash) then
		Notification:Error("That item cannot be thrown. Move it to the ground instead.")
		return
	end

	if loadDict(ANIM_DICT) then
		TaskPlayAnim(ped, ANIM_DICT, ANIM_NAME, 8.0, -8.0, 1200, 48, 0.0, false, false, false)
		Wait(450)
	end

	local hand = GetWorldPositionOfEntityBone(ped, GetPedBoneIndex(ped, 57005))
	local obj = CreateObjectNoOffset(hash, hand.x, hand.y, hand.z, false, false, false)
	SetModelAsNoLongerNeeded(hash)
	if obj == 0 then
		return
	end

	SetEntityNoCollisionEntity(obj, ped, false)
	ActivatePhysics(obj)
	local dir = camForward()
	SetEntityVelocity(obj, dir.x * THROW_SPEED, dir.y * THROW_SPEED, dir.z * THROW_SPEED + THROW_LIFT)

	local started = GetGameTimer()
	local stillSince = nil
	while DoesEntityExist(obj) do
		Wait(50)
		local now = GetGameTimer()
		if IsEntityInWater(obj) or now - started > MAX_FLIGHT_MS then
			break
		end
		if GetEntitySpeed(obj) < 0.15 then
			stillSince = stillSince or now
			if now - stillSince >= SETTLE_MS then
				break
			end
		else
			stillSince = nil
		end
	end

	if not DoesEntityExist(obj) then
		return
	end
	local inWater = IsEntityInWater(obj)
	local coords = GetEntityCoords(obj)
	DeleteEntity(obj)

	if inWater or coords.z < -50.0 then
		Notification:Error("It landed where it cannot be picked up, so it is still in your inventory.")
		return
	end

	Callbacks:ServerCallback("Inventory:ThrowItem", {
		slot = slot,
		count = count,
		name = name,
		coords = { x = coords.x, y = coords.y, z = coords.z },
	}, function(res)
		if type(res) ~= "table" or not res.success then
			Notification:Error((type(res) == "table" and res.reason) or "The throw did not work. The item is still in your inventory.")
		end
	end)
end

RegisterNUICallback("ThrowItem", function(data, cb)
	local state = LocalPlayer.state
	local ped = PlayerPedId()
	if _throwing then
		return cb({ reason = "Wait for the last throw to land." })
	end
	if state.isDead or state.isCuffed or state.isHardCuffed or state.doingAction then
		return cb({ reason = "You cannot throw items right now." })
	end
	if IsPedInAnyVehicle(ped, true) then
		return cb({ reason = "Get out of the vehicle to throw items." })
	end
	if IsPedSwimming(ped) or IsPedFalling(ped) or IsPedRagdoll(ped) or IsPedClimbing(ped) then
		return cb({ reason = "You cannot throw items right now." })
	end

	local name = type(data?.name) == "string" and data.name or nil
	local slot = math.tointeger(tonumber(data?.slot) or 0)
	local count = math.tointeger(tonumber(data?.count) or 0)
	if name == nil or slot == nil or slot < 1 or count == nil or count < 1 then
		return cb({ reason = "Select an item in your inventory to throw." })
	end

	cb({ success = true })
	_throwing = true
	Inventory.Close:All()
	CreateThread(function()
		local ok, err = pcall(throwItem, name, slot, count)
		if not ok then
			print("[sandbox-inventory] throw failed: " .. tostring(err))
		end
		_throwing = false
	end)
end)
