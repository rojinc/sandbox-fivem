-- Who may touch which inventory, and the checks every move, swap, merge and
-- purchase passes before any row changes.
--
-- The server records the one secondary inventory it opened for each player
-- (GetSecondary calls GrantSecondary). The move handlers then accept only the
-- player's own pockets or that granted inventory, from near where it was
-- opened, with slots, amounts, stack sizes and weight checked here rather
-- than trusted from the UI.

local GRANT_REACH = 12.0
local GROUND_REACH = 3.0
local POLY_REACH = 5.0
local BUSY_TIMEOUT_MS = 10000

local _grants = {}
local _groundRequests = {}
local _busy = {}

local function toInt(value)
	local n = tonumber(value)
	if n == nil then
		return nil
	end
	return math.tointeger(n)
end

local function pedCoords(source)
	return GetEntityCoords(GetPlayerPed(source))
end

local _containerTypes = nil
local function isContainerType(invType)
	if _containerTypes == nil then
		_containerTypes = {}
		for _, def in pairs(itemsDatabase) do
			if def.container ~= nil then
				_containerTypes[tonumber(def.container)] = true
			end
		end
	end
	return _containerTypes[tonumber(invType)] == true
end

--------------------------------------------------------------------- grants

-- GetSecondary calls this whenever it hands an inventory to a player.
function GrantSecondary(source, owner, invType, vehClass, vehModel, slotOverride, capacityOverride)
	local grant = {
		owner = tostring(owner),
		invType = tonumber(invType),
		coords = pedCoords(source),
		class = vehClass or false,
		model = vehModel or false,
		slotOverride = slotOverride or false,
		capacityOverride = capacityOverride or false,
	}

	if grant.invType == 10 then
		local req = _groundRequests[source]
		if req ~= nil and req.owner == grant.owner then
			grant.position = req.position
		else
			for _, zone in ipairs(_dropzones) do
				if zone.id == grant.owner then
					grant.position = zone.coords
					break
				end
			end
		end
		if grant.position == nil then
			-- Never leave a pile without a place to draw it: the player's feet.
			grant.position = { x = grant.coords.x, y = grant.coords.y, z = grant.coords.z - 0.99 }
		end
		_groundRequests[source] = nil
	end

	_grants[source] = grant
end

function RevokeSecondary(source, owner, invType)
	local grant = _grants[source]
	if grant ~= nil and grant.owner == tostring(owner) and grant.invType == tonumber(invType) then
		_grants[source] = nil
	end
end

-- The inventory screen closed: nothing stays reachable behind it.
function ClearGrant(source)
	_grants[source] = nil
	_groundRequests[source] = nil
end

function ReleaseAccess(source)
	_grants[source] = nil
	_groundRequests[source] = nil
	_busy[source] = nil
end

function GetGrant(source)
	return _grants[source]
end

-- Own pockets always; anything else only if it is the inventory the server
-- opened for this player and they are still near where they opened it.
function CanAccessInventory(source, owner, invType)
	local char = Fetch:CharacterSource(source)
	invType = tonumber(invType)
	if char == nil or owner == nil or invType == nil or LoadedEntitys[invType] == nil then
		return false, nil
	end

	if invType == 1 and tostring(owner) == tostring(char:GetData("SID")) then
		return true, nil
	end

	local grant = _grants[source]
	if grant == nil or grant.invType ~= invType or grant.owner ~= tostring(owner) then
		return false, nil
	end
	if #(pedCoords(source) - grant.coords) > GRANT_REACH then
		return false, nil
	end
	return true, grant
end

---------------------------------------------------- what the client may open

local function validGround(source, owner, position, route)
	local x, y, r = tostring(owner):match("^(%-?%d+):(%-?%d+):(%-?%d+)$")
	if x == nil or tonumber(r) ~= tonumber(route) then
		return false
	end

	local pos = pedCoords(source)
	-- An existing pile close by.
	for _, zone in ipairs(_dropzones) do
		if zone.id == tostring(owner) then
			local c = zone.coords
			if #(pos - vector3(c.x, c.y, c.z)) > GROUND_REACH then
				return false
			end
			_groundRequests[source] = { owner = tostring(owner), position = c }
			return true
		end
	end

	-- A new one at the player's feet: the id must come from that spot.
	if type(position) ~= "table" and type(position) ~= "vector3" then
		return false
	end
	local px, py, pz = tonumber(position.x), tonumber(position.y), tonumber(position.z)
	if px == nil or py == nil or pz == nil or #(pos - vector3(px, py, pz)) > GROUND_REACH then
		return false
	end
	if math.ceil(px) ~= tonumber(x) or math.ceil(py) ~= tonumber(y) then
		return false
	end

	_groundRequests[source] = { owner = tostring(owner), position = { x = px, y = py, z = pz } }
	return true
end

local function polyFor(owner, invType)
	for _, id in ipairs(_polyInvs) do
		local poly = GlobalState[string.format("Inventory:%s", id)]
		local inv = poly and poly.data and poly.data.inventory
		if inv ~= nil and tostring(inv.owner) == tostring(owner) and tonumber(inv.invType) == tonumber(invType) then
			return poly
		end
	end
	return nil
end

-- Inside (or just outside) the zone: centre plus the zone's own size.
local function nearPoly(source, poly)
	local pos = pedCoords(source)
	local cx, cy, size

	if poly.type == "poly" and type(poly.points) == "table" and #poly.points > 0 then
		cx, cy = 0.0, 0.0
		for _, pt in ipairs(poly.points) do
			cx, cy = cx + pt.x, cy + pt.y
		end
		cx, cy = cx / #poly.points, cy / #poly.points
		size = 0.0
		for _, pt in ipairs(poly.points) do
			size = math.max(size, math.sqrt((pt.x - cx) ^ 2 + (pt.y - cy) ^ 2))
		end
	elseif poly.coords ~= nil then
		cx, cy = poly.coords.x, poly.coords.y
		size = poly.radius or (math.max(poly.length or 0, poly.width or 0) / 2)
	else
		return false
	end

	local flat = math.sqrt((pos.x - cx) ^ 2 + (pos.y - cy) ^ 2)
	return flat <= size + POLY_REACH
end

-- Inventory:Server:Request: the client only ever asks for the glovebox it
-- sits in, the zone inventory it stands in, or the ground at its feet.
function ValidateSecondaryRequest(source, secondary)
	if type(secondary) ~= "table" then
		return false
	end
	local invType = toInt(secondary.invType)
	local owner = secondary.owner
	local entity = invType and LoadedEntitys[invType]
	if entity == nil or owner == nil then
		return false
	end

	if invType == 10 then
		return validGround(source, owner, secondary.position, Player(source).state.currentRoute)
	end

	if entity.isGlovebox then
		local veh = GetVehiclePedIsIn(GetPlayerPed(source), false)
		return veh ~= 0 and Entity(veh).state.VIN ~= nil and tostring(Entity(veh).state.VIN) == tostring(owner)
	end

	local poly = polyFor(owner, invType)
	if poly ~= nil then
		return nearPoly(source, poly)
	end

	return false
end

-- Inventory:Server:Open (other resources' configured storages): never
-- pockets, vehicles, the ground, shops or bags, which have their own paths.
function ValidateConfiguredOpen(source, data)
	if type(data) ~= "table" then
		return false
	end
	local invType = toInt(data.invType)
	local entity = invType and LoadedEntitys[invType]
	if entity == nil or data.owner == nil then
		return false
	end
	if invType == 1 or invType == 10 or entity.isTrunk or entity.isGlovebox or entity.shop or entity.playerShop or isContainerType(invType) then
		return false
	end
	return true
end

------------------------------------------------------------- one at a time

-- One inventory action per player at a time: moves, uses, gives and throws
-- never interleave, so no request can act on rows another is changing.
function TryBusy(source)
	local now = GetGameTimer()
	if _busy[source] ~= nil and now - _busy[source] < BUSY_TIMEOUT_MS then
		return false
	end
	_busy[source] = now
	return true
end

function ClearBusy(source)
	_busy[source] = nil
end

function IsBusy(source)
	return _busy[source] ~= nil and GetGameTimer() - _busy[source] < BUSY_TIMEOUT_MS
end

-- Wraps a (source, data, cb) handler: refuses while the player is busy or
-- using an item, answers exactly once, and always frees the player.
function WithPlayerLock(handler, reason)
	return function(source, data, cb)
		local answered = false
		local function answer(...)
			if not answered then
				answered = true
				cb(...)
			end
		end

		if IsUsingItem(source) then
			answer({ reason = "You are using an item. Wait for it to finish." })
			return RefuseTransfer(source, data)
		end
		if not TryBusy(source) then
			answer({ reason = reason or "Wait a moment and try again." })
			return RefuseTransfer(source, data)
		end

		local ok, err = pcall(handler, source, data, answer)
		ClearBusy(source)
		if not ok then
			Logger:Error("Inventory", string.format("Inventory action failed for %s: %s", source, tostring(err)))
			if not answered then
				answer({ reason = "Something went wrong. Try again." })
				RefuseTransfer(source, data)
			end
		end
	end
end

----------------------------------------------------------- transfer checks

local function slotCountFor(source, invType, owner, grant)
	if grant ~= nil then
		return getSlotCount(invType, grant.class, grant.model, grant.slotOverride, owner, source)
	end
	return getSlotCount(invType, false, false, false, owner, source)
end

local function capacityFor(invType, grant)
	if grant ~= nil then
		return getCapacity(invType, grant.class, grant.model, grant.capacityOverride)
	end
	return getCapacity(invType, false, false, false)
end

local function weightOf(name, count)
	local def = itemsDatabase[name]
	return (def and def.weight or 0) * count
end

-- Normalises a move, swap or merge request and checks it against the server's
-- view. Returns nil when it may go ahead, or the reason it may not. On success
-- data.name is the item actually in the source slot, the numbers are numbers,
-- and data.inventory.position is the server-checked ground position.
function CheckTransfer(source, data, kind)
	if type(data) ~= "table" then
		return "Invalid Move Data"
	end

	local slotFrom, slotTo = toInt(data.slotFrom), toInt(data.slotTo)
	local invTypeFrom, invTypeTo = toInt(data.invTypeFrom), toInt(data.invTypeTo)
	local count = toInt(data.countTo)
	if slotFrom == nil or slotTo == nil or invTypeFrom == nil or invTypeTo == nil or count == nil or count < 1 then
		return "Invalid Move Data"
	end
	if data.ownerFrom == nil or data.ownerTo == nil then
		return "Invalid Move Data"
	end

	local entityFrom, entityTo = LoadedEntitys[invTypeFrom], LoadedEntitys[invTypeTo]
	if entityFrom == nil or entityTo == nil then
		return "Invalid Move Data"
	end

	data.slotFrom, data.slotTo = slotFrom, slotTo
	data.invTypeFrom, data.invTypeTo = invTypeFrom, invTypeTo
	data.countTo = count
	data.inventory = {}

	local okFrom, grantFrom = CanAccessInventory(source, data.ownerFrom, invTypeFrom)
	local okTo, grantTo = CanAccessInventory(source, data.ownerTo, invTypeTo)
	if not okFrom or not okTo then
		return "You cannot reach that inventory."
	end

	local grantGround = (invTypeTo == 10 and grantTo) or (invTypeFrom == 10 and grantFrom) or nil
	if grantGround ~= nil and grantGround.position ~= nil then
		data.inventory.position = grantGround.position
	end

	local sameInventory = tostring(data.ownerFrom) == tostring(data.ownerTo) and invTypeFrom == invTypeTo

	-- Nothing goes into a shop except by a moderator into their own shop.
	if entityTo.shop then
		return "You cannot put items in a shop."
	end
	if entityTo.playerShop and not IsShopModerator(data.ownerTo, source) then
		return "You cannot put items in a shop."
	end

	-- Where it comes from: what the server holds, not what the UI says.
	local from
	if entityFrom.shop then
		if kind == "swap" then
			return "You cannot swap with a shop."
		end
		from = getShopSlot(source, data.ownerFrom, invTypeFrom, slotFrom)
		if from == nil or (data.name ~= nil and from.Name ~= data.name) then
			return "That item is not for sale here."
		end
		if count > (tonumber(from.Count) or 0) then
			return "You cannot buy that many at once."
		end
	else
		from = INVENTORY:GetSlot(data.ownerFrom, slotFrom, invTypeFrom)
		if from == nil then
			return "Item No Longer In That Slot"
		end
		if kind ~= "swap" and count > from.Count then
			return "Invalid Move Data"
		end
		if entityFrom.playerShop and kind == "swap" and not (sameInventory and IsShopModerator(data.ownerFrom, source)) then
			return "You cannot swap with a shop."
		end
	end
	data.name = from.Name
	if kind == "swap" then
		data.countTo = from.Count
		count = from.Count
	end

	local def = itemsDatabase[from.Name]
	if def == nil then
		return "This item has no definition, so it cannot be moved."
	end

	-- Where it goes: a real slot, empty or holding the same item with room.
	local sizeTo = invTypeTo == 1 and (LoadedEntitys[1].slots or 10) or slotCountFor(source, invTypeTo, data.ownerTo, grantTo)
	if slotTo < 1 or slotTo > (sizeTo or 0) then
		return "Invalid Move Data"
	end
	if sameInventory and slotFrom == slotTo then
		return "Invalid Move Data"
	end

	local to = INVENTORY:GetSlot(data.ownerTo, slotTo, invTypeTo)
	if kind == "swap" then
		if to == nil then
			return "Item No Longer In That Slot"
		end
	elseif to ~= nil then
		if to.Name ~= from.Name then
			return "That slot holds something else."
		end
		local stack = def.isStackable
		if not stack or to.Count + count > stack then
			return "That stack is full."
		end
	end

	-- A bag never goes inside itself.
	local function bagInside(slot, owner)
		local item = slot and itemsDatabase[slot.Name]
		local md = slot and slot.MetaData
		return item ~= nil and item.container ~= nil and type(md) == "table" and md.Container ~= nil
			and tostring(owner) == string.format("container:%s", md.Container)
	end
	if bagInside(from, data.ownerTo) or (kind == "swap" and bagInside(to, data.ownerFrom)) then
		return "A bag cannot go inside itself."
	end

	-- Weight, when anything changes hands between inventories.
	if not sameInventory then
		local inTo = weightOf(from.Name, count)
		local outTo = kind == "swap" and weightOf(to.Name, to.Count) or 0
		if inTo > outTo then
			local cap = invTypeTo == 1 and getCapacity(1) or capacityFor(invTypeTo, grantTo)
			if cap ~= nil and StoredWeight(data.ownerTo, invTypeTo) - outTo + inTo > cap then
				return "There is not enough room for that."
			end
		end
		if kind == "swap" and outTo > inTo and not entityFrom.shop then
			local cap = invTypeFrom == 1 and getCapacity(1) or capacityFor(invTypeFrom, grantFrom)
			if cap ~= nil and StoredWeight(data.ownerFrom, invTypeFrom) - inTo + outTo > cap then
				return "There is not enough room for that."
			end
		end
	end

	return nil
end

-- After a refusal: unlock the two slots the UI locked, and resend both
-- inventories so it drops its optimistic guess.
function RefuseTransfer(source, data)
	if type(data) == "table" and data.ownerFrom ~= nil then
		sendRefreshForClient(source, data.ownerFrom, tonumber(data.invTypeFrom), tonumber(data.slotFrom))
		sendRefreshForClient(source, data.ownerTo, tonumber(data.invTypeTo), tonumber(data.slotTo))
	end
	ResyncTransfer(source, data)
end

-- Resend both inventories after a refusal so the UI drops its guess.
function ResyncTransfer(source, data)
	local char = Fetch:CharacterSource(source)
	if char == nil or type(data) ~= "table" then
		return
	end
	local sid = tostring(char:GetData("SID"))
	local player = getInventory(source, sid, 1)

	local secondary = nil
	local grant = _grants[source]
	if grant ~= nil and LoadedEntitys[grant.invType] ~= nil then
		secondary = getInventory(source, grant.owner, grant.invType)
	end

	TriggerClientEvent("Inventory:Client:Resync", source, player, secondary)
end
