-- Give: the UI names a slot and an amount; this picks the nearest visible
-- player within reach and lets the server check everything else
-- (server/give.lua).

local GIVE_DISTANCE = 3.0

local function nearestPlayer()
	local coords = GetEntityCoords(PlayerPedId())
	local me = PlayerId()
	local best, bestDistance = nil, GIVE_DISTANCE

	for _, player in ipairs(GetActivePlayers()) do
		if player ~= me then
			local ped = GetPlayerPed(player)
			if DoesEntityExist(ped) and IsEntityVisible(ped) then
				local distance = #(GetEntityCoords(ped) - coords)
				if distance <= bestDistance then
					best, bestDistance = player, distance
				end
			end
		end
	end

	return best
end

RegisterNUICallback("GiveItem", function(data, cb)
	local state = LocalPlayer.state
	if state.isDead or state.isCuffed or state.isHardCuffed or state.doingAction then
		return cb({ reason = "You cannot give items right now." })
	end

	local player = nearestPlayer()
	if player == nil then
		return cb({ reason = "No one is close enough. Stand next to the person first." })
	end

	Callbacks:ServerCallback("Inventory:GiveItem", {
		target = GetPlayerServerId(player),
		slot = data?.slot,
		count = data?.count,
	}, function(res)
		if type(res) ~= "table" then
			res = { reason = "The server did not answer. Try again." }
		end
		cb(res)
	end)
end)

-- Sent to both people after a give: refresh an open inventory and hand it over.
RegisterNetEvent("Inventory:Client:Given", function(role, inventory)
	if inventory ~= nil and Inventory.Set.Player.Data.Open then
		SendNUIMessage({
			type = "SET_INVENTORIES",
			data = {
				player = {
					inventory = inventory,
				},
			},
		})
	end

	local ped = PlayerPedId()
	if not IsPedInAnyVehicle(ped, false) and not LocalPlayer.state.isDead then
		loadAnimDict("mp_common")
		TaskPlayAnim(ped, "mp_common", role == "give" and "givetake1_a" or "givetake1_b", 8.0, -8.0, 2000, 48, 0.0, false, false, false)
	end
end)
