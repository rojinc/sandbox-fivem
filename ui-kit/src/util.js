let counter = 0;

/** Unique id for aria wiring (label/for, dialog titles). */
export function uid(prefix = 'au') {
    counter += 1;
    return `${prefix}-${counter.toString(36)}`;
}

export function clamp(n, min, max) {
    return Math.min(max, Math.max(min, Number(n) || 0));
}

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const moneyCents = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
const number = new Intl.NumberFormat('en-US');

export function formatMoney(n, { cents = false } = {}) {
    const v = Number(n) || 0;
    return cents ? moneyCents.format(v) : money.format(v);
}

export function formatNumber(n) {
    return number.format(Number(n) || 0);
}

/** 1h 02m / 4m 05s / 12s from a duration in seconds. */
export function formatDuration(totalSeconds) {
    const s = Math.max(0, Math.floor(Number(totalSeconds) || 0));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h) return `${h}h ${String(m).padStart(2, '0')}m`;
    if (m) return `${m}m ${String(sec).padStart(2, '0')}s`;
    return `${sec}s`;
}

/** mm:ss (or h:mm:ss) countdown text. */
export function formatClock(totalSeconds) {
    const s = Math.max(0, Math.floor(Number(totalSeconds) || 0));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const mm = String(m).padStart(2, '0');
    const ss = String(sec).padStart(2, '0');
    return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Relative time ("3 min ago") without a date library. */
export function timeAgo(ts, now = Date.now()) {
    const t = Number(ts) < 1e12 ? Number(ts) * 1000 : Number(ts);
    const diff = Math.max(0, now - t) / 1000;
    if (diff < 45) return 'just now';
    if (diff < 3600) return `${Math.round(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.round(diff / 3600)} h ago`;
    if (diff < 86400 * 7) return `${Math.round(diff / 86400)} d ago`;
    return new Date(t).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDate(ts, opts = {}) {
    const t = Number(ts) < 1e12 ? Number(ts) * 1000 : Number(ts);
    return new Date(t).toLocaleString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', ...opts });
}
