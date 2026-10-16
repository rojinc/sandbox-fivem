/**
 * Radar unit state: visibility, the remote, the operator's settings and the
 * live readings. Field names are exactly what client/client.lua,
 * client/settings.lua and client/remote.lua send (see ui/CONTRACT.md).
 */

/** Mirrors GetDefaultSettings() in client/settings.lua. */
export const DEFAULT_SETTINGS = Object.freeze({
    scale: 100, // 85..150 percent
    location: 1, // 1..9, see positions.js
    fastSpeed: 75, // mph; Lua arms fast alerts only when > 20
    frontRadar: Object.freeze({ lane: true, transmit: true }), // lane true = same lane, false = opposite
    rearRadar: Object.freeze({ lane: true, transmit: true }),
});

const defaultSettings = () => ({
    ...DEFAULT_SETTINGS,
    frontRadar: { ...DEFAULT_SETTINGS.frontRadar },
    rearRadar: { ...DEFAULT_SETTINGS.rearRadar },
});

const emptyData = () => ({
    patrolSpeed: 0,
    frontRadar: {}, // { speed, direction, plate, class }
    rearRadar: {},
    frontFast: {}, // { speed, plate, fast, locked, flag, class } or { locked } or {}
    rearFast: {},
});

export const radar = $state({
    visible: false, // RADAR_SHOW / RADAR_HIDE
    remoteOpen: false, // REMOTE_SHOW / REMOTE_HIDE
    settings: defaultSettings(), // UPDATE_SETTINGS
    data: emptyData(), // UPDATE_DATA, shallow-merged
});

/** Empty Lua tables cross the bridge as []; anything that is not a plain object becomes {}. */
export const table = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});

/** RESET_RADAR (character logout): back to the initial state. */
export function resetRadar() {
    radar.visible = false;
    radar.remoteOpen = false;
    radar.settings = defaultSettings();
    radar.data = emptyData();
}

/** UPDATE_SETTINGS and local edits from the remote. Unknown keys are kept out of the payload by settingsPayload(). */
export function applySettings(payload) {
    const p = table(payload);
    const prev = radar.settings;
    radar.settings = {
        ...prev,
        ...p,
        frontRadar: { ...prev.frontRadar, ...table(p.frontRadar) },
        rearRadar: { ...prev.rearRadar, ...table(p.rearRadar) },
    };
}

/** UPDATE_DATA is a partial: a tick without frontFast keeps the previous fast reading, exactly as Lua relies on. */
export function applyData(payload) {
    for (const [key, value] of Object.entries(table(payload))) {
        radar.data[key] = Array.isArray(value) ? {} : value;
    }
}

/** The exact body client/settings.lua SanitizeSettings() reads: nothing more, nothing less. */
export function settingsPayload(s = radar.settings) {
    return {
        scale: Number(s.scale) || DEFAULT_SETTINGS.scale,
        location: Number(s.location) || DEFAULT_SETTINGS.location,
        fastSpeed: Number.isFinite(Number(s.fastSpeed)) ? Number(s.fastSpeed) : DEFAULT_SETTINGS.fastSpeed,
        frontRadar: { lane: s.frontRadar?.lane !== false, transmit: Boolean(s.frontRadar?.transmit) },
        rearRadar: { lane: s.rearRadar?.lane !== false, transmit: Boolean(s.rearRadar?.transmit) },
    };
}

export const hasSpeed = (rec) => typeof rec?.speed === 'number' && Number.isFinite(rec.speed);

/** Fast alerts are armed only when Lua's `fastSpeed > 20` check passes. */
export const isFastArmed = (settings) => Number(settings?.fastSpeed) > 20;
