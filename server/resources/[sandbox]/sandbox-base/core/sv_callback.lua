local _sCallbacks = {}
local _cCallbacks = {}

-- Cleanup thread to prevent memory leaks from callbacks that never get responses
CreateThread(function()
    while true do
        Wait(60000)  -- Check every minute
        local currentTime = os.time()

        for src, callbacks in pairs(_cCallbacks) do
            for id, data in pairs(callbacks) do
                if type(data) == "table" and data.timeout and currentTime > data.timeout then
                    exports['sandbox-base']:LoggerWarn("Callbacks", string.format("Callback timeout for source %s, id %s", src, id))
                    _cCallbacks[src][id] = nil
                end
            end

            -- Clean up empty source entries
            if next(_cCallbacks[src]) == nil then
                _cCallbacks[src] = nil
            end
        end
    end
end)

local function RegisterServerCallback(event, cb)
    _sCallbacks[event] = cb
end

local function DoServerCallback(source, event, data, extraId)
    if _sCallbacks[event] ~= nil then
        _sCallbacks[event](source, data, function(...)
            TriggerLatentClientEvent('Callbacks:Client:ReceiveCallback', source, 50000, event, extraId, ...)
        end)
    end
end

local function ClientCallback(source, event, data, cb, extraId)
    if data == nil then data = {} end

    local id = string.format("%s", event)
    if extraId ~= nil then
        id = string.format("%s-%s", event, extraId)
    else
        extraId = ''
    end

    _cCallbacks[source] = _cCallbacks[source] or {}
    -- Store callback with timeout to prevent memory leaks
    _cCallbacks[source][id] = {
        cb = cb,
        timeout = os.time() + 60  -- 60 second timeout
    }
    TriggerLatentClientEvent('Callbacks:Client:TriggerEvent', source, 50000, event, data, extraId)
end

exports('RegisterServerCallback', RegisterServerCallback)
exports('DoServerCallback', DoServerCallback)
exports('ClientCallback', ClientCallback)

RegisterServerEvent('Callbacks:Server:TriggerEvent', function(event, data, extraId)
    data = data or {}
    DoServerCallback(source, event, data, extraId)
end)

RegisterServerEvent('Callbacks:Server:ReceiveCallback', function(event, extraId, ...)
    local src = source
    local id = event

    if extraId ~= nil and extraId ~= "" then
        id = string.format("%s-%s", event, extraId)
    end

    _cCallbacks[src] = _cCallbacks[src] or {}
    if _cCallbacks[src][id] ~= nil then
        local callbackData = _cCallbacks[src][id]
        -- Handle both old format (function) and new format (table with cb and timeout)
        if type(callbackData) == "function" then
            callbackData(...)
        elseif type(callbackData) == "table" and callbackData.cb then
            callbackData.cb(...)
        end
        _cCallbacks[src][id] = nil
    end
end)
