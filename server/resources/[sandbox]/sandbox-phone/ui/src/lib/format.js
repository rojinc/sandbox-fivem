/** Formatting helpers shared by the apps. Australian date order, 24-hour clock. */

/** Unix seconds or milliseconds -> milliseconds. */
export function toMs(t) {
    const n = Number(t);
    if (!Number.isFinite(n) || n <= 0) return 0;
    return n < 1e12 ? n * 1000 : n;
}

const dateFmt = new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
const shortDateFmt = new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short' });

export function pad(n) {
    return String(n).padStart(2, '0');
}

export function clockTime(t) {
    const d = new Date(toMs(t));
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function longDate(t) {
    const ms = toMs(t);
    return ms ? dateFmt.format(new Date(ms)) : '';
}

/** "14:05" today, "Yesterday", "3 Oct" this year, "3 October 2025" otherwise. */
export function when(t, now = Date.now()) {
    const ms = toMs(t);
    if (!ms) return '';
    const d = new Date(ms);
    const n = new Date(now);
    const sameDay = d.toDateString() === n.toDateString();
    if (sameDay) return clockTime(ms);
    const y = new Date(now - 86400000);
    if (d.toDateString() === y.toDateString()) return 'Yesterday';
    if (d.getFullYear() === n.getFullYear()) return shortDateFmt.format(d);
    return dateFmt.format(d);
}

/** "14:05, 3 October 2026" */
export function stamp(t) {
    const ms = toMs(t);
    return ms ? `${clockTime(ms)}, ${dateFmt.format(new Date(ms))}` : '';
}

/** Elapsed call time as m:ss or h:mm:ss. */
export function elapsed(fromMs, now = Date.now()) {
    const s = Math.max(0, Math.floor((now - fromMs) / 1000));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

/** Digits -> 555-123-4567 as the player types (max 10 digits). */
export function maskPhone(raw) {
    const d = String(raw ?? '')
        .replace(/\D/g, '')
        .slice(0, 10);
    if (d.length > 6) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
    if (d.length > 3) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return d;
}

/** A full 10-digit number formatted, or null. */
export function fullPhone(raw) {
    const d = String(raw ?? '').replace(/\D/g, '');
    return d.length === 10 ? maskPhone(d) : null;
}

export function initial(name) {
    const s = String(name ?? '').trim();
    return s ? s[0].toUpperCase() : '#';
}

export function plural(n, one, many = `${one}s`) {
    return `${n} ${Number(n) === 1 ? one : many}`;
}

/** Strip every tag from a string that came from Lua or another player. */
export function plain(s) {
    return String(s ?? '')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
}
