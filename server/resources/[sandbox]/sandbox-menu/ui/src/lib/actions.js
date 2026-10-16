/**
 * What the player does to the menu, by keyboard or mouse. Each action updates
 * the item locally (as Lua's UpdateValue does) and calls the Lua callbacks
 * listed in CONTRACT.md.
 */
import { fetchNui } from '@sandbox/ui-kit/nui';
import { view, popHistory, clearMenu } from '../state/menu.svelte.js';
import { nextSelectable, sliderSpec, snap, num, tickerNext, clampTicker, selectIndex, colorListIndex, toRgb, isChecked } from './items.js';

export function send(name, data = {}) {
    fetchNui(name, data).catch(() => {});
}

export const sound = (name) => send('FrontEndSound', { sound: name });

function selected(item, data) {
    send('Selected', data === undefined ? { id: item.id } : { id: item.id, data });
}

const findItem = (id) => view.current?.items.find((i) => i.id === id) ?? null;

/* ------------------------------------------------------------ cursor */

export function setCursor(index) {
    if (index === view.cursor) return;
    commitPending();
    view.cursor = index;
}

let lastPointer = '';

/** Hover moves the cursor, but only on a real pointer move (not when the list scrolls under a still pointer). */
export function hoverRow(index, e) {
    if (view.editing) return;
    const at = `${e.screenX},${e.screenY}`;
    if (at === lastPointer) return;
    lastPointer = at;
    setCursor(index);
}

export function moveCursor(dir) {
    const items = view.current?.items ?? [];
    const next = nextSelectable(items, view.cursor < 0 ? (dir > 0 ? -1 : items.length) : view.cursor, dir);
    if (next < 0 || next === view.cursor) return;
    setCursor(next);
    sound('UPDOWN');
}

/* ------------------------------------------------------------ navigation */

export function closeMenu() {
    commitPending();
    send('Close');
    view.shown = false;
    clearMenu();
}

/** GOBACK row, Backspace or the empty-state button. */
export function goBack() {
    const cur = view.current;
    if (!cur) return;
    commitPending();
    send('MenuClose', { id: cur.id });
    const prev = popHistory();
    if (prev) send('MenuOpen', { id: prev.id, back: true });
    else closeMenu();
}

/* ------------------------------------------------------------ items */

/** Enter or a click on the row. */
export function activate(item) {
    if (!item || item.type === 'TEXT') return;
    if (item.options.disabled) {
        sound('DISABLED');
        return;
    }
    const o = item.options;
    switch (item.type) {
        case 'CHECKBOX': {
            const next = !isChecked(o);
            o.selected = next;
            if ('checked' in o) o.checked = next;
            sound('SELECT');
            selected(item, { selected: next });
            break;
        }
        case 'SLIDER':
            commitPending();
            break;
        case 'COLORLIST':
            break;
        case 'TICKER':
            beginEdit(item, 'entry');
            break;
        case 'SELECT':
            beginEdit(item, 'list');
            break;
        case 'INPUT':
        case 'NUMBER':
            beginEdit(item, 'text');
            break;
        case 'COLORPICKER':
            beginEdit(item, 'color');
            break;
        case 'SUBMENU':
            commitPending();
            sound('SELECT');
            send('MenuOpen', { id: item.id });
            break;
        case 'GOBACK':
            sound('BACK');
            selected(item);
            goBack();
            break;
        default:
            commitPending();
            sound('SELECT');
            selected(item);
    }
}

/** Left / Right, or a chevron. Returns true when the item takes steps. */
export function step(item, dir) {
    if (!item) return false;
    const o = item.options;
    const steps = ['TICKER', 'SELECT', 'SLIDER', 'COLORLIST'].includes(item.type);
    if (!steps) return false;
    if (o.disabled) {
        sound('DISABLED');
        return true;
    }
    switch (item.type) {
        case 'TICKER': {
            const v = tickerNext(o, dir);
            o.current = v;
            sound('UPDOWN');
            selected(item, { value: v });
            break;
        }
        case 'SELECT': {
            const list = o.list ?? [];
            if (!list.length) break;
            const i = selectIndex(o);
            const next = i < 0 ? (dir > 0 ? 0 : list.length - 1) : (i + dir + list.length) % list.length;
            o.current = list[next].value;
            sound('UPDOWN');
            selected(item, { value: list[next].value });
            break;
        }
        case 'SLIDER': {
            const spec = sliderSpec(o);
            setSlider(item, num(o.current, spec.min) + dir * spec.step);
            break;
        }
        case 'COLORLIST': {
            const n = (o.colors ?? []).length;
            if (!n) break;
            const i = colorListIndex(o);
            pickColor(item, i < 0 ? (dir > 0 ? 0 : n - 1) : (i + dir + n) % n);
            break;
        }
        default:
    }
    return true;
}

/** Slider moved (drag or arrow): shown at once, sent on release. */
export function setSlider(item, raw) {
    if (item.options.disabled) return;
    const v = snap(sliderSpec(item.options), raw);
    if (v === item.options.current) return;
    item.options.current = v;
    view.pending = item.id;
}

export function commitPending() {
    const id = view.pending;
    if (!id) return;
    view.pending = null;
    const item = findItem(id);
    if (!item) return;
    sound('SELECT');
    selected(item, { value: Number(item.options.current) });
}

export function pickColor(item, index) {
    const o = item.options;
    const entry = (o.colors ?? [])[index];
    if (!entry || o.disabled || index === colorListIndex(o)) return;
    o.current = index;
    sound('UPDOWN');
    selected(item, { color: { ...entry } });
}

/* ------------------------------------------------------------ editors */

export function beginEdit(item, mode) {
    commitPending();
    const o = item.options;
    if (mode === 'text') view.editing = { id: item.id, mode, index: 0, draft: o.current === null || o.current === undefined ? '' : String(o.current) };
    else if (mode === 'entry') view.editing = { id: item.id, mode, index: 0, draft: String(Math.round(num(o.current, 0))) };
    else if (mode === 'list') view.editing = { id: item.id, mode, index: Math.max(0, selectIndex(o)), draft: null };
    else if (mode === 'color') view.editing = { id: item.id, mode, index: 0, draft: toRgb(o.current) };
}

/** Finish the open editor. `save` false leaves the value as it was (text fields have already sent each keystroke). */
export function endEdit(save) {
    const ed = view.editing;
    if (!ed) return;
    view.editing = null;
    const item = findItem(ed.id);
    if (!item || !save) return;
    const o = item.options;
    if (ed.mode === 'entry') {
        const typed = parseInt(ed.draft, 10);
        if (Number.isNaN(typed)) return;
        const v = clampTicker(o, typed);
        if (v === o.current) return;
        o.current = v;
        sound('SELECT');
        selected(item, { value: v });
    } else if (ed.mode === 'list') {
        const opt = (o.list ?? [])[ed.index];
        if (!opt || opt.value === o.current) return;
        o.current = opt.value;
        sound('SELECT');
        selected(item, { value: opt.value });
    } else if (ed.mode === 'color') {
        const c = toRgb(ed.draft);
        o.current = c;
        sound('SELECT');
        selected(item, { color: c });
    }
}

/** A keystroke in an INPUT or NUMBER field is sent at once, as the old UI did; a ticker's typed number waits for Enter. */
export function typeText(item, value) {
    const ed = view.editing;
    if (ed?.id !== item.id) return;
    ed.draft = value;
    if (ed.mode !== 'text') return;
    item.options.current = value;
    selected(item, { value });
}

/** Pick an option in an open SELECT list (click). */
export function pickOption(index) {
    const ed = view.editing;
    if (ed?.mode !== 'list') return;
    ed.index = index;
    endEdit(true);
}

/** A click on another row closes an open list or colour editor without saving. */
export function leaveEditor() {
    const ed = view.editing;
    if (ed) endEdit(ed.mode === 'text' || ed.mode === 'entry');
}

export function moveEditor(dir) {
    const ed = view.editing;
    if (!ed) return;
    if (ed.mode === 'list') {
        const n = (findItem(ed.id)?.options.list ?? []).length;
        if (n) ed.index = (ed.index + dir + n) % n;
    } else if (ed.mode === 'color') {
        ed.index = Math.min(2, Math.max(0, ed.index + dir));
    }
}

const CHANNELS = ['r', 'g', 'b'];

export function setChannel(key, v) {
    const ed = view.editing;
    if (ed?.mode !== 'color') return;
    ed.draft[key] = Math.min(255, Math.max(0, Math.round(v)));
}

/** Left / Right in the colour editor: 1 per press, 5 while the key repeats. */
export function nudgeChannel(dir, repeat) {
    const ed = view.editing;
    if (ed?.mode !== 'color') return;
    const key = CHANNELS[ed.index];
    setChannel(key, ed.draft[key] + dir * (repeat ? 5 : 1));
}
