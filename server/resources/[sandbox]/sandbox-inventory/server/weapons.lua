_weaponModels = {}

-- The weapon row each player last drew or holstered through Items.Use (the
-- "Weapons" use in server/startup.lua): the only gun whose ammo they may save
-- once it has left their inventory (Weapon:Server:UpdateAmmoDiff).
_lastWeaponUsed = {}

local _attachmentBusy = {}
local _throwing = {}
local _flashThrows = {}
local FLASH_WINDOW_MS = 10000
local FLASH_MAX_DISTANCE = 40.0

local weaponCheaters = {
	[`WEAPON_ANIMAL`] = "Animal",
	[`WEAPON_COUGAR`] = "Cougar",
	[`WEAPON_ADVANCEDRIFLE`] = "Advanced Rifle",
	[`WEAPON_APPISTOL`] = "AP Pistol",
	[`WEAPON_ASSAULTRIFLE`] = "Assault Rifle",
	[`WEAPON_ASSAULTRIFLE_MK2`] = "Assault Rifke Mk2",
	[`WEAPON_ASSAULTSHOTGUN`] = "Assault Shotgun",
	[`WEAPON_ASSAULTSMG`] = "Assault SMG",
	[`WEAPON_AUTOSHOTGUN`] = "Automatic Shotgun",
	[`WEAPON_BULLPUPRIFLE`] = "Bullpup Rifle",
	[`WEAPON_BULLPUPRIFLE_MK2`] = "Bullpup Rifle Mk2",
	[`WEAPON_BULLPUPSHOTGUN`] = "Bullpup Shotgun",
	[`WEAPON_CARBINERIFLE`] = "Carbine Rifle",
	[`WEAPON_CARBINERIFLE_MK2`] = "PD .762",
	[`WEAPON_COMBATMG`] = "Combat MG",
	[`WEAPON_COMBATMG_MK2`] = "Combat MG Mk2",
	[`WEAPON_COMBATPDW`] = "Combat PDW",
	[`WEAPON_COMBATPISTOL`] = "Combat Pistol",
	[`WEAPON_COMPACTRIFLE`] = "Compact Rifle",
	[`WEAPON_DBSHOTGUN`] = "Double Barrel Shotgun",
	[`WEAPON_DOUBLEACTION`] = "Double Action Revolver",
	[`WEAPON_FLAREGUN`] = "Flare gun",
	[`WEAPON_GUSENBERG`] = "Gusenberg",
	[`WEAPON_HEAVYPISTOL`] = "Heavy Pistol",
	[`WEAPON_HEAVYSHOTGUN`] = "Heavy Shotgun",
	[`WEAPON_HEAVYSNIPER`] = "Heavy Sniper",
	[`WEAPON_HEAVYSNIPER_MK2`] = "Heavy Sniper",
	[`WEAPON_MACHINEPISTOL`] = "Machine Pistol",
	[`WEAPON_MARKSMANPISTOL`] = "Marksman Pistol",
	[`WEAPON_MARKSMANRIFLE`] = "Marksman Rifle",
	[`WEAPON_MARKSMANRIFLE_MK2`] = "Marksman Rifle Mk2",
	[`WEAPON_GLOCK19`] = "PD F19",
	[`WEAPON_GLOCK19_CIV`] = "F19",
	[`WEAPON_FNX45`] = "SB 45 Tactical",
	[`WEAPON_HK416B`] = ".556 LR",
	[`WEAPON_BEANBAG`] = "PD Beanbag",
	[`WEAPON_TASER`] = "Taser",
	[`WEAPON_MG`] = "MG",
	[`WEAPON_MICROSMG`] = "Micro SMG",
	[`WEAPON_MAC10`] = "MAC 10",
	[`WEAPON_MINIGUN`] = "Minigun",
	[`WEAPON_MINISMG`] = "Mini SMG",
	[`WEAPON_MUSKET`] = "Musket",
	[`WEAPON_PISTOL`] = "Pistol",
	[`WEAPON_PISTOL_MK2`] = "PD 9MM",
	[`WEAPON_PISTOL50`] = "Pistol .50",
	[`WEAPON_PUMPSHOTGUN`] = "Pump Shotgun",
	[`WEAPON_PUMPSHOTGUN_MK2`] = "Pump Shotgun Mk2",
	[`WEAPON_RAILGUN`] = "Railgun",
	[`WEAPON_REVOLVER`] = "Revolver",
	[`WEAPON_REVOLVER_MK2`] = "Revolver Mk2",
	[`WEAPON_SAWNOFFSHOTGUN`] = "Sawnoff Shotgun",
	[`WEAPON_SMG`] = "SMG",
	[`WEAPON_SMG_MK2`] = "SIG MPX",
	[`WEAPON_SNIPERRIFLE`] = "Sniper Rifle",
	[`WEAPON_SNIPERRIFLE2`] = "Hunting Rifle",
	[`WEAPON_SNSPISTOL`] = "SNS Pistol",
	[`WEAPON_SNSPISTOL_MK2`] = "SNS Pistol Mk2",
	[`WEAPON_SPECIALCARBINE`] = "Special Carbine",
	[`WEAPON_SPECIALCARBINE_MK2`] = "Special Carbine Mk2",
	[`WEAPON_STINGER`] = "Stinger",
	[`WEAPON_STUNGUN`] = "Stungun",
	[`WEAPON_VINTAGEPISTOL`] = "Vintage Pistol",
	[`VEHICLE_WEAPON_PLAYER_LASER`] = "Vehicle Lasers",
	[`WEAPON_FIRE`] = "Fire",
	[`WEAPON_FLARE`] = "Flare",
	[`WEAPON_FLAREGUN`] = "Flaregun",
	[`WEAPON_MOLOTOV`] = "Molotov",
	[`WEAPON_PETROLCAN`] = "Petrol Can",
	[`WEAPON_HELI_CRASH`] = "Helicopter Crash",
	[`WEAPON_RAMMED_BY_CAR`] = "Rammed by Vehicle",
	[`WEAPON_RUN_OVER_BY_CAR`] = "Ranover by Vehicle",
	[`VEHICLE_WEAPON_SPACE_ROCKET`] = "Vehicle Space Rocket",
	[`VEHICLE_WEAPON_TANK`] = "Tank",
	[`WEAPON_AIRSTRIKE_ROCKET`] = "Airstrike Rocket",
	[`WEAPON_AIR_DEFENCE_GUN`] = "Air Defence Gun",
	[`WEAPON_COMPACTLAUNCHER`] = "Compact Launcher",
	[`WEAPON_EXPLOSION`] = "Explosion",
	[`WEAPON_FIREWORK`] = "Firework",
	[`WEAPON_GRENADE`] = "Grenade",
	[`WEAPON_GRENADELAUNCHER`] = "Grenade Launcher",
	[`WEAPON_HOMINGLAUNCHER`] = "Homing Launcher",
	[`WEAPON_PASSENGER_ROCKET`] = "Passenger Rocket",
	[`WEAPON_PIPEBOMB`] = "Pipe bomb",
	[`WEAPON_PROXMINE`] = "Proximity Mine",
	[`WEAPON_RPG`] = "RPG",
	[`WEAPON_STICKYBOMB`] = "Sticky Bomb",
	[`WEAPON_VEHICLE_ROCKET`] = "Vehicle Rocket",
	[`WEAPON_BZGAS`] = "BZ Gas",
	[`WEAPON_FIREEXTINGUISHER`] = "Fire Extinguisher",
	[`WEAPON_SMOKEGRENADE`] = "Smoke Grenade",
	[`WEAPON_BATTLEAXE`] = "Battleaxe",
	[`WEAPON_BOTTLE`] = "Bottle",
	[`WEAPON_KNIFE`] = "Knife",
	[`WEAPON_MACHETE`] = "Machete",
	[`WEAPON_SWITCHBLADE`] = "Switch Blade",
	[`OBJECT`] = "Object",
	[`VEHICLE_WEAPON_ROTORS`] = "Vehicle Rotors",
	[`WEAPON_BALL`] = "Ball",
	[`WEAPON_BAT`] = "Bat",
	[`WEAPON_CROWBAR`] = "Crowbar",
	[`WEAPON_FLASHLIGHT`] = "Flashlight",
	[`WEAPON_GOLFCLUB`] = "Golfclub",
	[`WEAPON_HAMMER`] = "Hammer",
	[`WEAPON_HATCHET`] = "Hatchet",
	[`WEAPON_HIT_BY_WATER_CANNON`] = "Water Cannon",
	[`WEAPON_KNUCKLE`] = "Knuckle",
	[`WEAPON_NIGHTSTICK`] = "Night Stick",
	[`WEAPON_POOLCUE`] = "Pool Cue",
	[`WEAPON_SNOWBALL`] = "Snowball",
	[`WEAPON_UNARMED`] = "Fist",
	[`WEAPON_WRENCH`] = "Wrench",
	[`WEAPON_DROWNING`] = "Drowned",
	[`WEAPON_DROWNING_IN_VEHICLE`] = "Drowned in Vehicle",
	[`WEAPON_BARBED_WIRE`] = "Barbed Wire",
	[`WEAPON_BLEEDING`] = "Bleed",
	[`WEAPON_ELECTRIC_FENCE`] = "Electric Fence",
	[`WEAPON_EXHAUSTION`] = "Exhaustion",
	[`WEAPON_FALL`] = "Falling",
	[`WEAPON_KATANA`] = "Katana",
	[`WEAPON_SHIV`] = "Shiv",
	[`WEAPON_AR15`] = "SB556A1",
	[`WEAPON_AR15_PD`] = "PD SB556A1",
	[`WEAPON_P90FM`] = "P90",
	[`WEAPON_SLEDGEHAMMER`] = "Sledge Hammer",
	[`WEAPON_LUCILLE`] = "Bat",
	[`WEAPON_DRBAT`] = "Bat",
	[`WEAPON_CRUTCH`] = "Crutch",
	[`WEAPON_PONY`] = "Pony",
	[`WEAPON_SHOVEL`] = "Shovel",
	[`WEAPON_FIVESEVEN`] = "Six Eight",
	[`WEAPON_BENELLIM2`] = "BM2",
	[`WEAPON_BENELLIM2_PD`] = "PD BM2",
	[`WEAPON_DOUBLEBARRELFM`] = "Double Barrel",
	[`WEAPON_M249`] = "M249",
	[`WEAPON_FM1_HK416`] = "Hk416",
	[`WEAPON_FM2_HK416`] = "Hk416",
	[`WEAPON_HK417`] = "HK417",
	[`WEAPON_FM1_M9A3`] = "M9A3",
	[`WEAPON_FM1_HONEYBADGER`] = "Honey Badger",
	[`WEAPON_AK74_1`] = "AK 74",
	[`WEAPON_AK74_2`] = "AK 74",
	[`WEAPON_ASVAL`] = "AS-VAL",
	[`WEAPON_MCXRATTLER`] = "MCX Rattler",
	[`WEAPON_MCXSPEAR`] = "MCX Spear",
	[`WEAPON_MK14`] = "MK14",
	[`WEAPON_MK47BANSHEE2`] = "MK-47 Fullauto",
	[`WEAPON_MK47BANSHEE`] = "MK-47 Semi",
	[`WEAPON_MK47FM`] = "MK-47 Mutant",
	[`WEAPON_NSR9`] = "NSR9",
	[`WEAPON_PM4`] = "M4",
	[`WEAPON_RFB`] = "RFB",
	[`WEAPON_AK47`] = "AK-47",
	[`WEAPON_SA80`] = "L95",
	[`WEAPON_MB47`] = "AK-47M",
	[`WEAPON_G36`] = "G36",
	[`WEAPON_PP19`] = "PP-19",
	[`WEAPON_MPX`] = "MP 9mm",
	[`WEAPON_MINIUZI`] = 'Mini UZI',
	[`WEAPON_MP9A`] = 'MP9',
	[`WEAPON_MP5`] = "SB54",
	[`WEAPON_VECTOR`] = "Vector",
	[`WEAPON_HKUMP`] = "UMP-45",
	[`WEAPON_HKUMP_PD`] = "PD UMP-45",
	[`WEAPON_L5`] = "Desert Eagle K8",
	[`WEAPON_2011`] = "2011 Tactical",
	[`WEAPON_38SNUBNOSE`] = "PD .38 Snubnose",
	[`WEAPON_38SNUBNOSE2`] = ".38 Snubnose",
	[`WEAPON_38SNUBNOSE2`] = ".38 Snubnose",
	[`WEAPON_38SPECIAL`] = ".38 Special",
	[`WEAPON_44MAGNUM`] = ".44 Magnum",
	[`WEAPON_44MAGNUM_PD`] = "PD .44 Magnum",
	[`WEAPON_FM1_CZ75`] = "CZ69",
	[`WEAPON_FN509`] = "SB-509",
	[`WEAPON_SWMP9`] = "S&B9",
	[`WEAPON_FM1_P226`] = "P226",
	[`WEAPON_FIVESEVEN_PD`] = "PD Six Eight",
	[`WEAPON_FM1_P226_PD`] = "PD P226",
	[`WEAPON_2011_PD`] = "PD 2011 Tactical",
}

function tableContains(tbl, value)
	for k, v in ipairs(tbl or {}) do
		if v == value then
			return true
		end
	end
	return false
end

AddEventHandler("Weapons:Shared:DependencyUpdate", WeaponsComponents)
function WeaponsComponents()
	Fetch = exports["sandbox-base"]:FetchComponent("Fetch")
	Logger = exports["sandbox-base"]:FetchComponent("Logger")
	Inventory = exports["sandbox-base"]:FetchComponent("Inventory")
	Weapons = exports["sandbox-base"]:FetchComponent("Weapons")
	Middleware = exports["sandbox-base"]:FetchComponent("Middleware")
	Callbacks = exports["sandbox-base"]:FetchComponent("Callbacks")
	Pwnzor = exports["sandbox-base"]:FetchComponent("Pwnzor")
end

AddEventHandler("Core:Shared:Ready", function()
	exports["sandbox-base"]:RequestDependencies("Weapons", {
		"Fetch",
		"Logger",
		"Inventory",
		"Weapons",
		"Middleware",
		"Callbacks",
		"Pwnzor",
	}, function(error)
		if #error > 0 then
			return
		end
		WeaponsComponents()

		Callbacks:RegisterServerCallback("Weapons:UseThrowable", function(source, data, cb)
			local char = Fetch:CharacterSource(source)
			if char == nil or type(data) ~= "table" then
				return cb(false)
			end

			local sid = char:GetData("SID")
			local slot = math.tointeger(tonumber(data.Slot) or 0)
			_throwing[source] = true

			-- The slot the client threw from must really hold that throwable, and
			-- one of them has to be used up before the throw counts.
			local s = slot ~= nil and slot > 0 and INVENTORY:GetSlot(sid, slot, 1) or nil
			local thrown = s ~= nil
				and s.Name == data.Name
				and itemsDatabase[s.Name] ~= nil
				and itemsDatabase[s.Name].isThrowable
				and INVENTORY.Items:RemoveSlot(sid, s.Name, 1, slot, 1)

			if thrown and s.Name == "WEAPON_FLASHBANG" then
				_flashThrows[source] = _flashThrows[source] or {}
				table.insert(_flashThrows[source], GetGameTimer())
			end
			_throwing[source] = nil

			if not thrown then
				TriggerClientEvent("Weapons:Client:ForceUnequip", source)
				return cb(false)
			end

			if not INVENTORY:SlotExists(sid, slot, 1) then
				TriggerClientEvent("Weapons:Client:ForceUnequip", source)
			end
			cb(true)
		end)

		Callbacks:RegisterServerCallback("Weapons:PossibleCheaterWarning", function(source, data, cb)
			local char = Fetch:CharacterSource(source)
			if char then
				Logger:Warn("Pwnzor", string.format("%s %s (%s) Had a Weapon They Weren't Supposed To (%s) (Known: %s)", char:GetData("First"), char:GetData("Last"), char:GetData("SID"), data.h, weaponCheaters[data.h] or "No"), {
					console = true,
					file = false,
					database = true,
					discord = {
						embed = true,
						type = 'error',
						webhook = GetConvar('discord_pwnzor_webhook', ''),
					}
				}, {
					data = data
				})
				Pwnzor:Screenshot(char:GetData("SID"), "Potential Weapon Exploit")
			end
      		cb()
		end)
	end)
end)

AddEventHandler("Characters:Server:PlayerDropped", function(source)
	local plyr = Fetch:Source(source)
	local ped = GetPlayerPed(source)
	for k, v in ipairs(GetAllObjects()) do
		if GetEntityAttachedTo(v) == ped and _weaponModels[GetEntityModel(v)] then
			DeleteEntity(v)
		end
	end

	_lastWeaponUsed[source] = nil
	_throwing[source] = nil
	_flashThrows[source] = nil
end)

-- Asks the client and waits for its answer, giving up after timeoutMs: a
-- progress bar that cannot start ("Already Doing An Action") never answers,
-- and a use waiting on it would hold the player's item lock. nil = no answer.
function AwaitClientCallback(source, event, data, timeoutMs)
	local p = promise.new()
	local settled = false
	local function settle(answer)
		if not settled then
			settled = true
			p:resolve({ answer })
		end
	end
	Callbacks:ClientCallback(source, event, data, settle)
	SetTimeout(timeoutMs or 15000, settle)
	return Citizen.Await(p)[1]
end

-- Row ids arrive from clients: only plain whole numbers are looked up.
local function validId(id)
	if type(id) == "number" then
		return id > 0 and id == math.floor(id)
	end
	return type(id) == "string" and id:match("^%d+$") ~= nil
end

-- The row, if it is one of this character's own weapons in their pockets, and
-- its decoded MetaData (row.MetaData stays the raw JSON string).
function GetOwnWeapon(id, sid)
	if not validId(id) then
		return nil
	end
	local row = INVENTORY:GetItem(id)
	local def = row ~= nil and itemsDatabase[row.Name] or nil
	if def == nil or def.type ~= 2 or tostring(row.Owner) ~= tostring(sid) or tonumber(row.invType) ~= 1 then
		return nil
	end
	return row, json.decode(row.MetaData or "{}") or {}
end

local function takeOffAttachment(source, slotId, attachment)
	local char = Fetch:CharacterSource(source)
	if char == nil then
		return false
	end

	local sid = char:GetData("SID")
	local slot = INVENTORY:GetSlot(sid, slotId, 1)
	local def = slot ~= nil and itemsDatabase[slot.Name] or nil
	local comps = def ~= nil and def.type == 2 and slot.MetaData.WeaponComponents or nil
	local comp = type(comps) == "table" and comps[attachment] or nil
	if type(comp) ~= "table" or comp.item == nil then
		return false
	end

	local itemData = Inventory.Items:GetData(comp.item)
	if itemData == nil then
		return false
	end

	-- Cleared by the same statement that checks it is still fitted, so two
	-- requests can never both get the attachment back.
	local path = string.format('$.WeaponComponents."%s"', attachment)
	local cleared = MySQL.update.await(
		"UPDATE inventory SET information = JSON_REMOVE(information, ?) WHERE id = ? AND owner = ? AND type = 1 AND JSON_CONTAINS_PATH(information, 'one', ?) AND JSON_UNQUOTE(JSON_EXTRACT(information, ?)) = ?",
		{ path, slot.id, tostring(sid), path, path .. ".item", comp.item }
	) or 0
	if cleared < 1 then
		return false
	end

	INVENTORY:AddItem(sid, itemData.name, 1, {}, 1, false, false, false, false, false, comp.created or os.time())

	comps[attachment] = nil
	local now = INVENTORY:GetItem(slot.id)
	if now ~= nil then
		TriggerClientEvent("Inventory:Client:UpdateMetadata", source, now.Slot, now.MetaData, "WeaponComponents")
	end
	TriggerClientEvent("Weapons:Client:UpdateAttachments", source, comps)
	return true
end

WEAPONS = {
	IsEligible = function(self, source)
		local char = Fetch:CharacterSource(source)
		local licenses = char:GetData("Licenses")
		if licenses ~= nil and licenses.Weapons ~= nil then
			return licenses.Weapons.Active
		else
			return false
		end
	end,
	Save = function(self, source, id, ammo, clip)
		-- Only these two keys: rewriting the whole blob from an older read could
		-- put back an attachment that was taken off in between.
		MySQL.update.await("UPDATE inventory SET information = JSON_SET(information, '$.ammo', ?, '$.clip', ?) WHERE id = ?", {
			ammo,
			clip,
			id,
		})
	end,
	Purchase = function(self, sid, item, isScratched, isCompanyOwned)
		if not isCompanyOwned then
			local char = Fetch:SID(sid)
			if char ~= nil then
				local hash = GetHashKey(item.name)
				local sn = string.format("SA-%s-%s", math.abs(hash), Sequence:Get(item.name))
				local model = nil
				if itemsDatabase[item.name] then
					model = itemsDatabase[item.name].label
				end

				if isScratched == nil then
					isScratched = false
				end

				MySQL.insert('INSERT INTO firearms (serial, scratched, model, item, owner_sid, owner_name) VALUES(?, ?, ?, ?, ?, ?)', {
					sn,
					isScratched,
					model,
					item.name,
					sid,
					string.format("%s %s", char:GetData("First"), char:GetData("Last"))
				})

				return sn
			end
		else
			local hash = GetHashKey(item.name)
			local sn = string.format("SA-%s-%s", math.abs(hash), Sequence:Get(item.name))
			local model = nil
			if itemsDatabase[item.name] then
				model = itemsDatabase[item.name].label
			end

			if isScratched == nil then
				isScratched = false
			end

			local flags = nil
			if isCompanyOwned.stolen then
				flags = {
					{
						Date = os.time() * 1000,
						Type = "stolen",
						Description = "Stolen In Armed Robbery"
					}
				}
			end

			MySQL.insert('INSERT INTO firearms (serial, scratched, model, item, owner_name) VALUES(?, ?, ?, ?, ?)', {
				sn,
				isScratched,
				model,
				item.name,
				isCompanyOwned.name
			})
			
			return sn
		end
	end,
	GetComponentItem = function(self, type, component)
		for k, v in pairs(itemsDatabase) do
			if v.component ~= nil and v.component.type == type and v.component.string == component then
				return v.name
			end
		end
		return nil
	end,
	EquipAttachment = function(self, source, item)
		local char = Fetch:CharacterSource(source)
		if char == nil then
			return false
		end
		local sid = char:GetData("SID")

		local data = AwaitClientCallback(source, "Weapons:Check", {}, 15000)
		if not data then
			Execute:Client(source, "Notification", "Error", "No Weapon Equipped")
			return false
		end

		-- The client only says which gun it has out: it must be this character's
		-- own weapon, in their pockets, of that name.
		local weapon = type(data) == "table" and GetOwnWeapon(data.id, sid) or nil
		if weapon == nil or weapon.Name ~= data.item then
			Execute:Client(source, "Notification", "Error", "No Weapon Equipped")
			return false
		end

		local itemData = Inventory.Items:GetData(item.Name)
		local weaponData = Inventory.Items:GetData(weapon.Name)
		if itemData == nil or itemData.component == nil then
			Execute:Client(source, "Notification", "Error", "Something Was Not Defined")
			return false
		end

		local attachment = itemData.component.strings[weaponData.weapon or weaponData.name]
		if attachment == nil then
			Execute:Client(source, "Notification", "Error", "This Does Not Fit On This Weapon")
			return false
		end

		if AwaitClientCallback(source, "Weapons:EquipAttachment", itemData.label, 20000) ~= true then
			return false
		end

		-- The bar gave time to move things around: read the gun again.
		local slotData, md = GetOwnWeapon(weapon.id, sid)
		if slotData == nil then
			return false
		end
		local fitted = (md.WeaponComponents or {})[itemData.component.type]
		if fitted ~= nil and fitted.attachment == attachment then
			Execute:Client(source, "Notification", "Error", "Attachment Already Equipped")
			return false
		end

		-- Use the attachment up first; nothing is fitted unless it is really gone.
		if not INVENTORY.Items:RemoveSlot(item.Owner, item.Name, 1, item.Slot, 1) then
			return false
		end

		local comps, replaced, encoded
		for _ = 1, 3 do
			comps = table.copy(md.WeaponComponents or {})
			replaced = comps[itemData.component.type]
			comps[itemData.component.type] = {
				type = itemData.component.type,
				item = item.Name,
				created = item.CreateDate,
				attachment = attachment,
			}
			md.WeaponComponents = comps
			local candidate = json.encode(md)

			-- Written only over the information just read, so an attachment taken
			-- off (or ammo saved) in between is never put back by this older copy.
			local changed = MySQL.update.await("UPDATE inventory SET information = ? WHERE id = ? AND owner = ? AND type = 1 AND information = ?", {
				candidate,
				slotData.id,
				tostring(sid),
				slotData.MetaData,
			}) or 0
			if changed > 0 then
				encoded = candidate
				break
			end

			slotData, md = GetOwnWeapon(weapon.id, sid)
			if slotData == nil then
				break
			end
		end

		if encoded == nil then
			-- The gun left or kept changing: give the attachment back as it was.
			INVENTORY:AddItem(item.Owner, item.Name, 1, item.MetaData or {}, 1, false, false, false, false, item.Slot, item.CreateDate, item.Quality, true)
			return false
		end

		if replaced ~= nil and replaced.item ~= nil then
			local returnData = Inventory.Items:GetData(replaced.item)
			if returnData?.component?.returnItem then
				INVENTORY:AddItem(item.Owner, replaced.item, 1, {}, 1, false, false, false, false, false, replaced.created or os.time())
			end
		end

		TriggerClientEvent("Inventory:Client:UpdateMetadata", source, slotData.Slot, encoded, "WeaponComponents")

		Wait(400)

		SetGunPropData(source, sid, getInventory(source, sid, 1, false), true)
		TriggerClientEvent("Weapons:Client:UpdateAttachments", source, comps)

		return true
	end,
	RemoveAttachment = function(self, source, slotId, attachment)
		slotId = math.tointeger(tonumber(slotId) or 0)
		if slotId == nil or slotId < 1 or type(attachment) ~= "string" or not attachment:match("^[%w_]+$") then
			return false
		end

		-- One removal at a time per player.
		if _attachmentBusy[source] then
			return false
		end
		_attachmentBusy[source] = true
		local ok, res = pcall(takeOffAttachment, source, slotId, attachment)
		_attachmentBusy[source] = nil

		if not ok then
			Logger:Error("Weapons", string.format("Removing attachment %s failed: %s", attachment, tostring(res)))
			return false
		end
		return res
	end,
}

AddEventHandler("Proxy:Shared:RegisterReady", function()
	exports["sandbox-base"]:RegisterComponent("Weapons", WEAPONS)
end)

local MAX_AMMO = 9999

-- Ammo counts arrive from the client; accept only sane integers.
local function sanitizeAmmo(value)
	local n = tonumber(value)
	if n == nil or n ~= n or n < 0 or n > MAX_AMMO then
		return nil
	end
	return math.floor(n)
end

-- Sets only the ammo/clip keys of a gun's row. update(row, def, ammo, clip) is
-- given the stored values and returns the new ones (nil leaves the row alone);
-- the write lands only over the information it was worked out from, else it
-- is worked out again, so a concurrent load or save is never lost.
local function updateWeaponAmmo(id, update)
	if not validId(id) then
		return false
	end
	for _ = 1, 3 do
		local row = INVENTORY:GetItem(id)
		local def = row ~= nil and itemsDatabase[row.Name] or nil
		if def == nil or def.type ~= 2 or def.isThrowable then
			return false
		end

		local md = json.decode(row.MetaData or "{}") or {}
		local ammo, clip = update(row, def, math.floor(tonumber(md.ammo) or 0), math.floor(tonumber(md.clip) or 0))
		if ammo == nil then
			return false
		end

		local changed = MySQL.update.await("UPDATE inventory SET information = JSON_SET(information, '$.ammo', ?, '$.clip', ?) WHERE id = ? AND information = ?", {
			ammo,
			clip,
			row.id,
			row.MetaData,
		}) or 0
		if changed > 0 then
			return true
		end
	end
	return false
end

-- A client reports what is left after firing, so it can only lower the stored
-- ammo; the clip never holds more than the total.
local function lowerAmmo(ammo, clip, stored, storedClip)
	ammo = math.min(ammo, stored)
	clip = math.min(clip, ammo)
	if ammo == stored and clip == storedClip then
		return nil
	end
	return ammo, clip
end

-- Loads count rounds into one of this character's own guns in their pockets,
-- if it takes that ammo type. The only way stored ammo goes up; called by the
-- ammo use in server/startup.lua once the box is gone.
function AddWeaponAmmo(id, sid, ammoType, count)
	return updateWeaponAmmo(id, function(row, def, ammo, clip)
		if def.ammoType ~= ammoType or tostring(row.Owner) ~= tostring(sid) or tonumber(row.invType) ~= 1 then
			return nil
		end
		local loaded = math.min(ammo + count, MAX_AMMO)
		if loaded <= ammo then
			return nil
		end
		return loaded, clip
	end)
end

RegisterNetEvent("Weapon:Server:UpdateAmmo", function(itemId, ammo, clip)
	local src = source
	ammo, clip = sanitizeAmmo(ammo), sanitizeAmmo(clip)
	local char = Fetch:CharacterSource(src)
	if ammo == nil or clip == nil or char == nil then
		return
	end

	local sid = tostring(char:GetData("SID"))
	updateWeaponAmmo(itemId, function(row, def, stored, storedClip)
		-- Only the character's own gun, in their pockets.
		if tostring(row.Owner) ~= sid or tonumber(row.invType) ~= 1 then
			return nil
		end
		return lowerAmmo(ammo, clip, stored, storedClip)
	end)
end)

RegisterNetEvent("Weapon:Server:UpdateAmmoDiff", function(diff, ammo, clip)
	local src = source
	ammo, clip = sanitizeAmmo(ammo), sanitizeAmmo(clip)
	-- Sent when the equipped gun has just been moved out of this player's
	-- inventory, so it has to be the gun they last drew; checked and cleared
	-- before anything yields, so it is accepted once.
	local last = _lastWeaponUsed[src]
	if ammo == nil or clip == nil or type(diff) ~= "table" or last == nil or tostring(diff.id) ~= tostring(last) then
		return
	end
	_lastWeaponUsed[src] = nil

	updateWeaponAmmo(last, function(row, def, stored, storedClip)
		return lowerAmmo(ammo, clip, stored, storedClip)
	end)
end)

RegisterNetEvent("Weapons:Server:RemoveAttachment", function(slotId, attachment)
	Weapons:RemoveAttachment(source, slotId, attachment)
end)

-- One flash per flashbang this player threw (Weapons:UseThrowable) in the
-- last FLASH_WINDOW_MS.
local function takeFlashThrow(src)
	local thrown = _flashThrows[src]
	local now = GetGameTimer()
	while thrown ~= nil and #thrown > 0 do
		if now - table.remove(thrown, 1) <= FLASH_WINDOW_MS then
			return true
		end
	end
	return false
end

RegisterNetEvent("Weapons:Server:DoFlashFx", function(coords, netId)
	local src = source
	if type(coords) ~= "vector3" and type(coords) ~= "table" then
		return
	end
	local x, y, z = tonumber(coords.x), tonumber(coords.y), tonumber(coords.z)
	if x == nil or y == nil or z == nil then
		return
	end

	-- The throw is reported first; give a slow Weapons:UseThrowable a moment.
	local waitUntil = GetGameTimer() + 3000
	while _throwing[src] and (_flashThrows[src] == nil or #_flashThrows[src] == 0) and GetGameTimer() < waitUntil do
		Wait(100)
	end

	-- Only where the thrower could have thrown it.
	local pos = vector3(x, y, z)
	local ped = GetPlayerPed(src)
	if ped == 0 or not (#(GetEntityCoords(ped) - pos) <= FLASH_MAX_DISTANCE) or not takeFlashThrow(src) then
		return
	end

	TriggerEvent("Particles:Server:DoFx", pos, "flash")
	TriggerClientEvent("Weapons:Client:DoFlashFx", -1, x, y, z, 10000, 8, 20.0, tonumber(netId) or 0, 25, 1.6)
end)