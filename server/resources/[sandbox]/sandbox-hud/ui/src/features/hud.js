// HUD visibility, per-character layout config and the minimap anchor (client/hud.lua, client/events.lua).
export const defaultConfig = {
    layout: 'default', // default | minimap | center | condensed
    statusType: 'numbers', // numbers | bars | circles
    buffsAnchor: 'compass', // compass | minimap   (center layout)
    buffsAnchor2: true, // anchor buffs to the minimap (center layout)
    showRPM: true,
    hideCrossStreet: false,
    hideCompassBg: false,
    largeBars: false,
    minimapAnchor: true, // minimap layout: anchor statuses under the minimap
    transparentBg: true,
    vehicle: 'default', // default | simple | minimal
    maskRadio: false,
    condenseAlignment: 'left', // left | center | minimap | compass  (condensed layout)
    circleNumbers: false,
};

export const initialState = {
    showing: false,
    voip: 2, // proximity level 1..3
    voipIcon: 'microphone',
    talking: 0, // 0 idle, 1 talking, 2 radio
    settings: false, // settings dialog open
    config: defaultConfig,
    position: {}, // minimap anchor, normalised 0..1: leftX rightX topY bottomY width height X Y
};

export default function hud(state = initialState, action) {
    switch (action.type) {
        case 'SHOW_HUD':
            return { ...state, showing: true };
        case 'HIDE_HUD':
            return { ...state, showing: false };
        case 'TOGGLE_HUD':
            return { ...state, showing: !state.showing };
        case 'SET_CONFIG':
            return { ...state, config: { ...defaultConfig, ...(action.payload.config ?? {}) } };
        case 'UPDATE_MM_POS':
        case 'SHIFT_LOCATION':
            return action.payload.position ? { ...state, position: action.payload.position } : state;
        case 'SET_VOIP_LEVEL':
            return {
                ...state,
                voip: action.payload.level ?? state.voip,
                talking: action.payload.talking ?? 0,
                voipIcon: action.payload.icon || 'microphone',
            };
        case 'TOGGLE_SETTINGS':
            return { ...state, settings: Boolean(action.payload.state) };
        case 'UI_RESET':
            return { ...state, settings: false };
        default:
            return state;
    }
}
