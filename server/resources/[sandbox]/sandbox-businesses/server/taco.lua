local _currentCookItem = nil
local _deliveryCounter = 0
local _queueReserved = 0 -- AddToQueue calls that hold a queue slot while their item is being removed
local _pendingDelivery = {} -- [SID] = true while a character holds an undelivered bag from Tacos:Pickup
local _itemCount = 1
local _dropOffItem = "taco_bag"
local _maxRolls = 10
local _maxBands = 3
local _stationDistance = 5.0 -- queue / pickup zones are small boxes the player stands in
local _dropOffDistance = 10.0 -- delivery target is a 1m box used from up to 3m away

local function IsNearTacoDropOff(source)
	local pedCoords = GetEntityCoords(GetPlayerPed(source))
	for _, dropOff in ipairs(_tacoDropOffs) do
		if #(pedCoords - dropOff.coords) <= _dropOffDistance then
			return true
		end
	end
	return false
end

AddEventHandler("Businesses:Server:Startup", function()
	-- Init cook stuff
	_currentCookItem = math.random(#_tacoFoodItems)
	GlobalState["TacoShop:Counter"] = _deliveryCounter
	GlobalState["TacoShop:CurrentItem"] = _currentCookItem
	TriggerClientEvent("Taco:SetQueue", -1, { counter = _deliveryCounter, item = _currentCookItem })

	-- Create storage
	if _tacoConfig.storage then
		for _, storage in pairs(_tacoConfig.storage) do
			Inventory.Poly:Create(storage)
		end
	end

	Reputation:Create("TacoDelivery", "Taco Delivery", {
		{ label = "Rank 1", value = 500 },
		{ label = "Rank 2", value = 1000 },
		{ label = "Rank 3", value = 2500 },
		{ label = "Rank 4", value = 4000 },
		{ label = "Rank 5", value = 5000 },
		{ label = "Pls Stop", value = 7500 },
	}, false) -- hidden rep

	Reputation:Create("TacoCrafter", "Taco Artist", {
		{ label = "Rank 1", value = 500 },
		{ label = "Rank 2", value = 1000 },
		{ label = "Rank 3", value = 2500 },
		{ label = "Rank 4", value = 4000 },
		{ label = "Rank 5", value = 5000 },
		{ label = "Pls Stop", value = 7500 },
	}, false) -- hidden rep

	Crafting:RegisterBench("TacoShopFood", "Taco Farmer Prep Table", {
		actionString = "Packaging",
		icon = "taco",
		poly = {
			coords = vector3(9.81, -1600.51, 29.38),
			w = 1.8,
			l = 0.8,
			options = {
				name = "TacoShopFood",
				heading = 320,
				--debugPoly=true,
				minZ = 26.18,
				maxZ = 30.18,
			},
		},
	}, {}, {
		shared = true,
	}, {
		{
			result = { name = "beef_taco", count = 4 },
			items = {
				{ name = "taco_cheese", count = 2 },
				{ name = "taco_beef", count = 2 },
				{ name = "taco_tortilla", count = 4 },
			},
			time = 3000,
			animation = "mechanic",
		},
		{
			result = { name = "tostada", count = 4 },
			items = {
				{ name = "taco_cheese", count = 2 },
				{ name = "taco_beef", count = 2 },
				{ name = "taco_tortilla", count = 4 },
			},
			time = 3000,
			animation = "mechanic",
		},
		{
			result = { name = "quesadilla", count = 4 },
			items = {
				{ name = "taco_cheese", count = 2 },
				{ name = "taco_chicken", count = 2 },
				{ name = "taco_tortilla", count = 4 },
			},
			time = 3000,
			animation = "mechanic",
		},
		{
			result = { name = "burrito", count = 4 },
			items = {
				{ name = "taco_cheese", count = 2 },
				{ name = "taco_chicken", count = 2 },
				{ name = "taco_tortilla", count = 4 },
			},
			time = 3000,
			animation = "mechanic",
		},
		{
			result = { name = "enchilada", count = 4 },
			items = {
				{ name = "taco_cheese", count = 2 },
				{ name = "taco_beef", count = 2 },
				{ name = "taco_tortilla", count = 4 },
			},
			time = 3000,
			animation = "mechanic",
		},
		{
			result = { name = "carne_asada", count = 4 },
			items = {
				{ name = "taco_cheese", count = 2 },
				{ name = "taco_steak", count = 4 },
			},
			time = 3000,
			animation = "mechanic",
		},
		{
			result = { name = "torta", count = 4 },
			items = {
				{ name = "taco_cheese", count = 2 },
				{ name = "taco_chicken", count = 2 },
				{ name = "torta_roll", count = 4 },
			},
			time = 3000,
			animation = "mechanic",
		},
	})

	Crafting:RegisterBench("TacoShopDrinks", "Taco Farmer Fountain Drinks", {
		actionString = "Pouring",
		icon = "glass",
		poly = {
			coords = vector3(7.5, -1606.48, 29.38),
			w = 0.8,
			l = 1.8,
			options = {
				name = "TacoShopDrinks",
				heading = 320,
				--debugPoly=true,
				minZ = 29.18,
				maxZ = 30.58,
			},
		},
	}, {}, {
		shared = true,
	}, {
		{
			result = { name = "jugo", count = 4 },
			items = {
				{ name = "taco_plastic_cups", count = 4 },
			},
			time = 2000,
			animation = "mechanic",
		},
		{
			result = { name = "taco_soda", count = 4 },
			items = {
				{ name = "taco_plastic_cups", count = 4 },
			},
			time = 2000,
			animation = "mechanic",
		},
	})

	Callbacks:RegisterServerCallback("Taco:GetNewQueueItem", function(source, data, cb)
		_currentCookItem = math.random(#_tacoFoodItems)
		GlobalState["TacoShop:Counter"] = _deliveryCounter
		GlobalState["TacoShop:CurrentItem"] = _currentCookItem
		TriggerClientEvent("Taco:SetQueue", -1, { counter = _deliveryCounter, item = _currentCookItem })
		cb(true)
	end)

	Callbacks:RegisterServerCallback("Taco:SetState", function(source, data, cb)
		TriggerClientEvent("Taco:PickupState", -1, data)
		cb(true)
	end)

	Callbacks:RegisterServerCallback("Tacos:AddToQueue", function(source, data, cb)
		local char = Fetch:CharacterSource(source)
		if char then
			-- The server owns the order: only the item currently being asked for can be bagged.
			local cookItem = _tacoFoodItems[_currentCookItem]
			if
				not cookItem
				or type(data) ~= "table"
				or data.item ~= cookItem.item
				or #(GetEntityCoords(GetPlayerPed(source)) - _tacoQueue.coords) > _stationDistance
			then
				return cb(false)
			end

			local count = Inventory.Items:GetCount(char:GetData("SID"), 1, cookItem.item) or 0
			if count > 0 and _deliveryCounter + _queueReserved < _tacoQueue.maxQueue then
				local itemData = Inventory.Items:GetData(cookItem.item)

				-- hold the queue slot while Remove yields so parallel calls cannot overfill the queue
				_queueReserved = _queueReserved + 1
				local removed = itemData and Inventory.Items:Remove(char:GetData("SID"), 1, cookItem.item, _itemCount)
				_queueReserved = _queueReserved - 1

				if removed then
					_deliveryCounter = _deliveryCounter + 1

					local _tacoArtistCash = math.random(15, 30)
					local repLevel = Reputation:GetLevel(source, "TacoCrafter") or 0
					if repLevel > 0 then
						_tacoArtistCash = math.floor(_tacoArtistCash * repLevel)
					end
					Wallet:Modify(source, _tacoArtistCash)
					Reputation.Modify:Add(source, "TacoCrafter", 1)

					cb(true)
				else
					cb(false)
				end
			else
				cb(false)
			end
		end
	end)

	Callbacks:RegisterServerCallback("Tacos:Pickup", function(source, data, cb)
		local char = Fetch:CharacterSource(source)
		if char then
			-- A bag only exists for an order that is waiting in the queue, collected at the pickup counter.
			if
				_deliveryCounter < 1
				or #(GetEntityCoords(GetPlayerPed(source)) - _tacoPickUp.coords) > _stationDistance
			then
				-- the client set the shared pickup state to 1 before calling; release it so others aren't locked out
				TriggerClientEvent("Taco:PickupState", -1, { state = 0 })
				return cb(false)
			end

			_deliveryCounter = _deliveryCounter - 1 -- claim the order before AddItem yields
			local given = Inventory:AddItem(char:GetData("SID"), _dropOffItem, 1, {}, 1)
			if given then
				_pendingDelivery[char:GetData("SID")] = true
			else
				_deliveryCounter = _deliveryCounter + 1
				TriggerClientEvent("Taco:PickupState", -1, { state = 0 })
			end
			GlobalState["TacoShop:Counter"] = _deliveryCounter
			GlobalState["TacoShop:CurrentItem"] = _currentCookItem
			TriggerClientEvent("Taco:SetQueue", -1, { counter = _deliveryCounter, item = _currentCookItem })
			cb(given and true or false)
		end
	end)

	Callbacks:RegisterServerCallback("Tacos:Dropoff", function(source, data, cb)
		local char = Fetch:CharacterSource(source)
		if char then
			local sid = char:GetData("SID")
			-- Pay only for a bag this character collected from the queue, handed over at a delivery point.
			if not _pendingDelivery[sid] or not IsNearTacoDropOff(source) then
				return cb(false)
			end
			_pendingDelivery[sid] = nil -- claim the delivery before anything yields

			local count = Inventory.Items:GetCount(sid, 1, _dropOffItem) or 0
			if count > 0 then
				local itemData = Inventory.Items:GetData(_dropOffItem)

				if itemData and Inventory.Items:Remove(sid, 1, _dropOffItem, _itemCount) then
					local repLevel = Reputation:GetLevel(source, "TacoDelivery") or 0
					local repGained = 1
					local _tacoDeliveryCash = math.random(15, 30)
					if repLevel > 0 then
						_tacoDeliveryCash = math.floor(_tacoDeliveryCash * repLevel)
					end

					if Inventory.Items:Has(char:GetData("SID"), 1, "moneyroll", 1) then
						local _moneyRollCount = Inventory.Items:GetCount(char:GetData("SID"), 1, "moneyroll")
						local itemDataMoneyRoll = Inventory.Items:GetData("moneyroll")
						if _moneyRollCount >= _maxRolls then
							if
								itemDataMoneyRoll
								and Inventory.Items:Remove(char:GetData("SID"), 1, "moneyroll", _maxRolls)
							then
								local _moneyRollOutput = math.floor(
									((_tacoConfig.tacoPricing[repLevel] / 100) * itemDataMoneyRoll.price) * _maxRolls
								)
								_tacoDeliveryCash = _tacoDeliveryCash + _moneyRollOutput
								repGained = repGained + math.random(3)
							end
						end
					elseif Inventory.Items:Has(char:GetData("SID"), 1, "moneyband", 1) then
						local _moneyBandCount = Inventory.Items:GetCount(char:GetData("SID"), 1, "moneyband")
						local itemDataMoneyBand = Inventory.Items:GetData("moneyband")
						if _moneyBandCount >= _maxBands then
							if
								itemDataMoneyBand
								and Inventory.Items:Remove(char:GetData("SID"), 1, "moneyband", _maxBands)
							then
								local _moneyBandOutput = math.floor(
									((_tacoConfig.tacoPricing[repLevel] / 100) * itemDataMoneyBand.price) * _maxBands
								)
								_tacoDeliveryCash = _tacoDeliveryCash + _moneyBandOutput
								repGained = repGained + math.random(3)
							end
						end
					end

					Wallet:Modify(source, _tacoDeliveryCash)
					Reputation.Modify:Add(source, "TacoDelivery", repGained)

					cb(true)
				else
					_pendingDelivery[sid] = true
					cb(false)
				end
			else
				_pendingDelivery[sid] = true
				cb(false)
			end
		end
	end)
end)
