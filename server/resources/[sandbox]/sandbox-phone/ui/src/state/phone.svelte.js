/**
 * Shell state: visibility, the app catalogue, the clock, where the device
 * sits on screen and how large it is.
 */
import { fetchNui } from '@sandbox/ui-kit/nui';

/** The position the server stores for a phone nobody has moved (server/main.lua). It means "docked bottom right". */
export const DOCKED = Object.freeze({ x: 1000, y: 250 });

export const phone = $state({
    visible: false,
    limited: false, // PHONE_VISIBLE_LIMITED: payphone or no-signal mode, dialer and calls only
    apps: {}, // SET_APPS: { [name]: AppDef }
    time: { hour: 0, minute: 0 }, // SET_TIME (game clock)
    position: null, // SET_POSITION: { x, y } in 1920x1080 reference pixels, null = docked
    expanded: false, // SET_EXPANDED: larger phone
    moving: false, // the player is dragging the phone to a new place
    clearing: false, // CLEAR_HISTORY received, CDExpired not yet sent
    permissions: null, // LOAD_PERMS
});

export function isDocked(pos) {
    return !pos || (Number(pos.x) === DOCKED.x && Number(pos.y) === DOCKED.y);
}

export function setPosition(pos) {
    if (!pos || typeof pos !== 'object' || isDocked(pos)) {
        phone.position = null;
        return;
    }
    phone.position = { x: Number(pos.x) || 0, y: Number(pos.y) || 0 };
}

/** Save where the phone sits. Docked is stored as the server default. */
export function savePosition() {
    const pos = phone.position ? { x: Math.round(phone.position.x), y: Math.round(phone.position.y) } : { ...DOCKED };
    fetchNui('Phone:SavePosition', pos);
}

export function setExpanded(value) {
    phone.expanded = Boolean(value);
    fetchNui('UpdateSetting', { type: 'Expanded', val: phone.expanded });
}

export function setUnread(name, count) {
    const app = phone.apps[name];
    if (app) app.unread = Math.max(0, Number(count) || 0);
}

export function addUnread(name, count) {
    const app = phone.apps[name];
    if (app) app.unread = Math.max(0, (Number(app.unread) || 0) + (Number(count) || 0));
}

let beforeMove = null;

/** Enter move mode; the old place is kept so Cancel can put the phone back. */
export function startMove() {
    beforeMove = phone.position ? { ...phone.position } : null;
    phone.moving = true;
}

export function cancelMove() {
    phone.position = beforeMove;
    phone.moving = false;
}
