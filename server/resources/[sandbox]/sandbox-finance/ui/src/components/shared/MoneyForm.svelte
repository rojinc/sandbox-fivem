<script>
    import { Field, TextInput, Select, Button, uid, formatMoney } from '@sandbox/ui-kit';
    import { app, adjustCash, startCooldown, cooldownLeft } from '../../state/app.svelte.js';
    import { accounts, getAccount, selectAccount, patchAccount, loadAccounts } from '../../state/accounts.svelte.js';
    import { api } from '../../lib/api.js';
    import { parseAmount, accountOption, accountLabel } from '../../lib/format.js';

    /**
     * Cash deposit or withdrawal on the selected account (Bank:Deposit / Bank:Withdraw).
     * action: 'deposit' | 'withdraw'. `pickAccount` renders an account select inside
     * the form (ATM). onresult({ type, title, message }) reports the outcome to the page.
     */
    let { action = 'deposit', pickAccount = false, heading = true, onresult } = $props();

    const ids = { account: uid('acct'), amount: uid('amt'), desc: uid('desc') };
    let amount = $state('');
    let comments = $state('');
    let errors = $state({});
    let busy = $state(false);

    const isDeposit = $derived(action === 'deposit');
    const account = $derived(getAccount(accounts.selected));
    const cash = $derived(Number(app.character?.Cash) || 0);
    const allowed = $derived(Boolean(account && (isDeposit ? account.Permissions?.DEPOSIT : account.Permissions?.WITHDRAW)));
    const options = $derived(accounts.items.map(accountOption));
    const title = $derived(isDeposit ? 'Deposit cash' : 'Withdraw cash');

    function validate() {
        const e = {};
        if (!account) e.account = 'Choose an account.';
        const parsed = parseAmount(amount);
        if (parsed.error) e.amount = parsed.error;
        else if (isDeposit && parsed.value > cash) e.amount = `You only have ${formatMoney(cash)} in cash.`;
        else if (!isDeposit && account && parsed.value > account.Balance) e.amount = `This account only has ${formatMoney(account.Balance)} available.`;
        errors = e;
        return Object.keys(e).length ? null : parsed.value;
    }

    async function submit(e) {
        e.preventDefault();
        if (busy || !allowed) return;
        const value = validate();
        if (value === null) return;
        if (cooldownLeft() > 0) {
            onresult?.({ type: 'warning', title: 'Please wait a moment', message: 'The bank accepts one transaction every 2 seconds. Try again shortly.' });
            return;
        }
        const target = account;
        busy = true;
        let res = null;
        try {
            res = isDeposit ? await api.deposit(target.Account, value, comments) : await api.withdraw(target.Account, value, comments);
        } catch {
            res = null;
        }
        busy = false;
        startCooldown();
        if (res && res.state) {
            const balance = typeof res.balance === 'number' ? res.balance : target.Balance + (isDeposit ? value : -value);
            patchAccount(target.Account, { Balance: balance });
            adjustCash(isDeposit ? -value : value);
            amount = '';
            comments = '';
            errors = {};
            onresult?.({
                type: 'success',
                title: isDeposit ? 'Deposit complete' : 'Withdrawal complete',
                message: `${formatMoney(value)} ${isDeposit ? 'deposited into' : 'withdrawn from'} ${accountLabel(target)}. New balance: ${formatMoney(balance)}.`,
            });
            loadAccounts({ quiet: true });
        } else {
            onresult?.({
                type: 'error',
                title: isDeposit ? 'Deposit declined' : 'Withdrawal declined',
                message: isDeposit ? 'Check that you have the cash on hand and try again.' : 'Check the available balance and try again.',
            });
        }
    }
</script>

<form class="money-form" onsubmit={submit} novalidate>
    {#if heading}<h3>{title}</h3>{/if}
    {#if pickAccount}
        <Field label="Account" id={ids.account} error={errors.account} required>
            <Select id={ids.account} value={accounts.selected ?? ''} {options} placeholder="Choose an account" onchange={(e) => selectAccount(e.currentTarget.value)} />
        </Field>
    {/if}
    <Field
        label="Amount"
        id={ids.amount}
        hint={isDeposit ? `Cash on hand: ${formatMoney(cash)}` : `Available: ${formatMoney(account?.Balance ?? 0)}`}
        error={errors.amount}
        required
    >
        <TextInput
            id={ids.amount}
            bind:value={amount}
            inputmode="numeric"
            autocomplete="off"
            placeholder="0"
            mono
            width="220px"
            block={false}
            invalid={Boolean(errors.amount)}
            disabled={!allowed}
        />
    </Field>
    <Field label="Description (optional)" id={ids.desc} hint="Shown on your statement">
        <TextInput id={ids.desc} bind:value={comments} maxlength="80" autocomplete="off" disabled={!allowed} />
    </Field>
    {#if account && !allowed}
        <p class="au-hint">You do not have {isDeposit ? 'deposit' : 'withdrawal'} access to this account.</p>
    {/if}
    <Button type="submit" loading={busy} disabled={!allowed}>{title}</Button>
</form>

<style>
    .money-form h3 {
        margin-bottom: 12px;
    }
</style>
