/** Fleeca data: Lua answers Banking:GetData with { accounts, pendingBills }. */
import { fetchNui } from '@sandbox/ui-kit/nui';
import { data, setData } from '../../state/data.svelte.js';

export const bank = $state({ loading: false, failed: false, loadedAt: 0 });

export async function loadBank() {
    if (bank.loading) return;
    bank.loading = true;
    bank.failed = false;
    try {
        const res = await fetchNui('Banking:GetData');
        if (!res || typeof res !== 'object') throw new Error('bank');
        setData('bankAccounts', {
            accounts: Array.isArray(res.accounts) ? res.accounts : Object.values(res.accounts ?? {}),
            pendingBills: Array.isArray(res.pendingBills) ? res.pendingBills : Object.values(res.pendingBills ?? {}),
        });
        bank.loadedAt = Date.now();
    } catch {
        bank.failed = true;
    }
    bank.loading = false;
}

export function accounts() {
    return (data.bankAccounts?.accounts ?? []).filter(Boolean);
}

export function bills() {
    return (data.bankAccounts?.pendingBills ?? []).filter(Boolean);
}

export function accountName(a) {
    if (!a) return 'Account';
    if (a.Type === 'personal') return 'Current account';
    if (a.Type === 'personal_savings') return 'Savings account';
    return a.Name ?? 'Business account';
}

export function accountType(a) {
    if (a?.Type === 'personal') return 'Personal current account';
    if (a?.Type === 'personal_savings') return 'Personal savings account';
    if (a?.Type === 'organization') return 'Business account';
    return 'Bank account';
}

const ORDER = { personal: 0, personal_savings: 1, organization: 2 };
export function sortAccounts(list) {
    return [...list].sort((a, b) => (ORDER[a.Type] ?? 3) - (ORDER[b.Type] ?? 3) || String(a.Name ?? '').localeCompare(String(b.Name ?? '')));
}

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
export function dollars(n) {
    return money.format(Number(n) || 0);
}

/** Bank timestamps arrive as seconds, milliseconds or a date string. */
export function bankTime(t) {
    if (typeof t === 'string' && !/^\d+$/.test(t)) return Date.parse(t) || 0;
    const n = Number(t);
    return n < 1e12 ? n * 1000 : n;
}
