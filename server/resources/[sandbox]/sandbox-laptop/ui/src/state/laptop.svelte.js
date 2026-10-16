/**
 * Shell state: visibility, the close/cooldown handshake, the app catalogue and
 * the game clock.
 */
import { fetchNui } from '@sandbox/ui-kit/nui';

export const laptop = $state({
    visible: false,
    clearing: false, // CLEAR_HISTORY received, CDExpired not yet sent
    apps: {}, // SET_APPS: { [name]: AppDef }
    time: null, // SET_TIME: { hour, minute } game clock
    permissions: null, // LOAD_PERMS (unused by Lua today)
});

/** The old slide-out time; Lua's open cooldown clears when CDExpired arrives. */
const CLEAR_DELAY = 2000;
let clearTimer = null;

function finishClear() {
    clearTimeout(clearTimer);
    clearTimer = null;
    if (!laptop.clearing) return;
    laptop.clearing = false;
    fetchNui('CDExpired');
}

export function clearHistory() {
    laptop.visible = false;
    laptop.clearing = true;
    clearTimeout(clearTimer);
    clearTimer = setTimeout(finishClear, CLEAR_DELAY);
}

export function show() {
    if (laptop.clearing) finishClear();
    laptop.visible = true;
}

export function hide() {
    laptop.visible = false;
}

/** The player closed the laptop (Escape, F3 or the taskbar button). */
export function requestClose() {
    if (!laptop.visible) return;
    laptop.visible = false;
    fetchNui('CloseLaptop');
}

export function setApps(raw) {
    const apps = {};
    for (const [k, v] of Object.entries(raw ?? {})) {
        if (v && typeof v === 'object') apps[v.name ?? k] = { ...v, name: v.name ?? k, unread: Number(v.unread) || 0 };
    }
    laptop.apps = apps;
}
