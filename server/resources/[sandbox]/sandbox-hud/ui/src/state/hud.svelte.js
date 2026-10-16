/** HUD visibility, per-character config (client/events.lua SET_CONFIG) and the minimap anchor. */
export const defaultConfig = {
    compassLocation: 'top', // top | bottom | hidden
    compassAlways: true, // false: only while in a vehicle
    hideCrossStreet: false,
    hideCompassBg: false,
    maskRadio: false, // also read by sandbox-radio
    speedUnit: 'mph', // mph | kph (Lua sends mph, the UI converts)
    showRPM: true, // RPM arc on the speedometer
    showGears: true, // gear ticks and current gear
    skewed: false, // perspective tilt on the clusters
    skewAmount: 15,
};

export const hud = $state({
    showing: false,
    voip: 2, // proximity level 1..3
    voipIcon: 'microphone',
    talking: 0, // 0 idle, 1 talking, 2 radio
    settings: false,
    config: { ...defaultConfig },
    position: null, // normalised minimap anchor
    shifted: false, // radar visible
});

export function setConfig(config) {
    hud.config = { ...defaultConfig, ...(config ?? {}) };
}
