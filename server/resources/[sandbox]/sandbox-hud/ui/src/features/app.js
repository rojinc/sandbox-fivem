// Screen-wide effects driven by client/hud.lua, client/blindfold.lua and client/events.lua.
export const initialState = {
    blindfolded: false,
    flashbanged: false, // false | { duration, strength }

    isDeathTexts: false,
    isReleasing: false,
    deathTime: false, // ms timestamp the player went down
    releaseTimer: false, // ms timestamp release becomes available
    releaseType: false, // knockout | death | hospital | hospital_rp
    releaseKey: false,
    helpKey: false,
    medicalPrice: false,
};

export default function app(state = initialState, action) {
    switch (action.type) {
        case 'DO_DEATH_TEXT':
            return {
                ...state,
                isDeathTexts: true,
                isReleasing: false,
                deathTime: action.payload.deathTime * 1000,
                releaseTimer: action.payload.timer * 1000,
                releaseType: action.payload.type,
                releaseKey: action.payload.key,
                helpKey: action.payload.f1Key,
                medicalPrice: action.payload.medicalPrice,
            };
        case 'DO_DEATH_RELEASING':
            return { ...state, isReleasing: true };
        case 'HIDE_DEATH_TEXT':
            return {
                ...state,
                isDeathTexts: false,
                isReleasing: false,
                deathTime: false,
                releaseTimer: false,
                releaseType: false,
                releaseKey: false,
                helpKey: false,
                medicalPrice: false,
            };
        case 'SET_BLINDFOLD':
            return { ...state, blindfolded: Boolean(action.payload.state) };
        case 'SET_FLASHBANGED':
            return { ...state, flashbanged: { ...action.payload } };
        case 'CLEAR_FLASHBANGED':
            return { ...state, flashbanged: false };
        default:
            return state;
    }
}
