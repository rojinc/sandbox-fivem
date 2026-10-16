/**
 * Window state from Lua (SET_APP / APP_HIDE / SET_DATA), the active tab and
 * the character the bank is open for.
 */
import { api } from '../lib/api.js';

export const DEFAULT_TAB = { BANK: 'accounts', ATM: 'balance' };

/** Server rule: one account action (deposit, withdraw, transfer) per 2 s per player. */
export const ACTION_COOLDOWN_MS = 2000;

export const app = $state({
    visible: false,
    brand: 'fleeca',
    mode: 'BANK', // BANK | ATM
    tab: 'accounts', // BANK: accounts | transfer | transactions | manage. ATM: balance | withdraw | deposit
    character: null, // { ID, SID, First, Last, Cash }
    prefill: null, // NAVIGATE payload, consumed once by the page it targets (previews / deep links)
    cooldownUntil: 0,
    activity: 0, // bumped after every successful money movement so recent activity reloads
});

export function showApp({ brand, app: mode } = {}) {
    app.brand = brand || 'fleeca';
    app.mode = mode === 'ATM' ? 'ATM' : 'BANK';
    app.tab = DEFAULT_TAB[app.mode];
    app.prefill = null;
    app.visible = true;
}

export function hideApp() {
    app.visible = false;
    app.prefill = null;
}

/** Close through Lua (it drops NUI focus and answers with APP_HIDE); hide at once so the frame feels instant. */
export function closeApp() {
    hideApp();
    api.close();
}

export function setCharacter(data) {
    if (!data || typeof data !== 'object') return;
    app.character = {
        ID: data.ID ?? null,
        SID: data.SID ?? null,
        First: data.First ?? '',
        Last: data.Last ?? '',
        Cash: Number(data.Cash) || 0,
    };
}

/** Optimistic cash change after a deposit or withdrawal; Lua follows up with a fresh SET_DATA. */
export function adjustCash(delta) {
    if (!app.character) return;
    app.character.Cash = Math.max(0, (Number(app.character.Cash) || 0) + (Number(delta) || 0));
}

export function navigate(d = {}) {
    if (d.tab) app.tab = d.tab;
    app.prefill = d;
}

export function startCooldown() {
    app.cooldownUntil = Date.now() + ACTION_COOLDOWN_MS;
}

export function cooldownLeft() {
    return Math.max(0, app.cooldownUntil - Date.now());
}

export function bumpActivity() {
    app.activity += 1;
}
