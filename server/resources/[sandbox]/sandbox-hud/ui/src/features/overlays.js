// Passive overlays: info card (client/infooverlay.lua), item image overlay (client/hud.lua Overlay),
// gem appraisal letterbox (client/hud.lua GemTable).

export const infoOverlayInitial = { showing: false, info: {} }; // { label, description }

export function infoOverlay(state = infoOverlayInitial, action) {
    switch (action.type) {
        case 'SHOW_INFO_OVERLAY':
            return { showing: true, info: action.payload.info ?? {} };
        case 'CLOSE_INFO_OVERLAY':
        case 'UI_RESET':
            return { ...state, showing: false };
        default:
            return state;
    }
}

export const overlayInitial = { showing: false, items: [] }; // items: [{ Name, MetaData }]

export function overlay(state = overlayInitial, action) {
    switch (action.type) {
        case 'SHOW_OVERLAY':
            // Lua sends data = { item } (a one-element array spread into an object by the bridge)
            return { showing: true, items: Object.values(action.payload ?? {}).filter((x) => x && typeof x === 'object') };
        case 'HIDE_OVERLAY':
        case 'UI_RESET':
            return { ...state, showing: false };
        default:
            return state;
    }
}

export const gemTableInitial = { showing: false, info: null }; // info: quality percentage

export function gemTable(state = gemTableInitial, action) {
    switch (action.type) {
        case 'SHOW_GEM_TABLE':
            return { showing: true, info: action.payload.info ?? null };
        case 'CLOSE_GEM_TABLE':
        case 'UI_RESET':
            return { ...state, showing: false };
        default:
            return state;
    }
}
