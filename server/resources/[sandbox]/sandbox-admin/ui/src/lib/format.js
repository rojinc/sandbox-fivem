import { format, formatDistanceToNowStrict, isValid } from 'date-fns';

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function fmtMoney(v) {
    const n = Number(v);
    return Number.isFinite(n) ? usd.format(n) : '—';
}

export function unixToDate(seconds) {
    const n = Number(seconds);
    if (!Number.isFinite(n) || n <= 0) return null;
    const d = new Date(n * 1000);
    return isValid(d) ? d : null;
}

export function fmtDate(seconds) {
    const d = unixToDate(seconds);
    return d ? format(d, 'd MMM yyyy') : '—';
}

export function fmtTime(seconds) {
    const d = unixToDate(seconds);
    return d ? format(d, 'HH:mm') : '—';
}

export function fmtDateTime(seconds) {
    const d = unixToDate(seconds);
    return d ? format(d, 'd MMM, HH:mm') : '—';
}

export function fmtAgo(seconds) {
    const d = unixToDate(seconds);
    return d ? formatDistanceToNowStrict(d, { addSuffix: true }) : '—';
}

export function round(v, places = 2) {
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    const m = 10 ** places;
    return Math.round(n * m) / m;
}

export function fmtNum(v, places = 0) {
    const r = round(v, places);
    return r === null ? '—' : r.toLocaleString('en-US', { maximumFractionDigits: places });
}

export function vec3(c, places = 3) {
    if (!c || typeof c !== 'object') return '—';
    return `vector3(${round(c.x, places)}, ${round(c.y, places)}, ${round(c.z, places)})`;
}

export function charName(c) {
    if (!c || typeof c !== 'object') return null;
    const name = [c.First, c.Last].filter(Boolean).join(' ');
    return name || null;
}

export function charLabel(c) {
    const name = charName(c);
    if (!name) return null;
    return c.SID !== undefined && c.SID !== null ? `${name} (${c.SID})` : name;
}

export function vehicleName(v) {
    return `${v?.Make ?? 'Unknown'} ${v?.Model ?? 'Unknown'}`;
}

export function fmtJobs(jobs) {
    if (!Array.isArray(jobs) || jobs.length === 0) return 'No jobs';
    return jobs
        .map((j) => {
            const grade = j?.Grade?.Name ? ` · ${j.Grade.Name}` : '';
            return `${j?.Name ?? 'Unknown'}${grade}`;
        })
        .join(', ');
}

export function initials(name) {
    const parts = String(name ?? '')
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    if (!parts.length) return '?';
    return parts
        .slice(0, 2)
        .map((p) => p[0].toUpperCase())
        .join('');
}

/** Render any scalar from Lua, with a dash for nil/false/empty. */
export function text(v, fallback = '—') {
    if (v === undefined || v === null || v === false || v === '') return fallback;
    return String(v);
}

export function pct(value, max) {
    const v = Number(value);
    const m = Number(max);
    if (!Number.isFinite(v) || !Number.isFinite(m) || m <= 0) return 0;
    return Math.max(0, Math.min(100, (v / m) * 100));
}
