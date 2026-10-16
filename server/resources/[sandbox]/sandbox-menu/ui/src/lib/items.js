/**
 * Pure helpers for the menu data Lua sends (client/component.lua). Nothing
 * here touches state; see state/menu.svelte.js and lib/actions.js.
 */

const TYPES = new Set(['BUTTON', 'ADVANCED', 'CHECKBOX', 'SLIDER', 'TICKER', 'SELECT', 'INPUT', 'NUMBER', 'COLORPICKER', 'COLORLIST', 'TEXT', 'SUBMENU', 'GOBACK']);

/** A Lua array arrives as an object with numeric keys when it has holes; an empty table arrives as []. */
export function asList(v) {
    if (Array.isArray(v)) return v;
    if (v && typeof v === 'object') return Object.values(v);
    return [];
}

export function num(v, fallback = 0) {
    const n = Number(v);
    return v === null || v === undefined || v === '' || Number.isNaN(n) ? fallback : n;
}

const clampNum = (n, min, max) => Math.min(max, Math.max(min, n));

export function normaliseItem(raw) {
    const options = raw?.options && typeof raw.options === 'object' && !Array.isArray(raw.options) ? { ...raw.options } : {};
    if (options.list !== undefined) options.list = asList(options.list).filter((x) => x && typeof x === 'object');
    if (options.colors !== undefined) options.colors = asList(options.colors).filter((x) => x && typeof x === 'object');
    if (options.classes !== undefined) options.classes = asList(options.classes);
    const type = String(raw?.type ?? 'BUTTON').toUpperCase();
    return { ...raw, type: TYPES.has(type) ? type : 'BUTTON', label: raw?.label ?? '', options };
}

export function normaliseMenu(raw) {
    const d = raw && typeof raw === 'object' ? raw : {};
    return {
        id: d.id ?? null,
        label: d.label ?? '',
        subtitle: d.subtitle ?? null,
        items: asList(d.items).filter((x) => x && typeof x === 'object').map(normaliseItem),
    };
}

/* ------------------------------------------------------------ cursor */

export const selectable = (item) => Boolean(item) && item.type !== 'TEXT';

export function firstSelectable(items) {
    return items.findIndex(selectable);
}

/** Next selectable index from `from` in direction `dir` (+1/-1), wrapping. */
export function nextSelectable(items, from, dir) {
    const n = items.length;
    if (!n) return -1;
    for (let k = 1; k <= n; k += 1) {
        const i = (((from + dir * k) % n) + n) % n;
        if (selectable(items[i])) return i;
    }
    return -1;
}

/** Keep the cursor on a selectable row after the items changed. */
export function clampCursor(items, cursor) {
    if (selectable(items[cursor])) return cursor;
    if (cursor >= items.length) return nextSelectable(items, items.length, -1);
    const after = nextSelectable(items, Math.max(-1, cursor), 1);
    return after;
}

/* ------------------------------------------------------------ values */

function decimalsOf(n) {
    const s = String(n);
    const e = s.indexOf('e-');
    if (e >= 0) return Number(s.slice(e + 2));
    const dot = s.indexOf('.');
    return dot < 0 ? 0 : s.length - dot - 1;
}

export function sliderSpec(o) {
    const min = num(o.min, 0);
    const max = Math.max(min, num(o.max, 100));
    const raw = num(o.step, 1);
    const step = raw > 0 ? raw : 1;
    return { min, max, step, decimals: Math.min(6, Math.max(decimalsOf(step), decimalsOf(min))) };
}

/** Snap a value to the slider's grid inside min..max. */
export function snap(spec, v) {
    const k = Math.round((num(v, spec.min) - spec.min) / spec.step);
    return Number(clampNum(spec.min + k * spec.step, spec.min, spec.max).toFixed(spec.decimals));
}

export function formatFixed(spec, v) {
    return num(v, spec.min).toFixed(spec.decimals);
}

export function tickerSpec(o) {
    const min = Math.round(num(o.min, 0));
    return { min, max: Math.max(min, Math.round(num(o.max, min))) };
}

/** One step over min..max, wrapping at both ends. */
export function tickerNext(o, dir) {
    const { min, max } = tickerSpec(o);
    const v = Math.round(num(o.current, min)) + dir;
    if (v > max) return min;
    if (v < min) return max;
    return v;
}

export function clampTicker(o, v) {
    const { min, max } = tickerSpec(o);
    return clampNum(Math.round(v), min, max);
}

export function selectIndex(o) {
    const list = o.list ?? [];
    const strict = list.findIndex((x) => x.value === o.current);
    if (strict >= 0 || o.current === null || o.current === undefined) return strict;
    return list.findIndex((x) => String(x.value) === String(o.current));
}

export function optionLabel(opt) {
    if (!opt) return '';
    return opt.label !== undefined && opt.label !== null ? String(opt.label) : String(opt.value);
}

/* ------------------------------------------------------------ colours */

const byte = (v) => clampNum(Math.round(num(v, 0)), 0, 255);

export function toRgb(c) {
    return { r: byte(c?.r), g: byte(c?.g), b: byte(c?.b) };
}

export function toHex(c) {
    const { r, g, b } = toRgb(c);
    return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

/** CSS colour for a COLORLIST entry ({ rgb } wins over { hex }, as in the old UI). */
export function colorCss(entry) {
    if (entry?.rgb && typeof entry.rgb === 'object') {
        const { r, g, b } = toRgb(entry.rgb);
        return `rgb(${r}, ${g}, ${b})`;
    }
    const hex = String(entry?.hex ?? '').trim();
    if (/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) return hex.startsWith('#') ? hex : `#${hex}`;
    return 'transparent';
}

function sameColor(a, b) {
    if (!a || !b) return false;
    if ((a.label ?? null) !== (b.label ?? null) || (a.hex ?? null) !== (b.hex ?? null)) return false;
    if (!a.rgb && !b.rgb) return true;
    if (!a.rgb || !b.rgb) return false;
    return a.rgb.r === b.rgb.r && a.rgb.g === b.rgb.g && a.rgb.b === b.rgb.b;
}

/** `current` is a 0-based index, or the colour object Lua stores after a change. */
export function colorListIndex(o) {
    const colors = o.colors ?? [];
    const c = o.current;
    if (typeof c === 'number') return c >= 0 && c < colors.length ? Math.floor(c) : -1;
    if (c && typeof c === 'object') return colors.findIndex((x) => sameColor(x, c));
    return -1;
}

/* ------------------------------------------------------------ text */

const TEXT_CLASSES = {
    heading: 'is-heading',
    bold: 'is-bold',
    pad: 'is-pad',
    textLarge: 'is-large',
    textExtraLarge: 'is-xlarge',
    colorSuccess: 'is-success',
    colorWarning: 'is-warning',
    colorError: 'is-error',
    colorPrimary: 'is-ink',
};

/** Map Lua's TEXT classes onto ours; center, right, code, textSmall and textMedium are dropped. */
export function textClasses(classes) {
    return asList(classes)
        .map((c) => TEXT_CLASSES[c])
        .filter(Boolean)
        .join(' ');
}

export const isChecked = (o) => Boolean(o.selected ?? o.checked);

/** Secondary labels that are numbers, money or ids read better in mono. */
export const looksNumeric = (s) => /^[\s#$%+\-.,\d]+$/.test(String(s ?? '')) && /\d/.test(String(s ?? ''));
