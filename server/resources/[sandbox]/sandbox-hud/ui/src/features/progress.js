// Timed action bar (client/progress.lua). The component reports completion with fetchNui('Progress:Finish').
export const initialState = {
    showing: false,
    label: null,
    duration: 0,
    cancelled: false,
    failed: false,
    finished: false,
    startTime: null,
};

export default function progress(state = initialState, action) {
    switch (action.type) {
        case 'START_PROGRESS':
            return {
                ...state,
                label: action.payload.label ?? null,
                duration: Number(action.payload.duration) || 0,
                cancelled: false,
                failed: false,
                finished: false,
                showing: true,
                startTime: Date.now(),
            };
        case 'CANCEL_PROGRESS':
            return state.showing ? { ...state, cancelled: true, failed: false, finished: false } : state;
        case 'FAIL_PROGRESS':
            return state.showing ? { ...state, failed: true, cancelled: false, finished: false } : state;
        case 'FINISH_PROGRESS':
            return { ...state, finished: true, failed: false, cancelled: false };
        case 'HIDE_PROGRESS':
        case 'UI_RESET':
            return { ...initialState };
        default:
            return state;
    }
}
