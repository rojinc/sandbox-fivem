import { format, formatDistanceToNowStrict, formatDistanceStrict, isValid } from 'date-fns';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
export const money = (n) => currency.format(Number(n) || 0);

/** Accept ms timestamps, unix seconds, ISO strings or Date objects. */
export function toDate(value, { unix = false } = {}) {
    if (value == null || value === '' || value === false) return null;
    if (value instanceof Date) return isValid(value) ? value : null;
    if (typeof value === 'number') {
        const ms = unix || value < 1e11 ? value * 1000 : value;
        const d = new Date(ms);
        return isValid(d) ? d : null;
    }
    if (typeof value === 'string') {
        if (/^\d+$/.test(value)) return toDate(Number(value), { unix });
        const d = new Date(value);
        return isValid(d) ? d : null;
    }
    return null;
}

const fmt = (value, pattern, opts) => {
    const d = toDate(value, opts);
    return d ? format(d, pattern) : 'Unknown';
};

export const dateShort = (v, o) => fmt(v, 'MMM d, yyyy', o); // moment 'll'
export const dateLong = (v, o) => fmt(v, 'MMMM d, yyyy', o); // 'LL'
export const dateTime = (v, o) => fmt(v, 'MMM d, yyyy h:mm a', o); // 'lll'
export const dateTimeLong = (v, o) => fmt(v, 'MMMM d, yyyy h:mm a', o); // 'LLL'
export const dateTimeFull = (v, o) => fmt(v, 'EEEE, MMMM d, yyyy h:mm a', o); // 'LLLL'
export const timeShort = (v, o) => fmt(v, 'HH:mm', o);
export const clock = (v) => fmt(v, 'hh:mm:ss a');
export const dayLong = (v) => fmt(v, 'MMMM do yyyy');

export function fromNow(value, opts) {
    const d = toDate(value, opts);
    if (!d) return 'Unknown';
    const diff = d.getTime() - Date.now();
    const text = formatDistanceToNowStrict(d);
    return diff < 0 ? `${text} ago` : `in ${text}`;
}

/** moment.duration(x,'minutes').humanize() */
export function humanizeMinutes(minutes) {
    const m = Math.max(0, Math.round(Number(minutes) || 0));
    if (m === 0) return '0 minutes';
    return formatDistanceStrict(0, m * 60000, { roundingMethod: 'round' });
}

export const titleCase = (str) =>
    String(str ?? '').replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.substr(1).toLowerCase());

export const initialName = (first, last) => (first && last ? `${first[0]}. ${last}` : 'Unknown');

export const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
