// Street/area readout (client/hud.lua GetLocation, ShiftLocation).
export const initialState = {
    showing: true,
    location: { main: '', cross: '', area: '', direction: 'N' },
    shifted: false, // true when the radar is visible and the cluster sits beside it
};

export default function location(state = initialState, action) {
    switch (action.type) {
        case 'UPDATE_LOCATION':
            return { ...state, location: { ...state.location, ...(action.payload.location ?? {}) } };
        case 'SHIFT_LOCATION':
            return { ...state, shifted: Boolean(action.payload.shift) };
        default:
            return state;
    }
}
