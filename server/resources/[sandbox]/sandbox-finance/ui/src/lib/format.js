import { formatMoney } from '@sandbox/ui-kit/util';

export { formatMoney };

/** "+$1,200" / "−$300" / "$0" */
export function formatSigned(n) {
    const v = Number(n) || 0;
    if (v > 0) return `+${formatMoney(v)}`;
    if (v < 0) return `−${formatMoney(-v)}`;
    return formatMoney(0);
}

/**
 * Whole dollars typed by the player. Commas, spaces and a leading $ are
 * tolerated; anything else is an error the Field shows.
 */
export function parseAmount(raw) {
    const text = String(raw ?? '').trim();
    if (!text) return { error: 'Enter an amount.' };
    const cleaned = text.replace(/[$,\s]/g, '');
    if (!/^\d+$/.test(cleaned)) return { error: 'Enter a whole dollar amount using digits only.' };
    const value = Number(cleaned);
    if (!Number.isSafeInteger(value) || value <= 0) return { error: 'The amount must be more than $0.' };
    return { value };
}

/** oxmysql gives ms since epoch; seconds and MySQL/ISO strings are tolerated. */
export function toDate(ts) {
    if (ts == null || ts === '') return null;
    if (typeof ts === 'number') return new Date(ts < 1e12 ? ts * 1000 : ts);
    if (/^\d+(\.\d+)?$/.test(String(ts))) return toDate(Number(ts));
    const d = new Date(String(ts).replace(' ', 'T'));
    return Number.isNaN(d.getTime()) ? null : d;
}

const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** "Today 14:05", "Yesterday 09:12", "14 Oct 13:05" or "14 Oct 2025 13:05" (24-hour throughout). */
export function formatWhen(ts) {
    const d = toDate(ts);
    if (!d) return '—';
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    if (sameDay(d, now)) return `Today ${time}`;
    if (sameDay(d, yesterday)) return `Yesterday ${time}`;
    const day = d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', ...(d.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' }) });
    return `${day} ${time}`;
}

/** The server writes "No Description" when none was given; show nothing instead. */
export const txDescription = (t) => {
    const text = String(t?.Description ?? '').trim();
    return text && text.toLowerCase() !== 'no description' ? text : '';
};

export const ACCOUNT_TYPES = {
    personal: { label: 'Checking', tone: 'info' },
    personal_savings: { label: 'Savings', tone: 'success' },
    organization: { label: 'Organisation', tone: 'warning' },
};

export const accountType = (a) => ACCOUNT_TYPES[a?.Type] ?? { label: 'Account', tone: 'default' };

/** The server names an account after its number until it is renamed; show the type instead of "310442". */
export function accountName(a) {
    const name = String(a?.Name ?? '').trim();
    if (name && name !== String(a?.Account)) return name;
    return `${accountType(a).label} account`;
}

export const accountLabel = (a) => (a ? `${accountName(a)} (${a.Account})` : '—');

export const accountOption = (a) => ({ value: a.Account, label: `${accountName(a)} · ${a.Account} · ${formatMoney(a.Balance)}` });

export const isOwner = (a, character) => Boolean(a && character && String(a.Owner) === String(character.SID));

/** Owner / Joint owner / Job access, for the Access column. */
export function accessOf(a, character) {
    if (a?.Type === 'organization') {
        const p = a.Permissions ?? {};
        if (p.WITHDRAW && p.DEPOSIT) return { label: 'Job access' };
        if (p.DEPOSIT) return { label: 'Job, deposit only' };
        if (p.WITHDRAW) return { label: 'Job, withdraw only' };
        return { label: 'Job, view only' };
    }
    if (isOwner(a, character)) return { label: 'Owner' };
    return { label: 'Joint owner' };
}

export const TX_TYPES = {
    deposit: { label: 'Deposit', tone: 'success' },
    withdraw: { label: 'Withdrawal', tone: 'default' },
    transfer: { label: 'Transfer', tone: 'info' },
    paycheck: { label: 'Paycheck', tone: 'success' },
    bill: { label: 'Bill', tone: 'warning' },
    fine: { label: 'Fine', tone: 'error' },
    fine_profit: { label: 'Fine revenue', tone: 'success' },
    loan: { label: 'Loan', tone: 'info' },
};

export function txType(t) {
    const known = TX_TYPES[t?.Type];
    if (known) return known;
    const raw = String(t?.Type ?? 'transaction').replace(/_/g, ' ');
    return { label: raw.charAt(0).toUpperCase() + raw.slice(1), tone: 'default' };
}

/** Lua only ever sends brand = "fleeca". */
export const brandName = (brand) => (brand === 'fleeca' || !brand ? 'Fleeca Bank' : String(brand));

export const customerLine = (c) => (c ? `${c.First} ${c.Last} · State ID ${c.SID}` : 'Customer');
