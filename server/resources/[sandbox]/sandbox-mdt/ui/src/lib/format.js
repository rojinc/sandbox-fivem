/**
 * Dates as "16 October 2026", times as "2:40pm", no date library.
 * Lua and the database send ms timestamps, unix seconds, ISO strings or "YYYY-MM-DD".
 */
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function toDate(value, { unix = false } = {}) {
    if (value === null || value === undefined || value === '' || value === false) return null;
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
    if (typeof value === 'number') {
        const d = new Date(unix || Math.abs(value) < 1e11 ? value * 1000 : value);
        return Number.isNaN(d.getTime()) ? null : d;
    }
    if (typeof value === 'string') {
        if (/^-?\d+$/.test(value)) return toDate(Number(value), { unix });
        const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value);
        return Number.isNaN(d.getTime()) ? null : d;
    }
    return null;
}

export function formatDay(value, opts) {
    const d = toDate(value, opts);
    return d ? `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}` : 'Unknown';
}

export function formatTime(value, opts) {
    const d = toDate(value, opts);
    if (!d) return '';
    const h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h % 12 || 12}:${m}${h < 12 ? 'am' : 'pm'}`;
}

/** 24-hour clock for live readouts (alert times, body camera). */
export function formatClock24(value, { seconds = false } = {}) {
    const d = toDate(value);
    if (!d) return '';
    const p = (n) => String(n).padStart(2, '0');
    return `${p(d.getHours())}:${p(d.getMinutes())}${seconds ? `:${p(d.getSeconds())}` : ''}`;
}

export function formatDateTime(value, opts) {
    const d = toDate(value, opts);
    return d ? `${formatDay(d)}, ${formatTime(d)}` : 'Unknown';
}

/** "5 min ago", "in 3 days". */
export function relative(value, now = Date.now()) {
    const d = toDate(value);
    if (!d) return 'Unknown';
    const diff = d.getTime() - now;
    const abs = Math.abs(diff) / 1000;
    let text;
    if (abs < 45) return diff < 0 ? 'just now' : 'now';
    if (abs < 3600) text = `${Math.round(abs / 60)} min`;
    else if (abs < 86400) text = `${Math.round(abs / 3600)} h`;
    else if (abs < 86400 * 30) {
        const days = Math.round(abs / 86400);
        text = `${days} ${days === 1 ? 'day' : 'days'}`;
    } else return formatDay(d);
    return diff < 0 ? `${text} ago` : `in ${text}`;
}

export const plural = (n, one, many = `${one}s`) => `${n} ${Number(n) === 1 ? one : many}`;

export function months(n) {
    return plural(Number(n) || 0, 'month');
}

const money = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0 });
export const formatMoney = (n) => money.format(Number(n) || 0);

/** "Jordan Reyes", "(1-A-12) J. Reyes" */
export function personName(p, { callsign = false, initial = false } = {}) {
    if (!p?.First && !p?.Last) return 'Unknown';
    const first = initial && p.First ? `${p.First[0]}.` : (p.First ?? '');
    const name = `${first} ${p.Last ?? ''}`.trim();
    return callsign && p.Callsign ? `${p.Callsign} ${name}` : name;
}

export function titleCase(str) {
    return String(str ?? '').replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
}

/** Sentence case for server titles like "Shots Fired From A Vehicle". */
export function sentenceCase(str) {
    const s = String(str ?? '').trim();
    if (!s) return s;
    return s
        .split(' ')
        .map((w, i) => (i === 0 ? w : /^[A-Z][a-z]+$/.test(w) ? w.toLowerCase() : w))
        .join(' ');
}
