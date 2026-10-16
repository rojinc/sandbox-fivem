/**
 * Session + visibility, fed by client/nui.lua:
 *   SET_USERDATA { user, permission, permissionName, permissionLevel }
 *   APP_SHOW     {}
 *   APP_HIDE     {}
 */
export const initialState = {
    visible: false,
    user: null, // { Source, Name, AccountID, Identifier, Groups, Discord, Mention, Avatar }
    permission: null, // highest staff group id, e.g. "management" | "dev" | "admin"
    permissionName: null, // display name of that group
    permissionLevel: 0, // numeric level of that group
};

export default function appReducer(state = initialState, action) {
    switch (action.type) {
        case 'SET_USERDATA': {
            const { user, permission, permissionName, permissionLevel } = action.payload ?? {};
            return {
                ...state,
                user: user && typeof user === 'object' ? { ...user } : null,
                permission: permission ?? null,
                permissionName: permissionName ?? null,
                permissionLevel: Number(permissionLevel) || 0,
            };
        }
        case 'APP_SHOW':
            return { ...state, visible: true };
        case 'APP_HIDE':
            return { ...state, visible: false };
        default:
            return state;
    }
}

export const selectVisible = (state) => state.app.visible;
export const selectUser = (state) => state.app.user;
export const selectPermission = (state) => state.app.permission;
export const selectPermissionName = (state) => state.app.permissionName;
export const selectPermissionLevel = (state) => state.app.permissionLevel;
