-- Keeps each dropzone's shown items in step with the rows it holds, and
-- removes zones that are empty. Anything that changes a ground inventory
-- (type 10) calls MarkDropzone; a pass a moment later reads the rows once and
-- tells every client (client/drops.lua draws the objects).

local SYNC_INTERVAL_MS = 300
local SHOWN_ITEMS = 3
local NEW_ZONE_GRACE_MS = 5000

local _dirty = {}

-- Total weight stored in one inventory, read from the rows themselves.
function StoredWeight(owner, invType)
	local rows = MySQL.rawExecute.await(
		"SELECT item_id AS Name, COUNT(*) AS Count FROM inventory WHERE owner = ? AND type = ? GROUP BY item_id",
		{ tostring(owner), invType }
	) or {}

	local total = 0
	for _, row in ipairs(rows) do
		local def = itemsDatabase[row.Name]
		if def ~= nil then
			total += (def.weight or 0) * row.Count
		end
	end
	return total
end

function MarkDropzone(id)
	if id ~= nil then
		_dirty[tostring(id)] = true
	end
end

local function findArea(id)
	for k, v in ipairs(_dropzones) do
		if v.id == id then
			return k, v
		end
	end
	return nil, nil
end

function SyncDropzone(id)
	local _, area = findArea(id)
	if area == nil then
		return
	end

	local rows = MySQL.rawExecute.await(
		"SELECT item_id AS Name, MIN(slot) AS Slot FROM inventory WHERE owner = ? AND type = 10 GROUP BY item_id ORDER BY Slot ASC LIMIT ?",
		{ id, SHOWN_ITEMS }
	) or {}

	if #rows == 0 then
		-- A zone made a moment ago may still be waiting for its first rows
		-- (a throw or an overflow writes them after a few queries): look again.
		if area.created ~= nil and GetGameTimer() - area.created < NEW_ZONE_GRACE_MS then
			_dirty[tostring(id)] = true
			return
		end
		-- Look the zone up again: the query yielded, so the list may have moved.
		local k = findArea(id)
		if k ~= nil and not _doingThings[string.format("%s-%s", id, 10)] then
			table.remove(_dropzones, k)
			TriggerClientEvent("Inventory:Client:RemoveDropzone", -1, id)
		end
		return
	end

	local items = {}
	for _, row in ipairs(rows) do
		table.insert(items, row.Name)
	end

	if table.concat(items, ",") ~= table.concat(area.items or {}, ",") then
		area.items = items
		TriggerClientEvent("Inventory:Client:UpdateDropzone", -1, id, items)
	end
end

CreateThread(function()
	while true do
		Wait(SYNC_INTERVAL_MS)
		if next(_dirty) ~= nil then
			local batch = _dirty
			_dirty = {}
			for id in pairs(batch) do
				SyncDropzone(id)
			end
		end
	end
end)
