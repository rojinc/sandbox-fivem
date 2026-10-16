RADAR_FORCE_DISABLED = false
RADAR_SETTINGS = nil

function GetDefaultSettings()
    return {
        scale = 100,
        location = 1,
        fastSpeed = 75,
        frontRadar = {
            lane = true,
            transmit = true,
        },
        rearRadar = {
            lane = true,
            transmit = true,
        }
    }
end

function GetSavedSettings()
    local settingData = json.decode(GetResourceKvpString('RADAR_SETTINGS'))
    local radarDisabled = (GetResourceKvpInt('RADAR_FORCE_DISABLED') == 1)

    RADAR_FORCE_DISABLED = radarDisabled

    RADAR_SETTINGS = SanitizeSettings(settingData)

    SendSettingsUpdate()
end

function SaveSettings(settings)
    RADAR_SETTINGS = settings
    SetResourceKvp('RADAR_SETTINGS', json.encode(settings))
    SendSettingsUpdate()
end

function SendSettingsUpdate()
    SendNUIMessage({
        type = 'UPDATE_SETTINGS',
        data = RADAR_SETTINGS
    })
end

local function clampNumber(value, fallback, min, max)
    local n = tonumber(value)
    if n == nil then
        return fallback
    end
    if n < min then
        return min
    end
    if n > max then
        return max
    end
    return n
end

local function sanitizeRadarSide(side, fallback)
    if type(side) ~= "table" then
        return fallback
    end
    return {
        lane = side.lane == true,
        transmit = side.transmit == true,
    }
end

-- The NUI can only hand back the fields the settings schema knows about;
-- anything else is dropped and bad values fall back to the defaults.
function SanitizeSettings(data)
    local defaults = GetDefaultSettings()
    if type(data) ~= "table" then
        return defaults
    end
    return {
        scale = math.floor(clampNumber(data.scale, defaults.scale, 85, 150)),
        location = math.floor(clampNumber(data.location, defaults.location, 1, 9)),
        fastSpeed = math.floor(clampNumber(data.fastSpeed, defaults.fastSpeed, 0, 300)),
        frontRadar = sanitizeRadarSide(data.frontRadar, defaults.frontRadar),
        rearRadar = sanitizeRadarSide(data.rearRadar, defaults.rearRadar),
    }
end

RegisterNUICallback('UpdateSettings', function(data, cb)
    SaveSettings(SanitizeSettings(data))
    cb('OK')
end)

function ToggleRadarIsDisabled()
    if RADAR_ENABLED_VEHICLE then
        RADAR_FORCE_DISABLED = not RADAR_FORCE_DISABLED
        SetResourceKvpInt('RADAR_FORCE_DISABLED', RADAR_FORCE_DISABLED and 1 or 0)
    
        if RADAR_ENABLED and RADAR_FORCE_DISABLED then
            DisableRadar()
        elseif not RADAR_FORCE_DISABLED then
            EnableRadar()
        end
    end
end