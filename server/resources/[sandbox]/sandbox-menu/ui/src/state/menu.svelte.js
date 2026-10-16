/**
 * The open menu, the back stack, the cursor and the row being edited.
 * Lua messages arrive through bridge.js; user actions go through lib/actions.js.
 */
import { normaliseMenu, firstSelectable, clampCursor } from '../lib/items.js';

export const view = $state({
    /** APP_SHOW / APP_HIDE */
    shown: false,
    /** { id, label, subtitle, items } */
    current: null,
    /** Menus to go back to: [{ menu, cursor }] */
    history: [],
    /** Index of the selected row in current.items, -1 when none can be selected. */
    cursor: -1,
    /** { id, mode: 'text' | 'entry' | 'list' | 'color', index, draft } */
    editing: null,
    /** Id of a slider whose value changed and has not been sent yet. */
    pending: null,
});

/** True after a close or hide: the next SETUP_MENU starts at the top. */
let fresh = true;

function dropEditingIfGone(menu) {
    if (view.editing && !menu.items.some((i) => i.id === view.editing.id)) view.editing = null;
    if (view.pending && !menu.items.some((i) => i.id === view.pending)) view.pending = null;
}

function replaceCurrent(menu) {
    view.current = menu;
    view.cursor = clampCursor(menu.items, view.cursor);
    dropEditingIfGone(menu);
}

/** SETUP_MENU: a root menu (menu:Show). */
export function setupMenu(raw) {
    const menu = normaliseMenu(raw);
    const same = !fresh && view.current?.id === menu.id;
    view.history = [];
    if (same) {
        replaceCurrent(menu);
    } else {
        view.current = menu;
        view.cursor = firstSelectable(menu.items);
        view.editing = null;
        view.pending = null;
    }
    fresh = false;
}

/** UPDATE_MENU: menu.Update:Item re-sends one whole menu. */
export function updateMenu(raw) {
    const menu = normaliseMenu(raw);
    if (!view.current || view.current.id === menu.id) {
        replaceCurrent(menu);
        return;
    }
    const entry = view.history.find((h) => h.menu.id === menu.id);
    if (entry) entry.menu = menu;
    else replaceCurrent(menu);
}

/** SUBMENU_OPEN: menu:SubMenu(id, back). */
export function openSubmenu(raw, addHistory) {
    const menu = normaliseMenu(raw);
    if (view.current?.id === menu.id) {
        replaceCurrent(menu);
        return;
    }
    if (addHistory && view.current) view.history.push({ menu: view.current, cursor: view.cursor });
    view.current = menu;
    view.cursor = firstSelectable(menu.items);
    view.editing = null;
    view.pending = null;
}

/** Show the previous menu straight away; Lua's answer to MenuOpen refreshes it. Returns null at the root. */
export function popHistory() {
    const prev = view.history.pop();
    if (!prev) return null;
    view.current = prev.menu;
    view.cursor = clampCursor(prev.menu.items, prev.cursor);
    view.editing = null;
    view.pending = null;
    return prev.menu;
}

export function clearMenu() {
    view.current = null;
    view.history = [];
    view.cursor = -1;
    view.editing = null;
    view.pending = null;
    fresh = true;
}

export function showMenu() {
    view.shown = true;
}

export function hideMenu() {
    view.shown = false;
    view.editing = null;
    fresh = true;
}
