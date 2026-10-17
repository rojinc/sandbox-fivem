-- After the server refuses a move it resends both inventories, so a grid the
-- UI updated optimistically goes back to what the server holds.
RegisterNetEvent("Inventory:Client:Resync", function(player, secondary)
	if not Inventory.Set.Player.Data.Open then
		return
	end

	local data = {}
	if player ~= nil then
		data.player = { inventory = player }
	end
	if secondary ~= nil and Inventory.Set.Secondary.Data.Open then
		data.secondary = { inventory = secondary }
	end
	SendNUIMessage({
		type = "SET_INVENTORIES",
		data = data,
	})
end)
