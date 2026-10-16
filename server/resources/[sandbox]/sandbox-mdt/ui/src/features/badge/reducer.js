/** Government badge / state ID overlays (MDT.Badges / MDT.Licenses in client/component.lua). */
export const initialState = {
    showing: false,
    type: 'license', // 'badge' | 'license'
    data: {},
};

export default function badgeReducer(state = initialState, action) {
    switch (action.type) {
        case 'SHOW_GOV_ID':
            return { showing: true, type: 'badge', data: action.payload ?? {} };
        case 'HIDE_GOV_ID':
            return { ...state, showing: false };
        case 'SHOW_DRIVER_LICENSE':
            return { showing: true, type: 'license', data: action.payload ?? {} };
        case 'HIDE_DRIVER_LICENSE':
            return { ...state, showing: false };
        case 'LOGOUT':
            return initialState;
        default:
            return state;
    }
}
