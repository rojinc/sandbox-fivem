--[[
    Sandbox Security System - Client Side
    Handles secure event triggering with token validation
]]

local _securityToken = nil
local _tokenRefreshInterval = 300000 -- 5 minutes

-- Request security token from server
local function refreshSecurityToken()
    local promise = promise.new()

    exports['sandbox-base']:ClientCallback('Security:GetToken', {}, function(token)
        if token then
            _securityToken = token
            promise:resolve(true)
        else
            promise:resolve(false)
        end
    end)

    return Citizen.Await(promise)
end

-- Auto-refresh token periodically
CreateThread(function()
    while true do
        Wait(_tokenRefreshInterval)
        refreshSecurityToken()
    end
end)

-- Get current security token
local function getSecurityToken()
    if not _securityToken then
        refreshSecurityToken()
    end
    return _securityToken
end

-- Secure event trigger wrapper
local function triggerSecuredServerEvent(eventName, ...)
    local args = {...}
    local token = getSecurityToken()

    if not token then
        print('[Security] Failed to get security token for event: ' .. eventName)
        return
    end

    -- Append token as last argument
    table.insert(args, token)
    TriggerServerEvent(eventName, table.unpack(args))
end

-- Export secure trigger
exports('TriggerSecuredServerEvent', triggerSecuredServerEvent)

-- Export token getter
exports('GetSecurityToken', getSecurityToken)

-- Initialize on player loaded
RegisterNetEvent('Core:Client:PlayerLoaded', function()
    Wait(1000)
    refreshSecurityToken()
end)

-- Initial token request
CreateThread(function()
    Wait(5000) -- Wait for framework to load
    refreshSecurityToken()
end)
