-- The "0" key keeps the table an object when it reaches the UI as JSON.
local _adverts = {
	["0"] = {},
}

local CATEGORIES = {
	["Services"] = true,
	["Want-To-Buy"] = true,
	["Want-To-Sell"] = true,
	["Help Wanted"] = true,
}
local BUMP_AFTER_MS = 30 * 60 * 1000

local function clip(value, max)
	if type(value) ~= "string" then
		return nil
	end
	value = value:gsub("^%s+", ""):gsub("%s+$", "")
	if #value == 0 then
		return nil
	end
	return value:sub(1, max)
end

-- Build the advert from the character and checked fields; nothing the client
-- says about who posted it, their number or the time is trusted.
local function BuildAdvert(source, data, previous)
	if type(data) ~= "table" then
		return nil
	end
	local char = Fetch:CharacterSource(source)
	if char == nil then
		return nil
	end

	local title = clip(data.title, 32)
	local full = clip(data.full, 12000) -- 2000 characters of text, HTML-escaped
	if title == nil or full == nil then
		return nil
	end

	local categories = {}
	if type(data.categories) == "table" then
		for _, c in ipairs(data.categories) do
			if CATEGORIES[c] and #categories < 4 then
				table.insert(categories, c)
			end
		end
	end
	if #categories == 0 then
		return nil
	end

	local price = nil
	if data.price ~= nil and data.price ~= "" then
		price = tostring(data.price):gsub("[$,%s]", "")
		if not price:match("^%d+$") or #price > 9 then
			return nil
		end
	end

	-- Edits and bumps only move an ad back to the top once it has been up 30 minutes.
	local now = os.time() * 1000
	local time = now
	if previous ~= nil and previous.time ~= nil and now - previous.time < BUMP_AFTER_MS then
		time = previous.time
	end

	return {
		id = source,
		author = string.format("%s %s", char:GetData("First"), char:GetData("Last")),
		number = char:GetData("Phone"),
		title = title,
		short = clip(data.short, 120) or title,
		full = full,
		price = price,
		categories = categories,
		time = time,
	}
end

PHONE.Adverts = {
	Create = function(self, source, data)
		local advert = BuildAdvert(source, data, _adverts[source])
		if advert == nil then
			return false
		end
		_adverts[source] = advert
		TriggerClientEvent("Phone:Client:AddData", -1, "adverts", advert, source)
		return true
	end,
	Update = function(self, source, data)
		if _adverts[source] == nil then
			return false
		end
		local advert = BuildAdvert(source, data, _adverts[source])
		if advert == nil then
			return false
		end
		_adverts[source] = advert
		TriggerClientEvent("Phone:Client:UpdateData", -1, "adverts", source, advert)
		return true
	end,
	Delete = function(self, source)
		if _adverts[source] ~= nil then
			_adverts[source] = nil
			TriggerClientEvent("Phone:Client:RemoveData", -1, "adverts", source)
		end
	end,
}

AddEventHandler("Phone:Server:RegisterCallbacks", function()
	Callbacks:RegisterServerCallback("Phone:Adverts:Create", function(source, data, cb)
		cb(Phone.Adverts:Create(source, data))
	end)
	Callbacks:RegisterServerCallback("Phone:Adverts:Update", function(source, data, cb)
		cb(Phone.Adverts:Update(source, data))
	end)
	Callbacks:RegisterServerCallback("Phone:Adverts:Delete", function(source, data, cb)
		Phone.Adverts:Delete(source)
		cb(true)
	end)
end)

AddEventHandler("Phone:Server:RegisterMiddleware", function()
	Middleware:Add("Phone:Spawning", function(source, char)
		return {
			{
				type = "adverts",
				data = _adverts,
			},
		}
	end)
end)

AddEventHandler("Characters:Server:PlayerLoggedOut", function(source, cData)
	Phone.Adverts:Delete(source)
end)

AddEventHandler("Characters:Server:PlayerDropped", function(source, cData)
	Phone.Adverts:Delete(source)
end)
