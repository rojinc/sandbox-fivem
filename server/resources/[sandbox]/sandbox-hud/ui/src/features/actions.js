// Key prompts such as "{key}E{/key} Open door" (client/action.lua). The newest one is shown.
export const initialState = {
    actions: [], // { id, message }
};

export default function actions(state = initialState, action) {
    switch (action.type) {
        case 'ADD_ACTION':
            return { ...state, actions: [...state.actions.filter((a) => a.id !== action.payload.id), action.payload] };
        case 'REMOVE_ACTION':
            return { ...state, actions: state.actions.filter((a) => a.id !== action.payload.id) };
        case 'REMOVE_ALL_ACTIONS':
        case 'UI_RESET':
            return { ...state, actions: [] };
        default:
            return state;
    }
}
