/** Body camera overlay (MDT:Client:ToggleBodyCam / UI:Client:Reset). */
export const initialState = { show: false };

export default function bodycamReducer(state = initialState, action) {
    switch (action.type) {
        case 'TOGGLE_BODYCAM':
            return { ...state, show: !state.show };
        case 'SET_BODYCAM':
            return { ...state, show: Boolean(action.payload?.state) };
        case 'LOGOUT':
            return initialState;
        default:
            return state;
    }
}
