_recipes = {}
_cooldowns = {}

_schematics = _schematics or {}
_publicSchemData = {}

_benchSchems = {}
_playerSchems = {}

AddEventHandler("Proxy:Shared:RegisterReady", function()
	exports["sandbox-base"]:RegisterComponent("Crafting", CRAFTING)
end)

_types = {}
_inProg = {}

--[[
    Location for types
]]

-- Dear lua, die.
function deepcopy(orig)
	local orig_type = type(orig)
	local copy
	if orig_type == "table" then
		copy = {}
		for orig_key, orig_value in next, orig, nil do
			copy[deepcopy(orig_key)] = deepcopy(orig_value)
		end
		setmetatable(copy, deepcopy(getmetatable(orig)))
	else -- number, string, boolean, etc
		copy = orig
	end
	return copy
end

function RemoveCraftingCooldown(source, bench, id)
	local plyr = Fetch:Source(source)
	if plyr ~= nil then
		local char = Fetch:CharacterSource(source)
		if plyr.Permissions:IsAdmin() then
			if char ~= nil then
				if _cooldowns[bench] ~= nil then
					Logger:Info("Crafting", string.format("%s %s (%s) Reset Cooldown %s on bench %s", char:GetData("First"), char:GetData("Last"), char:GetData("SID"), id, bench))
					Chat.Send.Server:Single(source, "Cooldown Removed From Bench")
					_cooldowns[bench][id] = nil
					MySQL.query('DELETE FROM crafting_cooldowns WHERE bench = ? AND id = ?', { bench, id })
				else
					Logger:Info("Crafting", string.format("%s %s (%s) Attempted To Remove Cooldown %s From Non-Existent Bench %s", char:GetData("First"), char:GetData("Last"), char:GetData("SID"), id, bench))
					Chat.Send.Server:Single(source, "Not A Valid Bench")
				end
			end
		elseif char ~= nil then
			Logger:Info("Crafting", string.format("%s %s (%s) Attempted To Remove Cooldown %s From Bench %s", char:GetData("First"), char:GetData("Last"), char:GetData("SID"), id, bench))
		end
	end
end

-- Cooldown expiry times are epoch milliseconds everywhere (memory, DB, UI).
function LoadCraftingCooldowns()
	CreateThread(function()
		local cds = MySQL.query.await('SELECT * FROM crafting_cooldowns WHERE expires > ?', { os.time() * 1000 })

		for k, v in ipairs(cds or {}) do
			_cooldowns[v.bench] = _cooldowns[v.bench] or {}
			_cooldowns[v.bench][v.id] = v.expires
		end
	end)
end

local _cdThreading = false
function CleanupExpiredCooldowns()
	if _cdThreading then return end
	_cdThreading = true

	CreateThread(function()
		while _cdThreading do
			local nowMs = os.time() * 1000
			for k, v in pairs(_cooldowns) do
				for k2, v2 in pairs(v) do
					if v2 < nowMs then
						_cooldowns[k][k2] = nil
					end
				end
			end

			MySQL.query('DELETE FROM crafting_cooldowns WHERE expires < ?', { nowMs }, function(d)
				if d.affectedRows > 0 then
					Logger:Info("Inventory", string.format("Remove ^2%s^7 Expired Crafting Cooldowns", d.affectedRows))
				end
			end)
			Wait(60000)
		end
	end)
end

function InsertCooldown(bench, key, expires)
	_cooldowns[bench] = _cooldowns[bench] or {}

	MySQL.insert('INSERT INTO crafting_cooldowns (bench, id, expires) VALUES(?, ?, ?)', { bench, key, expires })
	_cooldowns[bench][key] = expires
end

-- How far (m) from a bench's targeting point a player may craft or learn.
local BENCH_RANGE = 6.0
local _schemLocks = {}

-- Any one of interior / char / job / rep grants access. `shared` only opens a
-- bench that sets none of them, so it no longer skips e.g. a rep requirement.
local function HasBenchAccess(source, char, bench)
	local r = bench.restrictions
	if not r then
		return true
	end

	if r.interior ~= nil and r.interior == GlobalState[string.format("%s:Property", source)] then
		return true
	end
	if r.char ~= nil and r.char == char:GetData("SID") then
		return true
	end
	if
		r.job ~= nil
		and Jobs.Permissions:HasJob(
			source,
			r.job.id,
			r.job.workplace,
			r.job.grade,
			false,
			r.job.reqDuty,
			r.job.permissionKey or "JOB_CRAFTING"
		)
	then
		return true
	end
	if r.rep ~= nil and (Reputation:GetLevel(source, r.rep.id) or 0) >= r.rep.level then
		return true
	end

	return r.shared and r.interior == nil and r.char == nil and r.job == nil and r.rep == nil or false
end

-- The targeting box centre when there is one (business benches register a
-- placeholder location), else the registered location; nil when neither exists.
local function GetBenchCoords(bench)
	local poly = type(bench.targeting) == "table" and bench.targeting.poly or nil
	if poly ~= nil and poly.coords ~= nil then
		local size = ((tonumber(poly.w) or 0) + (tonumber(poly.l) or 0)) / 2
		return vector3(poly.coords.x + 0.0, poly.coords.y + 0.0, poly.coords.z + 0.0), BENCH_RANGE + size
	end

	local loc = bench.location
	local t = type(loc)
	if (t == "table" or t == "vector3" or t == "vector4") and tonumber(loc.x) and tonumber(loc.y) and tonumber(loc.z) then
		return vector3(loc.x + 0.0, loc.y + 0.0, loc.z + 0.0), BENCH_RANGE
	end

	return nil
end

local function IsNearBench(source, bench)
	-- Property benches have no position: they are used from inside that property.
	local propertyId = type(bench.id) == "string" and string.match(bench.id, "^property%-(.+)$") or nil
	if propertyId ~= nil and not bench.location then
		local inside = GlobalState[string.format("%s:Property", source)]
		return inside ~= nil and tostring(inside) == propertyId
	end

	local coords, range = GetBenchCoords(bench)
	if coords == nil then
		-- Manually opened benches (business jewellery tables) register no position
		-- server-side; they stay gated by their job restriction.
		return true
	end

	local ped = GetPlayerPed(source)
	if not ped or ped == 0 then
		return false
	end
	return #(GetEntityCoords(ped) - coords) <= range
end

local function StartCraft(crafterSource, crafter, bench, schemId, qty)
	if _types[bench] == nil then
		return { error = true, message = "Invalid Bench" }
	end

	qty = math.tointeger(tonumber(qty))
	if qty == nil or qty < 1 or qty > 50 then
		return { error = true, message = "Invalid Quantity" }
	end

	local recipies = _types[bench].recipes
	if _types[bench].isPubSchemTable then
		local t = GetCharacterPublicSchems(crafter, false)
		recipies = {}
		for k, v in ipairs(t[_types[bench].isPubSchemTable] or {}) do
			if itemsDatabase[v]?.schematic ~= nil and _schematics[itemsDatabase[v]?.schematic] ~= nil then
				local f = table.copy(_schematics[itemsDatabase[v]?.schematic])
				f.id = v
				table.insert(recipies, f)
			end
		end
	end

	local recipe = nil
	for k, v in pairs(recipies or {}) do
		if v.id == schemId then
			recipe = v
			break
		end
	end

	if recipe == nil then
		return { error = true, message = "Invalid Recipe" }
	end

	-- A recipe with a cooldown makes one per cooldown.
	if recipe.cooldown then
		qty = 1
	end

	local reagents = {}
	for k, v in ipairs(recipe.items) do
		if reagents[v.name] ~= nil then
			reagents[v.name] = reagents[v.name] + (v.count * qty)
		else
			reagents[v.name] = v.count * qty
		end
	end

	local makingItem = recipe.result
	local reqSlotPerItem = itemsDatabase[makingItem.name].isStackable or 1
	local totalRequiredSlots = math.ceil((makingItem.count * qty) / reqSlotPerItem)
	local freeSlots = INVENTORY:GetFreeSlotNumbers(crafter, 1)
	if #freeSlots < totalRequiredSlots then
		return { error = true, message = "Inventory Full" }
	end

	-- Every ingredient is checked before anything is removed.
	for k, v in pairs(reagents) do
		if not INVENTORY.Items:Has(crafter, 1, k, v) then
			return { error = true, message = "Missing Ingredients" }
		end
	end

	local cdBench = bench
	if _types[bench].isPubSchemTable then
		cdBench = string.format("%s:%s", bench, crafter)
	end

	if _cooldowns[cdBench] and _cooldowns[cdBench][schemId] ~= nil and _cooldowns[cdBench][schemId] > (os.time() * 1000) then
		return { error = true, message = "Recipe On Cooldown" }
	end

	-- Set straight after the check (no yield in between) and before any removal,
	-- so concurrent requests cannot all pass the cooldown check.
	if recipe.cooldown then
		InsertCooldown(cdBench, recipe.id, (os.time() * 1000) + recipe.cooldown)
	end

	for k, v in pairs(reagents) do
		if not INVENTORY.Items:Remove(crafter, 1, k, v, true) then
			Logger:Warn("Crafting", string.format("Failed Removing %sx %s From %s While Crafting %s On %s", v, k, crafter, recipe.id, bench))
			return { error = true, message = "Missing Ingredients" }
		end
	end

	local p = promise.new()

	CreateThread(function()
		local meta = {}
		if itemsDatabase[recipe.result.name].type == 2 and not itemsDatabase[recipe.result.name].noSerial then
			meta.Scratched = true
		end

		if INVENTORY:AddItem(crafter, recipe.result.name, recipe.result.count * qty, meta, 1) then
			local inv = getInventory(crafterSource, crafter, 1)
			p:resolve({
				inventory = inv,
				cooldowns = _cooldowns[cdBench],
			})
		else
			p:resolve(nil)
		end
	end)

	return Citizen.Await(p)
end

-- Reads the schematic row server-side, refuses one the learner already knows,
-- and only teaches it once that exact row has been deleted.
local function LearnSchematic(source, sid, benchId, rowId)
	local row = MySQL.single.await('SELECT id, item_id FROM inventory WHERE id = ? AND owner = ? AND type = 1', {
		rowId,
		tostring(sid),
	})

	local itemData = row ~= nil and itemsDatabase[row.item_id] or nil
	if itemData == nil or itemData.schematic == nil or _schematics[itemData.schematic] == nil then
		return false
	end

	if Crafting.Schematics:Has(benchId, row.item_id, sid) then
		Execute:Client(source, "Notification", "Error", "Schematic Already Learned")
		return false
	end

	if not INVENTORY.Items:RemoveId(sid, 1, { id = row.id, Name = row.item_id }) then
		return false
	end

	if not Crafting.Schematics:Add(benchId, row.item_id, sid) then
		Logger:Error("Crafting", string.format("Schematic %s Consumed But Not Learned By %s On %s", row.item_id, sid, benchId))
		return false
	end

	return true
end

CRAFTING = {
	RegisterBench = function(self, id, label, targeting, location, restrictions, recipes, canUseSchematics, isPubSchemTable)
		while not itemsLoaded do
			Wait(10)
		end

		_cooldowns[id] = _cooldowns[id] or {}
		_types[id] = {
			id = id,
			label = label,
			targeting = targeting,
			location = location,
			restrictions = restrictions,
			recipes = {},
			canUseSchematics = canUseSchematics or false,
			isPubSchemTable = isPubSchemTable or false,
		}

		for k, v in pairs(recipes) do
			if itemsDatabase[v.result.name] ~= nil then
				v.id = string.format("%s", k)
				table.insert(_types[id].recipes, v)
			end
		end

		if not isPubSchemTable then
			_benchSchems[id] = {}
			local t = MySQL.rawExecute.await('SELECT schematic FROM bench_schematics WHERE bench = ?', {
				id,
			})

			for k, v in ipairs(t) do
				if itemsDatabase[v.schematic]?.schematic ~= nil and _schematics[itemsDatabase[v.schematic]?.schematic] ~= nil then
					local f = table.copy(_schematics[itemsDatabase[v.schematic].schematic])
					f.id = v.schematic
					table.insert(_types[id].recipes, f)
					table.insert(_benchSchems[id], v.schematic)
				end
			end
		end
	end,
	Craft = {
		-- One craft at a time per crafter; the lock is released on every path.
		Start = function(self, crafterSource, crafter, bench, schemId, qty)
			if crafter == nil or _inProg[crafter] then
				return { error = true, message = "Already Crafting" }
			end

			_inProg[crafter] = true
			local ok, res = pcall(StartCraft, crafterSource, crafter, bench, schemId, qty)
			_inProg[crafter] = nil

			if not ok then
				Logger:Error("Crafting", string.format("Craft Failed For %s On %s: %s", crafter, tostring(bench), tostring(res)))
				return { error = true, message = "Craft Failed" }
			end
			return res
		end,
	},
	Schematics = {
		-- `item` is the schematic item name (what bench_schematics / character_schematics store).
		Has = function(self, bench, item, stateID)
			if _types[bench] ~= nil then
				if _types[bench].isPubSchemTable then
					local known = GetCharacterPublicSchems(stateID, false)
					for k, v in ipairs(known[_types[bench].isPubSchemTable] or {}) do
						if v == item then
							return true
						end
					end
				else
					if _benchSchems[bench] ~= nil then
						for k, v in ipairs(_benchSchems[bench]) do
							if v == item then
								return true
							end
						end
					end
				end
			end
			return false
		end,
		HasAny = function(self, stateID, item)
			return MySQL.scalar.await('SELECT COUNT(*) AS count FROM character_schematics c WHERE c.sid = ? AND c.schematic = ?', {
				stateID,
				item,
			}) > 0
		end,
		Add = function(self, bench, item, stateID)
			if _types[bench] ~= nil and itemsDatabase[item]?.schematic ~= nil and _schematics[itemsDatabase[item].schematic] ~= nil then
				if not Crafting.Schematics:Has(bench, item, stateID) then
					if _types[bench].isPubSchemTable then
						local pubId = _types[bench].isPubSchemTable
						MySQL.insert.await('INSERT INTO character_schematics (sid, bench, schematic) VALUES(?, ?, ?)', {
							stateID,
							pubId,
							item
						})

						-- Only update the cache if it is still loaded; otherwise the next load reads the row.
						if _playerSchems[stateID] ~= nil then
							_playerSchems[stateID][pubId] = _playerSchems[stateID][pubId] or {}
							table.insert(_playerSchems[stateID][pubId], item)
						end
					else
						MySQL.insert.await('INSERT INTO bench_schematics (bench, schematic) VALUES(?, ?)', {
							bench,
							item
						})

						_benchSchems[bench] = _benchSchems[bench] or {}
						table.insert(_benchSchems[bench], item)

						local f = table.copy(_schematics[itemsDatabase[item].schematic])
						f.id = item
						table.insert(_types[bench].recipes, f)
					end

					return true
				end
			end

			return false
		end,
	},
	GetBench = function(self, source, benchId)
		local char = Fetch:CharacterSource(source)
		if char ~= nil then
			local bench = _types[benchId]
			if bench ~= nil and HasBenchAccess(source, char, bench) and IsNearBench(source, bench) then
				local recipies = bench.recipes
				local cooldowns = _cooldowns[benchId]
	
				if bench.isPubSchemTable then
					cooldowns = _cooldowns[string.format("%s:%s", benchId, char:GetData("SID"))]

					local all = GetCharacterPublicSchems(char:GetData("SID"), false)
					recipies = {}
					for k, v in ipairs(all[bench.isPubSchemTable] or {}) do
						if itemsDatabase[v]?.schematic ~= nil and _schematics[itemsDatabase[v].schematic] ~= nil then
							local t = deepcopy(_schematics[itemsDatabase[v].schematic])
							t.id = v
							table.insert(recipies, t)
						end
					end
				end

				return {
					recipes = recipies,
					cooldowns = cooldowns,
					canUseSchematics = bench.canUseSchematics,
				}
			else
				return nil
			end
		else
			return nil
		end
	end,
}

function RegisterCraftingCallbacks()
	Callbacks:RegisterServerCallback("Crafting:Craft", function(source, data, cb)
		local char = Fetch:CharacterSource(source)
		if char ~= nil and type(data) == "table" then
			local bench = _types[data.bench]
			if bench == nil then
				cb({ error = true, message = "Invalid Bench" })
			elseif not HasBenchAccess(source, char, bench) then
				cb({ error = true, message = "You Cannot Use This Bench" })
			elseif not IsNearBench(source, bench) then
				cb({ error = true, message = "Too Far From Bench" })
			else
				cb(Crafting.Craft:Start(source, char:GetData("SID"), data.bench, data.result, data.qty))
			end
		else
			cb(nil)
		end
	end)

	Callbacks:RegisterServerCallback("Crafting:GetSchematics", function(source, data, cb)
		local char = Fetch:CharacterSource(source)
		if char ~= nil and type(data) == "table" then
			local schems = INVENTORY.Items:GetAllOfType(char:GetData("SID"), 1, 17)
			local list = {}
			for k, v in pairs(schems) do
				local itemData = INVENTORY.Items:GetData(v.Name)
				if itemData?.schematic ~= nil and _schematics[itemData.schematic] ~= nil and not Crafting.Schematics:Has(data.id, v.Name, char:GetData("SID")) then
					local result = INVENTORY.Items:GetData(_schematics[itemData.schematic].result.name)
					if result ~= nil then
						table.insert(list, {
							label = itemData.label,
							description = string.format("Makes: x%s %s", _schematics[itemData.schematic].result.count, result.label),
							event = "Crafting:Client:UseSchematic",
							data = v,
						})
					end
				end
			end

			cb(list)
		else
			cb(false)
		end
	end)

	Callbacks:RegisterServerCallback("Crafting:UseSchematic", function(source, data, cb)
		local char = Fetch:CharacterSource(source)
		if char == nil or type(data) ~= "table" or type(data.schematic) ~= "table" then
			cb(false)
			return
		end

		local sid = char:GetData("SID")
		local bench = _types[data.bench]
		local rowId = math.tointeger(tonumber(data.schematic.id))
		if
			bench == nil
			or rowId == nil
			or not bench.canUseSchematics
			or not HasBenchAccess(source, char, bench)
			or not IsNearBench(source, bench)
		then
			cb(false)
			return
		end

		-- One learn at a time per target: the player's list on public tool benches, the bench otherwise.
		local lockKey = bench.isPubSchemTable and string.format("%s:%s", bench.id, sid) or bench.id
		if _schemLocks[lockKey] then
			cb(false)
			return
		end

		_schemLocks[lockKey] = true
		local ok, res = pcall(LearnSchematic, source, sid, bench.id, rowId)
		_schemLocks[lockKey] = nil

		if not ok then
			Logger:Error("Crafting", string.format("Learning Schematic Failed For %s On %s: %s", sid, bench.id, tostring(res)))
			res = false
		end

		if res then
			TriggerClientEvent("Crafting:Client:ForceBenchRefresh", source)
		end
		cb(res == true)
	end)
end

AddEventHandler("Characters:Server:PlayerLoggedOut", function(source, cData)
	if _playerSchems[cData.SID] then
		_playerSchems[cData.SID] = nil
	end
end)

AddEventHandler("Characters:Server:PlayerDropped", function(source, cData)
	if _playerSchems[cData.SID] then
		_playerSchems[cData.SID] = nil
	end
end)

function RegisterTestBench()
	for k, v in ipairs(CraftingTables) do
		Crafting:RegisterBench(
			string.format("crafting-%s", k),
			v.label,
			v.targetConfig,
			v.location,
			v.restriction,
			v.recipes
		)
	end
end

function RegisterPublicSchematicBenches()
	for k, v in ipairs(PublicSchematicTables) do
		Crafting:RegisterBench(
			string.format("public-%s", v.id),
			"Use Tool Bench",
			v.targetConfig,
			v.location,
			{ shared = true },
			{},
			true,
			v.id
		)
	end
end

function GetCharacterPublicSchems(stateID, forceRefresh)
	if _playerSchems[stateID] ~= nil and not forceRefresh then
		return _playerSchems[stateID]
	end

	-- Built locally and published after the query, so no caller sees a half-loaded list.
	local schems = {}

	local t = MySQL.rawExecute.await('SELECT sid, bench, schematic FROM character_schematics WHERE sid = ?', {
		stateID,
	})

	for k, v in ipairs(t or {}) do
		schems[v.bench] = schems[v.bench] or {}
		table.insert(schems[v.bench], v.schematic)
	end

	_playerSchems[stateID] = schems
	return schems
end

AddEventHandler("Jobs:Server:JobUpdate", function(source)
	TriggerClientEvent("Crafting:Client:ForceBenchRefresh", source)
end)