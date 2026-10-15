RegisterNetEvent("Ped:EnterCreator", function()
	local routeId = Routing:RequestRouteId("ped:" .. source)
	Routing:AddPlayerToRoute(source, routeId)
end)

RegisterNetEvent("Ped:LeaveCreator", function()
	Routing:RoutePlayerToGlobalRoute(source)
end)
