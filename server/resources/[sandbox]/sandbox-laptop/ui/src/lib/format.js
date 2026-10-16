/**
 * Dates and times in the house style: "16 October 2026", "2:40pm",
 * relative times in words. Times from Lua arrive in seconds or milliseconds.
 */
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function toMs(ts) {
    const n = Number(ts);
    if (!Number.isFinite(n) || n <= 0) return null;
    return n < 1e12 ? n * 1000 : n;
}

export function formatDay(ts) {
    const ms = toMs(ts);
    if (ms === null) return 'Unknown';
    const d = new Date(ms);
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatTime(ts) {
    const ms = toMs(ts);
    if (ms === null) return '';
    const d = new Date(ms);
    const h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h % 12 || 12}:${m}${h < 12 ? 'am' : 'pm'}`;
}

/** "16 October 2026 at 2:40pm" */
export function formatDateTime(ts) {
    const ms = toMs(ts);
    if (ms === null) return 'Unknown';
    return `${formatDay(ms)} at ${formatTime(ms)}`;
}

function plural(n, word) {
    return `${n} ${word}${n === 1 ? '' : 's'}`;
}

/** "just now", "5 minutes ago", "3 hours ago", "2 days ago", then the date. */
export function ago(ts, now = Date.now()) {
    const ms = toMs(ts);
    if (ms === null) return 'Unknown';
    const s = Math.max(0, (now - ms) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${plural(Math.round(s / 60), 'minute')} ago`;
    if (s < 86400) return `${plural(Math.round(s / 3600), 'hour')} ago`;
    if (s < 86400 * 7) return `${plural(Math.round(s / 86400), 'day')} ago`;
    return formatDay(ms);
}

/** Time left until a unix time: "4 hours 12 minutes", "8 minutes", "less than a minute". */
export function timeLeft(untilTs, now = Date.now()) {
    const ms = toMs(untilTs);
    if (ms === null) return '';
    const s = Math.floor((ms - now) / 1000);
    if (s <= 0) return 'expired';
    if (s < 60) return 'less than a minute';
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (h && m) return `${plural(h, 'hour')} ${plural(m, 'minute')}`;
    if (h) return plural(h, 'hour');
    return plural(m, 'minute');
}

/** How long since a unix time, for the queue: "12 minutes". */
export function duration(sinceTs, now = Date.now()) {
    const ms = toMs(sinceTs);
    if (ms === null) return '';
    const s = Math.max(0, Math.floor((now - ms) / 1000));
    if (s < 60) return 'less than a minute';
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (h) return m ? `${plural(h, 'hour')} ${plural(m, 'minute')}` : plural(h, 'hour');
    return plural(m, 'minute');
}

export function clock(time) {
    if (!time) return '--:--';
    return `${String(Number(time.hour) || 0).padStart(2, '0')}:${String(Number(time.minute) || 0).padStart(2, '0')}`;
}

const num = new Intl.NumberFormat('en-AU');

export function formatNumber(n) {
    return num.format(Number(n) || 0);
}

/** "$1,250" from a number or a typed string; "Not recorded" when empty. */
export function money(v) {
    if (v === '' || v === null || v === undefined) return 'Not recorded';
    const n = Number(String(v).replace(/[^0-9.-]/g, ''));
    if (!Number.isFinite(n)) return String(v);
    return `$${num.format(n)}`;
}

/** Crypto amounts as the game writes them: "25 $VRM". */
export function crypto(amount, coin) {
    return `${num.format(Number(amount) || 0)} $${coin ?? ''}`;
}

/**
 * Server strings come in Title Case ("New Join Request", "On A Boosting
 * Contract"). Lower-case each later word that is a plain capitalised word;
 * acronyms and mixed-case names stay as they are.
 */
export function sentence(text) {
    if (typeof text !== 'string') return text;
    return text
        .split(' ')
        .map((w, i) => (i > 0 && (/^[A-Z][a-z']+$/.test(w) || w === 'A') ? w.toLowerCase() : w))
        .join(' ');
}

export function person(p) {
    if (!p) return 'Unknown';
    const name = [p.First, p.Last].filter(Boolean).join(' ') || 'Unknown';
    return name;
}
