/**
 * Session and visibility (client/nui.lua):
 *   SET_USERDATA { user, permission, permissionName, permissionLevel }  once per session
 *   APP_SHOW     { toggles?: { ids, invisible } }                         every open
 *   APP_HIDE     {}
 */
import { isAdminConsole } from '../lib/permissions.js';

export const app = $state({
    visible: false,
    user: null, // { Source, Name, AccountID, Identifier, Groups, Discord, Mention, Avatar }
    permission: null, // highest staff group id, e.g. "management" | "dev" | "admin"
    permissionName: null, // its display name
    level: 0, // its numeric level
    // Self toggles. Lua reports the real state with each APP_SHOW; the console flips them after a successful callback.
    toggles: { ids: false, invisible: false },
});

export function setUserData(d = {}) {
    app.user = d.user && typeof d.user === 'object' ? { ...d.user } : null;
    app.permission = d.permission ?? null;
    app.permissionName = d.permissionName ?? null;
    app.level = Number(d.permissionLevel) || 0;
}

export function show(d = {}) {
    const t = d && typeof d === 'object' ? d.toggles : null;
    if (t && typeof t === 'object') {
        app.toggles.ids = Boolean(t.ids);
        app.toggles.invisible = Boolean(t.invisible);
    }
    app.visible = true;
}

export function hide() {
    app.visible = false;
}

export function adminConsole() {
    return isAdminConsole(app.permission);
}
