_justBoughtFuckingBike = {}

function CreateBikeStands()
	for k, v in ipairs(BikeStandLocations) do
		if v.interactionPed then
			PedInteraction:Add(
				"bike_stand_" .. k,
				v.interactionPed.model,
				v.coords,
				v.interactionPed.heading,
				v.interactionPed.range,
				{
					{
						icon = "bicycle",
						text = "Bicycle Stand",
						event = "BikeStands:Client:Open",
						data = { location = k },
					},
				},
				"bicycle",
				v.interactionPed.scenario
			)
		end
	end
end

function CreateBikeStandBlips()
	for k, v in ipairs(BikeStandLocations) do
		if v.blip then
			Blips:Add("bike_stand_" .. k, "Bicycle Stand", v.coords, v.blip.sprite, v.blip.color, v.blip.scale)
		end
	end
end

AddEventHandler("BikeStands:Client:Open", function(entityData, data)
	if _justBoughtFuckingBike[data.location] then
		return Notification:Error("You Just Bought a Bike off Me! Weirdo!")
	end

	local menuData = {
		main = {
			label = "Bicycle Stand - Purchase a Bicycle",
			items = {},
		},
	}

	for k, v in ipairs(BikeStandBikes) do
		table.insert(menuData.main.items, {
			label = v.name,
			description = "Purchase for $" .. v.price .. " Cash",
			event = "BikeStands:Client:Purchase",
			data = { location = data.location, bike = k },
		})
	end

	ListMenu:Show(menuData)
end)

AddEventHandler("BikeStands:Client:Purchase", function(data)
	if data and data.location and data.bike then
		local bikeData = BikeStandBikes[data.bike]
		local locationData = BikeStandLocations[data.location]
		if not bikeData or not locationData then
			return
		end

		Callbacks:ServerCallback("BikeStand:Purchase", {
			bike = data.bike,
			location = data.location,
		}, function(success)
			if success then
				_justBoughtFuckingBike[data.location] = true
				Notification:Success(string.format("Purchased %s, It Has Been Brought out for You.", bikeData.name))
			else
				Notification:Error("Purchase Failed")
			end
		end)
	end
end)
