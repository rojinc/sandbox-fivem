/** Formatting for values that arrive from Lua. Dates in Australian style ("16 October 2026", "2:40pm"). */

const dayFmt = new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
const dayShortFmt = new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'long' });
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/** Unix seconds (or ms) -> Date, or null. */
export function toDate(ts) {
    const n = Number(ts);
    if (!Number.isFinite(n) || n <= 0) return null;
    const d = new Date(n < 1e12 ? n * 1000 : n);
    return Number.isNaN(d.getTime()) ? null : d;
}

/** 2:40pm */
export function clock(ts) {
    const d = toDate(ts);
    if (!d) return '';
    let h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, '0');
    const suffix = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return `${h}:${m}${suffix}`;
}

/** 16 October 2026 */
export function day(ts) {
    const d = toDate(ts);
    return d ? dayFmt.format(d) : '';
}

/** "2:40pm" today, "15 October, 2:40pm" this year, otherwise "15 October 2025". */
export function when(ts, now = new Date()) {
    const d = toDate(ts);
    if (!d) return '';
    if (d.toDateString() === now.toDateString()) return clock(d);
    if (d.getFullYear() === now.getFullYear()) return `${dayShortFmt.format(d)}, ${clock(d)}`;
    return dayFmt.format(d);
}

/** "12 minutes ago", "3 hours ago", "4 days ago" */
export function ago(ts, now = Date.now()) {
    const d = toDate(ts);
    if (!d) return '';
    const s = Math.max(0, (now - d.getTime()) / 1000);
    if (s < 60) return 'just now';
    const plural = (n, unit) => `${n} ${unit}${n === 1 ? '' : 's'} ago`;
    if (s < 3600) return plural(Math.round(s / 60), 'minute');
    if (s < 86400) return plural(Math.round(s / 3600), 'hour');
    if (s < 86400 * 30) return plural(Math.round(s / 86400), 'day');
    return dayFmt.format(d);
}

export function formatMoney(v) {
    const n = Number(v);
    return Number.isFinite(n) ? money.format(n) : '';
}

export function round(v, places = 2) {
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    const m = 10 ** places;
    return Math.round(n * m) / m;
}

/** vector3(x, y, z) as Lua scripts paste it. */
export function vec3(c, places = 2) {
    if (!c || typeof c !== 'object') return '';
    const [x, y, z] = [round(c.x, places), round(c.y, places), round(c.z, places)];
    if (x === null || y === null || z === null) return '';
    return `vector3(${x}, ${y}, ${z})`;
}

export function charName(c) {
    if (!c || typeof c !== 'object') return '';
    return [c.First, c.Last].filter(Boolean).join(' ');
}

export function vehicleName(v) {
    const name = [v?.Make, v?.Model].filter(Boolean).join(' ');
    return name || 'Unknown vehicle';
}

/** "Police (Sergeant), Mechanic" */
export function jobsText(jobs) {
    const list = Array.isArray(jobs) ? jobs : jobs && typeof jobs === 'object' ? Object.values(jobs) : [];
    if (!list.length) return '';
    return list
        .map((j) => {
            const name = j?.Name ?? j?.Label ?? 'Unknown job';
            const grade = j?.Grade?.Name;
            return grade ? `${name} (${grade})` : name;
        })
        .join(', ');
}

/** Any scalar from Lua as text; nil, false and '' become the fallback. */
export function text(v, fallback = '') {
    if (v === undefined || v === null || v === false || v === '') return fallback;
    return String(v);
}

/** Lua arrays with holes or keyed tables arrive as objects: always hand back an array. */
export function asList(v) {
    if (Array.isArray(v)) return v.filter((x) => x !== null && x !== undefined);
    if (v && typeof v === 'object') return Object.values(v).filter((x) => x !== null && x !== undefined);
    return [];
}

export function percent(value, max) {
    const v = Number(value);
    const m = Number(max);
    if (!Number.isFinite(v) || !Number.isFinite(m) || m <= 0) return null;
    return Math.max(0, Math.min(100, Math.round((v / m) * 100)));
}

export function plural(n, one, many = `${one}s`) {
    return `${n} ${n === 1 ? one : many}`;
}
