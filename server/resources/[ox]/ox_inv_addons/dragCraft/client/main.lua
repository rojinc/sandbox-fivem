local RECIPES = require 'dragCraft.config'

RegisterNetEvent('dragCraft:Craft', function(duration, index)
    local recipe = RECIPES[index]

    if not recipe then return end
    TriggerServerEvent('ox_inventory:closeInventory')

    ---@type boolean | nil
    local continue

    if recipe.client?.before then
        continue = recipe.client.before(recipe)
    end

    if continue == false then return end

    exports['sandbox-hud']:Progress({
        name = "crafting_item",
        duration = duration,
        label = "Crafting...",
        useWhileDead = false,
        canCancel = true,
        controlDisables = {
            disableMovement = false,
            disableCarMovement = true,
            disableMouse = false,
            disableCombat = true,
        },
        animation = {
            animDict = "amb@prop_human_parking_meter@male@base",
            anim = "base",
            flags = 49,
        },
    }, function(cancelled)
        local result = not cancelled
        TriggerServerEvent('dragCraft:success', result, index)

        if result then
            if recipe.client?.after then
                recipe.client.after(recipe)
            end
        end
    end)
end)

local function addRecipe(id, recipe, sync)
    recipe.server = nil
    RECIPES[id] = recipe

    if sync then return end

    lib.callback.await('dragCraft:server:addRecipe', false, id, recipe, true)
end

lib.callback.register('dragCraft:client:addRecipe', addRecipe)
exports('addRecipe', addRecipe)
