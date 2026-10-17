-- Which world object stands in for an item lying on the ground or in flight.
-- Lookup order: exact item name, then a word in the name, then the weapon's
-- own model, then the item type, then a paper bag. Any model the game does not
-- have is skipped, so a wrong name here only costs the fallback.

local BY_NAME = {
	water = "prop_ld_flow_bottle",
	soda = "prop_ecola_can",
	energy_pepe = "prop_energy_drink",
	coffee = "p_amb_coffeecup_01",
	latte = "p_amb_coffeecup_01",
	beer = "prop_amb_beer_bottle",
	wine_bottle = "prop_wine_bot_01",
	whiskey = "prop_whiskey_bottle",
	vodka = "prop_vodka_bottle",
	tequila = "prop_tequila_bottle",
	rum = "prop_rum_bottle",
	sandwich = "prop_sandwich_01",
	donut = "prop_donut_01",
	hotdog = "prop_cs_hotdog_01",
	chocolate_bar = "prop_choc_ego",
	chips = "prop_food_chips",
	popcorn = "prop_popcorn_01",
	phone = "prop_npc_phone_02",
	radio = "prop_cs_hand_radio",
	radio_shitty = "prop_cs_hand_radio",
	radio_extendo = "prop_cs_hand_radio",
	gps = "prop_cs_tablet",
	laptop = "prop_laptop_01a",
	megaphone = "prop_megaphone_01",
	cigarette = "prop_cs_ciggy_01",
	cigarette_pack = "prop_cigar_pack_01",
	bandage = "prop_ld_health_pack",
	firstaid = "prop_ld_health_pack",
	medicalkit = "prop_ld_health_pack",
	traumakit = "prop_ld_health_pack",
	ifak = "prop_ld_health_pack",
	armor = "prop_armour_pickup",
	heavyarmor = "prop_armour_pickup",
	pdarmor = "prop_armour_pickup",
	moneybag = "prop_money_bag_01",
	briefcase_cash = "prop_ld_case_01",
	moneyroll = "prop_anim_cash_pile_01",
	moneyband = "prop_anim_cash_pile_01",
	goldbar = "prop_gold_bar",
	goldcoins = "prop_gold_bar",
	silverbar = "prop_gold_bar",
	lockpick = "prop_tool_screwdvr01",
	repairkit = "prop_tool_box_04",
	repairkitadv = "prop_tool_box_04",
	fishing_rod = "prop_fishing_rod_01",
	gascan = "w_am_jerrycan",
	tv = "prop_tv_flat_02",
	big_tv = "prop_tv_flat_01",
	boombox = "prop_boombox_01",
	microwave = "prop_micro_01",
	golfclubs = "prop_golf_bag_01",
	pc = "prop_pc_01a",
	camping_chair = "prop_skid_chair_01",
	bowling_ball = "prop_bowling_ball",
	cardboard_box = "prop_cs_cardbox_01",
	parts_box = "prop_cs_cardbox_01",
	packaged_parts = "prop_cs_cardbox_01",
	paper_bag = "prop_paper_bag_small",
	burgershot_bag = "prop_paper_bag_small",
	taco_bag = "prop_paper_bag_small",
	foodbag = "prop_paper_bag_small",
	present = "prop_xmas_present_01",
	present_daily = "prop_xmas_present_01",
	scuba_gear = "p_s_scuba_tank_s",
	plastic = "prop_cs_rub_binbag_01",
	scrapmetal = "prop_rub_scrap_06",
	ironbar = "prop_gold_bar",
	govid = "p_ld_id_card_01",
	government_badge = "p_ld_id_card_01",
	fleeca_card = "p_ld_id_card_01",
}

-- First match wins, so put the more specific words first.
local BY_WORD = {
	{ "steak", "prop_cs_steak" },
	{ "onion_rings", "prop_food_bs_chips" },
	{ "rusty_", "prop_donut_01" },
	{ "cupcake", "prop_donut_01" },
	{ "burger", "prop_cs_burger_01" },
	{ "fries", "prop_food_bs_chips" },
	{ "pizza", "prop_pizza_box_01" },
	{ "taco", "prop_taco_01" },
	{ "donut", "prop_donut_01" },
	{ "sandwich", "prop_sandwich_01" },
	{ "coffee", "p_amb_coffeecup_01" },
	{ "latte", "p_amb_coffeecup_01" },
	{ "tea", "p_amb_coffeecup_01" },
	{ "shake", "prop_food_bs_juice01" },
	{ "smoothie", "prop_food_bs_juice01" },
	{ "drink", "prop_food_bs_juice01" },
	{ "cup", "prop_food_bs_juice01" },
	{ "shot", "prop_cs_shot_glass" },
	{ "glass", "prop_cs_shot_glass" },
	{ "weed", "bkr_prop_weed_bag_01a" },
	{ "joint", "p_cs_joint_01" },
	{ "meth", "prop_meth_bag_01" },
	{ "coke", "prop_coke_block_half_a" },
	{ "brick", "prop_coke_block_01" },
	{ "baggy", "prop_meth_bag_01" },
	{ "chain", "p_jewel_necklace_02" },
	{ "ring", "prop_jewel_02a" },
	{ "watch", "prop_jewel_02a" },
	{ "rolex", "prop_jewel_02a" },
	{ "ore", "prop_rock_5_smash1" },
	{ "fishing_", "prop_fish_slice_01" },
	{ "repair_part", "prop_car_engine_01" },
	{ "upgrade_", "prop_car_engine_01" },
	{ "sign_", "prop_sign_road_01a" },
	{ "case_", "prop_ld_case_01" },
	{ "bait", "prop_paper_bag_small" },
	{ "seed", "prop_paper_bag_small" },
	{ "AMMO_", "prop_ld_ammo_pack_01" },
	{ "ATTCH_", "prop_box_ammo04a" },
	{ "BOBCAT_", "prop_box_guncase_01a" },
	{ "radio", "prop_cs_hand_radio" },
	{ "phone", "prop_npc_phone_02" },
	{ "plates", "p_num_plate_01" },
}

local BY_TYPE = {
	[1] = "prop_paper_bag_small", -- consumable
	[3] = "prop_tool_box_04", -- tool
	[4] = "prop_cs_cardbox_01", -- crafting ingredient
	[5] = "prop_cs_package_01", -- collectable
	[6] = "prop_cs_rub_binbag_01", -- junk
	[8] = "prop_cs_envolope_01", -- evidence
	[9] = "prop_ld_ammo_pack_01", -- ammunition
	[10] = "prop_cs_heist_bag_02", -- container
	[11] = "prop_cs_package_01", -- gem
	[12] = "prop_cs_package_01", -- paraphernalia
	[13] = "prop_cs_cardbox_01", -- wearable
	[14] = "prop_cs_package_01", -- contraband
	[15] = "p_jewel_necklace_02", -- gang chain
	[16] = "prop_box_ammo04a", -- weapon attachment
	[17] = "p_amb_clipboard_01", -- schematic
	[18] = "prop_npc_phone_02", -- device
	[19] = "prop_cs_package_01", -- explosive device
}

local FALLBACKS = { "prop_paper_bag_small", "prop_cs_cardbox_01" }

local _cache = {}

local function usable(model)
	if model == nil or model == 0 then
		return nil
	end
	local hash = type(model) == "number" and model or GetHashKey(model)
	if IsModelInCdimage(hash) and IsModelValid(hash) then
		return hash
	end
	return nil
end

local function weaponModel(name, def)
	local weapon = def?.weapon or name
	if type(weapon) ~= "string" or not weapon:find("^WEAPON_") then
		return nil
	end
	return usable(GetWeapontypeModel(GetHashKey(weapon)))
end

-- Model hash for an item name; never nil once the base game is loaded.
function DropModelFor(name)
	if _cache[name] ~= nil then
		return _cache[name]
	end

	local def = _items[name]
	local hash = usable(BY_NAME[name])

	if hash == nil then
		for _, pair in ipairs(BY_WORD) do
			if name:find(pair[1], 1, true) then
				hash = usable(pair[2])
				if hash ~= nil then
					break
				end
			end
		end
	end

	if hash == nil then
		hash = weaponModel(name, def)
	end

	if hash == nil and def ~= nil then
		hash = usable(BY_TYPE[def.type])
	end

	if hash == nil then
		for _, model in ipairs(FALLBACKS) do
			hash = usable(model)
			if hash ~= nil then
				break
			end
		end
	end

	_cache[name] = hash
	return hash
end

-- Load a model, giving up after two seconds.
function LoadDropModel(hash)
	if hash == nil then
		return false
	end
	if HasModelLoaded(hash) then
		return true
	end
	RequestModel(hash)
	local timeout = GetGameTimer() + 2000
	while not HasModelLoaded(hash) do
		if GetGameTimer() > timeout then
			return false
		end
		Wait(10)
	end
	return true
end
