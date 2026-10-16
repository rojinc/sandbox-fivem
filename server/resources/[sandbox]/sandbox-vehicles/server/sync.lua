-- RegisterNetEvent('VehicleSync:Server:EmergencyAirhorn', function(veh, state)
--     TriggerClientEvent('VehicleSync:Client:EmergencyAirhorn', -1, veh, state)
-- end)

-- RegisterNetEvent('VehicleSync:Server:SyncIndicators', function(veh, state)
--     TriggerClientEvent('VehicleSync:Client:SyncIndicators', -1, veh, state)
-- end)

-- RegisterNetEvent('VehicleSync:Server:Emergency', function(veh, lights, siren)
--     TriggerClientEvent('VehicleSync:Client:Emergency', -1, veh, lights, siren)
-- end)

-- RegisterNetEvent('VehicleSync:Server:SyncNeons', function(veh, state)
--     TriggerClientEvent('VehicleSync:Client:SyncNeons', -1, veh, state)
-- end)

RegisterNetEvent('VehicleSync:Server:ShutDoor', function(vNet, door, instant)
    local veh = NetworkGetEntityFromNetworkId(vNet)

    TriggerClientEvent('VehicleSync:Client:ShutDoor', NetworkGetEntityOwner(veh), vNet, door, instant)
end)

RegisterNetEvent('VehicleSync:Server:OpenDoor', function(vNet, door, loose, instant)
    local veh = NetworkGetEntityFromNetworkId(vNet)

    TriggerClientEvent('VehicleSync:Client:OpenDoor', NetworkGetEntityOwner(veh), vNet, door, loose, instant)
end)

-- Resolve a net id to a vehicle the calling player is actually standing next to.
local function nearbyVehicle(src, vNet, maxDistance)
    if type(vNet) ~= 'number' then
        return nil
    end
    local veh = NetworkGetEntityFromNetworkId(vNet)
    if not veh or veh == 0 or not DoesEntityExist(veh) then
        return nil
    end
    local ped = GetPlayerPed(src)
    if not ped or ped == 0 then
        return nil
    end
    if #(GetEntityCoords(ped) - GetEntityCoords(veh)) > (maxDistance or 8.0) then
        return nil
    end
    return veh
end

RegisterNetEvent('VehicleSync:Server:BodyRepair', function(vNet)
    local veh = nearbyVehicle(source, vNet, 10.0)
    if not veh then
        return
    end

    local ent = Entity(veh)
    if ent and ent.state then
        ent.state.Damage = {
            Body = 1000.0,
            Engine = 1000.0
        }
        ent.state.RepairKits = 0

        ent.state.BlownUp = false
    end

    TriggerClientEvent('VehicleSync:Client:BodyRepair', -1, vNet)
end)

RegisterNetEvent('VehicleSync:Server:EngineRepair', function(vNet)
    local veh = nearbyVehicle(source, vNet, 10.0)
    if not veh then
        return
    end

    local ent = Entity(veh)
    if ent and ent.state then
        local currentStuff = ent.state.Damage or {}

        ent.state.Damage = {
            Body = currentStuff.Body or 1000.0,
            Engine = 1000.0
        }
        ent.state.RepairKits = 0

        ent.state.BlownUp = false
    end
end)

RegisterNetEvent('Vehicles:Server:ToggleAnchor', function(vNet)
    local ent = NetworkGetEntityFromNetworkId(vNet)
    if ent and DoesEntityExist(ent) then
        TriggerClientEvent('Vehicles:Client:ToggleAnchor', NetworkGetEntityOwner(ent), vNet)
    end
end)

RegisterNetEvent('Vehicles:Server:SyncNitroEffect', function(vNet, state)
    TriggerClientEvent('Vehicles:Client:SyncNitroEffect', -1, vNet, state)
end)

RegisterNetEvent('Vehicles:Server:SyncPurgeEffect', function(vNet, state)
    TriggerClientEvent('Vehicles:Client:SyncPurgeEffect', -1, vNet, state)
end)