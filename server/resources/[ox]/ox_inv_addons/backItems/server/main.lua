AddEventHandler("playerDropped", function()
    Player(source).state:set('backItems', false, true)
    TriggerClientEvent('backItems:clearPlayerItems', -1, source)
end)

AddEventHandler('playerJoining', function(source)
    Player(source).state:set('backItems', false, true)
end)


AddStateBagChangeHandler('flashlightState', '', function(bagName, _, state)
    local source = GetPlayerFromStateBagName(bagName)
    local currentWeapon = exports.ox_inventory:GetCurrentWeapon(source)

    -- Check if player has a weapon equipped and it has metadata
    if not currentWeapon or not currentWeapon.metadata then
        return
    end

    currentWeapon.metadata.flashlight = state
    exports.ox_inventory:SetMetadata(source, currentWeapon.slot, currentWeapon.metadata)
end)