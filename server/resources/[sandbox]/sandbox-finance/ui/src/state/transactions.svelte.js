/**
 * One page of Bank:GetTransactions for the selected account. The server pages
 * with `offset` / `perPage` and answers `more` when another page exists.
 */
import { api } from '../lib/api.js';

export const PER_PAGE = 15;

export const transactions = $state({
    account: null,
    page: 0,
    items: [], // Transaction[] (see CONTRACT.md), newest first
    more: false,
    status: 'idle', // idle | loading | ready | error
});

let request = 0;

const asList = (v) => (Array.isArray(v) ? v : v && typeof v === 'object' ? Object.values(v) : null);

export async function loadTransactions(account, page = 0) {
    const id = ++request;
    if (account == null) {
        resetTransactions();
        return;
    }
    transactions.account = account;
    transactions.page = Math.max(0, page);
    transactions.status = 'loading';
    let res = null;
    try {
        res = await api.transactions(account, transactions.page * PER_PAGE, PER_PAGE);
    } catch {
        res = null;
    }
    if (id !== request) return;
    const rows = res && typeof res === 'object' ? asList(res.data) : null;
    if (!rows) {
        transactions.status = 'error';
        transactions.items = [];
        transactions.more = false;
        return;
    }
    transactions.items = rows.filter(Boolean).map((t) => ({ ...t, Amount: Number(t.Amount) || 0 }));
    transactions.more = Boolean(res.more);
    transactions.status = 'ready';
}

export function resetTransactions() {
    request += 1;
    transactions.account = null;
    transactions.page = 0;
    transactions.items = [];
    transactions.more = false;
    transactions.status = 'idle';
}
