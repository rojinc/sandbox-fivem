// Toasts (client/notification.lua). duration <= 0 means persistent until HIDE_ALERT.
export const initialState = {
    runningId: 0,
    notifications: [], // { _id, created, type, message, duration, icon, style?, hide? }
};

export default function notifications(state = initialState, action) {
    switch (action.type) {
        case 'CLEAR_ALERTS':
            return { runningId: 0, notifications: [] };
        case 'ADD_ALERT': {
            const n = action.payload.notification;
            if (!n) return state;
            const existing = n._id !== undefined && n._id !== null && state.notifications.some((x) => x._id === n._id);
            if (existing) {
                return {
                    ...state,
                    runningId: state.runningId + 1,
                    notifications: state.notifications.map((x) => (x._id === n._id ? { ...x, ...n, hide: false } : x)),
                };
            }
            return {
                ...state,
                runningId: state.runningId + 1,
                notifications: [...state.notifications, { _id: state.runningId + 1, created: Date.now(), ...n }],
            };
        }
        case 'REMOVE_ALERT':
            return { ...state, notifications: state.notifications.filter((x) => x._id !== action.payload.id) };
        case 'HIDE_ALERT':
            return {
                ...state,
                notifications: state.notifications.map((x) => (x._id === action.payload.id ? { ...x, hide: true } : x)),
            };
        default:
            return state;
    }
}
