--[[
    Sandbox Security System
    Prevents executor exploits and unauthorized event triggering
    Auto-bans detected cheaters
]]

local _eventTokens = {}
local _eventRateLimits = {}
local _playerTokens = {}
local _suspiciousActivity = {}
local _eventWhitelist = {}
local _securityConfig = {
    enableTokenValidation = true,
    enableRateLimiting = true,
    enableAutoBan = true,
    maxEventsPerSecond = 10,
    suspicionThreshold = 5,
    banDuration = -1, -- Permanent
}

-- Initialize security system
CreateThread(function()
    while true do
        Wait(60000) -- Clean up every minute

        -- Clear old rate limit data
        for source, data in pairs(_eventRateLimits) do
            for event, timestamps in pairs(data) do
                local currentTime = GetGameTimer()
                local cleaned = {}
                for _, timestamp in ipairs(timestamps) do
                    if currentTime - timestamp < 5000 then -- Keep last 5 seconds
                        table.insert(cleaned, timestamp)
                    end
                end
                _eventRateLimits[source][event] = cleaned
            end
        end

        -- Clean up disconnected players
        local activePlayers = {}
        for _, playerId in ipairs(GetPlayers()) do
            activePlayers[tonumber(playerId)] = true
        end

        for source, _ in pairs(_playerTokens) do
            if not activePlayers[source] then
                _playerTokens[source] = nil
                _eventRateLimits[source] = nil
                _suspiciousActivity[source] = nil
            end
        end
    end
end)

-- Generate player token on join
AddEventHandler('playerJoining', function()
    local source = source
    _playerTokens[source] = {
        token = generateSecureToken(),
        generated = os.time(),
        validated = false
    }
    _eventRateLimits[source] = {}
    _suspiciousActivity[source] = 0
end)

-- Clean up on player drop
AddEventHandler('playerDropped', function()
    local source = source
    _playerTokens[source] = nil
    _eventRateLimits[source] = nil
    _suspiciousActivity[source] = nil
end)

-- Generate secure random token
function generateSecureToken()
    local charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    local token = ""
    math.randomseed(os.time() + GetGameTimer())

    for i = 1, 32 do
        local rand = math.random(1, #charset)
        token = token .. charset:sub(rand, rand)
    end

    return token
end

-- Validate player token
local function validatePlayerToken(source, providedToken)
    if not _securityConfig.enableTokenValidation then
        return true
    end

    local tokenData = _playerTokens[source]
    if not tokenData then
        return false
    end

    if providedToken == tokenData.token then
        tokenData.validated = true
        return true
    end

    return false
end

-- Check rate limiting
local function checkRateLimit(source, eventName)
    if not _securityConfig.enableRateLimiting then
        return true
    end

    _eventRateLimits[source] = _eventRateLimits[source] or {}
    _eventRateLimits[source][eventName] = _eventRateLimits[source][eventName] or {}

    local currentTime = GetGameTimer()
    table.insert(_eventRateLimits[source][eventName], currentTime)

    -- Count events in last second
    local recentEvents = 0
    for _, timestamp in ipairs(_eventRateLimits[source][eventName]) do
        if currentTime - timestamp < 1000 then
            recentEvents = recentEvents + 1
        end
    end

    if recentEvents > _securityConfig.maxEventsPerSecond then
        return false
    end

    return true
end

-- Record suspicious activity
local function recordSuspiciousActivity(source, reason, eventName)
    _suspiciousActivity[source] = (_suspiciousActivity[source] or 0) + 1

    exports['sandbox-base']:LoggerError("Security",
        string.format("Suspicious activity from source %s: %s (Event: %s, Total: %d)",
            source, reason, eventName, _suspiciousActivity[source]))

    -- Auto-ban if threshold exceeded
    if _securityConfig.enableAutoBan and _suspiciousActivity[source] >= _securityConfig.suspicionThreshold then
        banPlayer(source, reason)
    end
end

-- Ban player for security violation
function banPlayer(source, reason)
    local player = exports['sandbox-base']:FetchSource(source)
    if not player then
        DropPlayer(source, "Security violation detected")
        return
    end

    local identifier = player:GetData("Identifier")
    local accountId = player:GetData("AccountID")
    local name = GetPlayerName(source)

    exports['sandbox-base']:LoggerError("Security",
        string.format("Auto-banning player %s (Source: %s, Identifier: %s) for: %s",
            name, source, identifier, reason))

    -- Create ban
    exports['sandbox-base']:PunishmentActionsBan(
        nil,
        nil,
        identifier,
        identifier,
        {},
        string.format("Automatic ban: %s", reason),
        _securityConfig.banDuration,
        "Permanent",
        "Security System",
        accountId,
        true
    )

    DropPlayer(source, string.format("Banned: %s", reason))
end

-- Secure event wrapper
local function secureEventWrapper(eventName, handler, options)
    options = options or {}
    local requireToken = options.requireToken ~= false
    local checkRate = options.checkRate ~= false
    local allowWithoutPlayer = options.allowWithoutPlayer or false

    return function(...)
        local source = source
        local args = {...}

        -- Validate source exists
        if not source or source == 0 then
            exports['sandbox-base']:LoggerWarn("Security",
                string.format("Event %s triggered with invalid source", eventName))
            return
        end

        -- Check if player exists (unless explicitly allowed without player)
        if not allowWithoutPlayer then
            local player = exports['sandbox-base']:FetchSource(source)
            if not player then
                recordSuspiciousActivity(source, "Event triggered before player loaded", eventName)
                return
            end
        end

        -- Check rate limiting
        if checkRate and not checkRateLimit(source, eventName) then
            recordSuspiciousActivity(source, "Rate limit exceeded", eventName)
            return
        end

        -- Validate token if required
        if requireToken then
            local providedToken = args[#args]
            if type(providedToken) ~= "string" or not validatePlayerToken(source, providedToken) then
                recordSuspiciousActivity(source, "Invalid or missing security token", eventName)
                return
            end
            -- Remove token from args before passing to handler
            table.remove(args, #args)
        end

        -- Call original handler with validated args
        local success, err = pcall(handler, table.unpack(args))
        if not success then
            exports['sandbox-base']:LoggerError("Security",
                string.format("Error in secured event %s: %s", eventName, tostring(err)))
        end
    end
end

-- Export secure event registration
exports('RegisterSecuredServerEvent', function(eventName, handler, options)
    RegisterServerEvent(eventName, secureEventWrapper(eventName, handler, options))
end)

exports('RegisterSecuredNetEvent', function(eventName, handler, options)
    RegisterNetEvent(eventName, secureEventWrapper(eventName, handler, options))
end)

-- Get player token (for client to use)
exports('GetPlayerSecurityToken', function(source)
    if not _playerTokens[source] then
        _playerTokens[source] = {
            token = generateSecureToken(),
            generated = os.time(),
            validated = false
        }
    end
    return _playerTokens[source].token
end)

-- Whitelist event (no security checks)
exports('WhitelistEvent', function(eventName)
    _eventWhitelist[eventName] = true
end)

-- Check if event is whitelisted
exports('IsEventWhitelisted', function(eventName)
    return _eventWhitelist[eventName] == true
end)

-- Get player suspicion level
exports('GetPlayerSuspicionLevel', function(source)
    return _suspiciousActivity[source] or 0
end)

-- Reset player suspicion
exports('ResetPlayerSuspicion', function(source)
    _suspiciousActivity[source] = 0
end)

-- Update security config
exports('UpdateSecurityConfig', function(config)
    for k, v in pairs(config) do
        if _securityConfig[k] ~= nil then
            _securityConfig[k] = v
        end
    end
end)

-- Manual ban trigger
exports('SecurityBanPlayer', function(source, reason)
    banPlayer(source, reason)
end)

-- Callback for client to request token
exports['sandbox-base']:RegisterServerCallback('Security:GetToken', function(source, data, cb)
    local token = exports['sandbox-base']:GetPlayerSecurityToken(source)
    cb(token)
end)

exports['sandbox-base']:LoggerInfo("Security", "Security system initialized")
