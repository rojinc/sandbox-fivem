import { formatMoney, formatDate } from '@sandbox/ui-kit/util';

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

/** "Today 14:05", "Yesterday 09:12" or "16 Oct 2026, 14:05". */
export function formatWhen(ts) {
    const d = toDate(ts);
    if (!d) return '—';
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const time = d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false });
    if (sameDay(d, now)) return `Today ${time}`;
    if (sameDay(d, yesterday)) return `Yesterday ${time}`;
    return formatDate(d.getTime());
}

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
    if (a?.Type === 'organization') return { label: a.Permissions?.WITHDRAW ? 'Job access' : 'Job (view only)', tone: 'warning' };
    if (isOwner(a, character)) return { label: 'Owner', tone: 'success' };
    return { label: 'Joint owner', tone: 'info' };
}

export const TX_TYPES = {
    deposit: { label: 'Deposit', tone: 'success' },
    withdraw: { label: 'Withdrawal', tone: 'error' },
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

export const BRANDS = {
    fleeca: { name: 'Fleeca Bank', short: 'Fleeca' },
    maze: { name: 'Maze Bank', short: 'Maze' },
    blaineco: { name: 'Blaine County Savings', short: 'Blaine County' },
    ud: { name: 'Union Depository', short: 'Union' },
};

export const brandName = (brand) => (BRANDS[brand] ?? BRANDS.fleeca).name;
export const brandShort = (brand) => (BRANDS[brand] ?? BRANDS.fleeca).short;

export const customerLine = (c) => (c ? `${c.First} ${c.Last} · State ID ${c.SID}` : 'Customer');
