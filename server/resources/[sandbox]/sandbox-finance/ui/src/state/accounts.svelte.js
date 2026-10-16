/**
 * Accounts are not pushed by Lua: the UI pulls them with Bank:Fetch after
 * every SET_APP and patches them locally after each successful action.
 */
import { api } from '../lib/api.js';

export const accounts = $state({
    status: 'idle', // idle | loading | ready | error
    items: [], // Account[] (see CONTRACT.md)
    selected: null, // account number
});

export const same = (a, b) => String(a) === String(b);

const asList = (v) => (Array.isArray(v) ? v : v && typeof v === 'object' ? Object.values(v) : []);

/** Lua tables arrive as either arrays or objects; numbers may be strings. */
export function normaliseAccount(a) {
    return {
        ...a,
        Account: Number(a.Account),
        Balance: Number(a.Balance) || 0,
        Name: a.Name == null ? '' : String(a.Name),
        Permissions: a.Permissions && typeof a.Permissions === 'object' ? a.Permissions : {},
        JointOwners: asList(a.JointOwners).map((j) => Number(j)),
    };
}

export function getAccount(id) {
    if (id == null || id === '') return null;
    return accounts.items.find((a) => same(a.Account, id)) ?? null;
}

export function selectAccount(id) {
    accounts.selected = id == null || id === '' || Number.isNaN(Number(id)) ? null : Number(id);
}

function defaultSelection(items) {
    const personal = items.find((a) => a.Type === 'personal');
    return (personal ?? items[0])?.Account ?? null;
}

let request = 0;

/** Bank:Fetch. `quiet` refreshes in the background without touching the loading state. */
export async function loadAccounts({ quiet = false } = {}) {
    const id = ++request;
    if (!quiet) accounts.status = 'loading';
    let res = null;
    try {
        res = await api.fetchAccounts();
    } catch {
        res = null;
    }
    if (id !== request) return;
    const list = res && res.accounts ? asList(res.accounts) : null;
    if (!list) {
        if (!quiet) {
            accounts.status = 'error';
            accounts.items = [];
            accounts.selected = null;
        }
        return;
    }
    accounts.items = list.filter((a) => a && a.Account != null).map(normaliseAccount);
    accounts.status = 'ready';
    if (!accounts.items.some((a) => same(a.Account, accounts.selected))) accounts.selected = defaultSelection(accounts.items);
}

export function resetAccounts() {
    request += 1;
    accounts.status = 'idle';
    accounts.items = [];
    accounts.selected = null;
}

export function patchAccount(id, changes) {
    const acc = getAccount(id);
    if (acc) Object.assign(acc, changes);
}

export function upsertAccount(raw) {
    if (!raw || raw.Account == null) return null;
    const acc = normaliseAccount(raw);
    const i = accounts.items.findIndex((a) => same(a.Account, acc.Account));
    if (i >= 0) accounts.items[i] = { ...accounts.items[i], ...acc };
    else accounts.items.push(acc);
    return acc;
}

/** A transfer landed in an account we also hold: mirror it locally until the next fetch. */
export function creditAccount(id, amount) {
    const acc = getAccount(id);
    if (acc) acc.Balance = (Number(acc.Balance) || 0) + (Number(amount) || 0);
}
