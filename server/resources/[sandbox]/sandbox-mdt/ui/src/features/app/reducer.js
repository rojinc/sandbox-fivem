/**
 * Shell state: visibility, the logged in character and their government job.
 * Message names and payload fields match client/client.lua + client/component.lua.
 */
export const initialState = {
    hidden: true,
    user: null,
    govJob: null,
    govJobPermissions: null,
    attorney: false,
    pointBreakpoints: { reduction: 50, license: 20 },
    // bumped whenever the router should go back to '/'
    navReset: 0,
};

export default function appReducer(state = initialState, action) {
    const p = action.payload ?? {};
    switch (action.type) {
        case 'SET_USER':
            return { ...state, user: { ...(state.user ?? {}), ...(p.user ?? {}) } };
        case 'JOB_LOGIN':
            return {
                ...state,
                pointBreakpoints: p.points ?? state.pointBreakpoints,
                govJob: p.job ?? null,
                govJobPermissions: p.jobPermissions ?? null,
                attorney: Boolean(p.attorney),
                navReset: state.navReset + 1,
            };
        case 'JOB_UPDATE':
            return {
                ...state,
                pointBreakpoints: p.points ?? state.pointBreakpoints,
                govJob: p.job ?? state.govJob,
                govJobPermissions: p.jobPermissions ?? state.govJobPermissions,
            };
        case 'JOB_LOGOUT':
            return {
                ...state,
                govJob: null,
                govJobPermissions: null,
                attorney: false,
                navReset: state.navReset + 1,
            };
        case 'APP_SHOW':
            return { ...state, hidden: false };
        case 'APP_HIDE':
            return { ...state, hidden: true };
        case 'LOGOUT':
            return { ...initialState, navReset: state.navReset + 1 };
        default:
            return state;
    }
}
