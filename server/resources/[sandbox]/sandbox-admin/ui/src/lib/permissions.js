/**
 * Permission gates mirror the legacy UI and the checks in server/callbacks.lua.
 * `permission` is the id of the player's highest staff group (sv_config.lua):
 * "management" / "dev" get the admin console, everything else the staff console.
 */
export const LEVEL = {
    INVISIBLE: 100, // ToggleInvisible
    SENSITIVE: 90, // phone numbers, coordinates, GPS marker, heavy vehicle actions
    SENIOR: 75, // ban, sit inside / delete vehicle, open a player's vehicle
};

export const ADMIN_CONSOLE_GROUPS = ['dev', 'management'];

export function isAdminConsole(permission) {
    return ADMIN_CONSOLE_GROUPS.includes(String(permission ?? '').toLowerCase());
}

const BASE_LINKS = [
    { path: '/', end: true, label: 'Dashboard', icon: 'gauge-high' },
    { path: '/players', label: 'Online players', icon: 'users' },
    { path: '/disconnected-players', label: 'Disconnected', icon: 'user-slash' },
    { path: '/players-characters', label: 'Find characters', icon: 'id-card' },
];

const ADMIN_LINKS = [
    { path: '/vehicles', label: 'Owned vehicles', icon: 'car' },
    { path: '/current-vehicle', label: 'Current vehicle', icon: 'car-side' },
];

export function navLinks(permission) {
    return isAdminConsole(permission) ? [...BASE_LINKS, ...ADMIN_LINKS] : BASE_LINKS;
}

export const BAN_LENGTHS = [
    { label: '1 day', value: 1, level: 75 },
    { label: '2 days', value: 2, level: 75 },
    { label: '3 days', value: 3, level: 75 },
    { label: '7 days', value: 7, level: 75 },
    { label: '14 days', value: 14, level: 99 },
    { label: '30 days', value: 30, level: 99 },
    { label: 'Permanent', value: -1, level: 99 },
];

export function routeTitle(pathname) {
    if (pathname === '/') return 'Dashboard';
    if (pathname === '/players') return 'Online players';
    if (pathname === '/disconnected-players') return 'Disconnected players';
    if (pathname === '/players-characters') return 'Find characters';
    if (pathname === '/vehicles') return 'Owned vehicles';
    if (pathname === '/current-vehicle') return 'Current vehicle';
    if (pathname.startsWith('/player/')) return 'Player';
    if (pathname.startsWith('/vehicle/')) return 'Vehicle';
    return 'Not found';
}

/** Admin site profile URL copied by "Copy site URL" (kept from the legacy UI). */
export const siteUserUrl = (accountId) => `https://sandboxrp.gg/admin/users/${accountId}/`;
