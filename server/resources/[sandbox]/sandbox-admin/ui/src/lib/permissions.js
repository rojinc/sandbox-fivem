/**
 * Permission gates. They mirror the old console and the checks in
 * server/callbacks.lua (the server re-checks every action).
 * `permission` is the id of the highest staff group: "dev" and "management"
 * get the admin console (Vehicle section), every other group the staff console.
 */
export const LEVEL = {
    INVISIBLE: 100, // ToggleInvisible
    SENSITIVE: 90, // phone numbers, other players' coordinates, GPS marker, heavy vehicle actions
    SENIOR: 75, // ban, heal yourself, sit inside or delete a vehicle, open a player's vehicle
};

export const ADMIN_CONSOLE_GROUPS = ['dev', 'management'];

export function isAdminConsole(permission) {
    return ADMIN_CONSOLE_GROUPS.includes(String(permission ?? '').toLowerCase());
}

/** BanPlayer `length` in days (-1 is permanent). Non-admins are held to 1..7 by the server. */
export const BAN_LENGTHS = [
    { value: 1, label: '1 day', level: 75 },
    { value: 2, label: '2 days', level: 75 },
    { value: 3, label: '3 days', level: 75 },
    { value: 7, label: '7 days', level: 75 },
    { value: 14, label: '14 days', level: 99 },
    { value: 30, label: '30 days', level: 99 },
    { value: -1, label: 'Permanent', level: 99 },
];

/** Must match PER_PAGE in server/callbacks.lua (GetAllPlayersByCharacter). */
export const CHARACTERS_PER_PAGE = 10;
