/**
 * Cash deposits and withdrawals (Bank:Deposit / Bank:Withdraw), shared by the
 * branch Accounts tab and the ATM. Validation mirrors the server rules in
 * server/components/banking/callbacks.lua (Banking:DoAccountAction).
 */
import { formatMoney } from '@sandbox/ui-kit/util';
import { api } from './api.js';
import { app, adjustCash, startCooldown, cooldownLeft, bumpActivity } from '../state/app.svelte.js';
import { patchAccount } from '../state/accounts.svelte.js';
import { parseAmount, accountLabel } from './format.js';

export const canDeposit = (account) => Boolean(account?.Permissions?.DEPOSIT);
export const canWithdraw = (account) => Boolean(account?.Permissions?.WITHDRAW);

/** Returns { value } or { error } for an amount typed or picked for `kind` on `account`. */
export function checkCashAmount(kind, account, raw) {
    if (!account) return { error: 'Choose an account.' };
    const parsed = parseAmount(raw);
    if (parsed.error) return parsed;
    const cash = Number(app.character?.Cash) || 0;
    if (kind === 'deposit' && parsed.value > cash) return { error: `You only have ${formatMoney(cash)} in cash.` };
    if (kind === 'withdraw' && parsed.value > account.Balance) return { error: `This account only has ${formatMoney(account.Balance)} available.` };
    return parsed;
}

export const WAIT_ALERT = {
    type: 'warning',
    title: 'Please wait a moment',
    message: 'The bank accepts one transaction every 2 seconds. Try again shortly.',
};

/**
 * Send one validated cash action. Resolves with a PageAlert payload
 * { type, title, message, ok }.
 */
export async function runCashAction(kind, account, value, comments) {
    const deposit = kind === 'deposit';
    if (cooldownLeft() > 0) return { ...WAIT_ALERT, ok: false };
    let res = null;
    try {
        res = deposit ? await api.deposit(account.Account, value, comments) : await api.withdraw(account.Account, value, comments);
    } catch {
        res = null;
    }
    startCooldown();
    if (res && res.state) {
        const balance = typeof res.balance === 'number' ? res.balance : account.Balance + (deposit ? value : -value);
        patchAccount(account.Account, { Balance: balance });
        // The reply carries the new balance, so no refetch; Lua follows up with SET_DATA for the cash.
        adjustCash(deposit ? -value : value);
        bumpActivity();
        return {
            ok: true,
            type: 'success',
            title: deposit ? 'Deposit complete' : 'Withdrawal complete',
            message: `${formatMoney(value)} ${deposit ? 'deposited into' : 'withdrawn from'} ${accountLabel(account)}. New balance ${formatMoney(balance)}.`,
        };
    }
    return {
        ok: false,
        type: 'error',
        title: deposit ? 'Deposit declined' : 'Withdrawal declined',
        message: deposit ? 'Check that you have the cash on hand and try again.' : 'Check the available balance and try again.',
    };
}
