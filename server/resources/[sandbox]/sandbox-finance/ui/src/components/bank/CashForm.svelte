<script>
    import { untrack } from 'svelte';
    import { Field, TextInput, Select, Button, uid, formatMoney } from '@sandbox/ui-kit';
    import { app } from '../../state/app.svelte.js';
    import { accounts, getAccount, selectAccount } from '../../state/accounts.svelte.js';
    import { accountOption } from '../../lib/format.js';
    import { checkCashAmount, runCashAction, canDeposit, canWithdraw } from '../../lib/actions.js';

    /**
     * Cash deposit or withdrawal on the selected account. One amount, two
     * verbs; each validates against its own limit (cash on hand or balance).
     * onresult({ type, title, message }) reports the outcome to the page.
     */
    let { onresult } = $props();

    const ids = { account: uid('acct'), amount: uid('amt'), desc: uid('desc') };
    let amount = $state('');
    let comments = $state('');
    let errors = $state({});
    let busy = $state(null); // 'deposit' | 'withdraw' while waiting for Lua

    const account = $derived(getAccount(accounts.selected));
    const cash = $derived(Number(app.character?.Cash) || 0);
    const options = $derived(accounts.items.map(accountOption));

    // Preview / deep-link prefill: { cash: { amount, comments, submit: 'deposit' | 'withdraw' } }.
    $effect(() => {
        const pre = app.prefill?.cash;
        if (!pre || accounts.status !== 'ready') return;
        untrack(() => {
            app.prefill = null;
            if (pre.account != null) selectAccount(pre.account);
            if (pre.amount != null) amount = String(pre.amount);
            if (pre.comments != null) comments = String(pre.comments);
            if (pre.submit === 'deposit' || pre.submit === 'withdraw') send(pre.submit);
        });
    });

    async function send(kind) {
        if (busy) return;
        const check = checkCashAmount(kind, account, amount);
        if (check.error) {
            errors = account ? { amount: check.error } : { account: check.error };
            return;
        }
        errors = {};
        busy = kind;
        const result = await runCashAction(kind, account, check.value, comments);
        busy = null;
        if (result.ok) {
            amount = '';
            comments = '';
        }
        onresult?.(result);
    }
</script>

<form class="cash-form" onsubmit={(e) => e.preventDefault()} novalidate>
    <Field label="Account" id={ids.account} error={errors.account}>
        <Select id={ids.account} value={accounts.selected ?? ''} {options} placeholder="Choose an account" invalid={Boolean(errors.account)} onchange={(e) => selectAccount(e.currentTarget.value)} />
    </Field>
    <Field label="Amount" id={ids.amount} error={errors.amount}>
        <TextInput id={ids.amount} bind:value={amount} inputmode="numeric" autocomplete="off" placeholder="0" mono invalid={Boolean(errors.amount)} />
    </Field>
    <Field label="Description (optional)" id={ids.desc}>
        <TextInput id={ids.desc} bind:value={comments} maxlength="80" autocomplete="off" placeholder="Shown on your statement" />
    </Field>
    <dl class="au-dl limits">
        <dt>Cash on hand</dt>
        <dd class="au-mono">{formatMoney(cash)}</dd>
        <dt>Available in account</dt>
        <dd class="au-mono">{account ? formatMoney(account.Balance) : '—'}</dd>
    </dl>
    <div class="au-row">
        <Button disabled={!canDeposit(account) || busy === 'withdraw'} loading={busy === 'deposit'} onclick={() => send('deposit')}>Deposit cash</Button>
        <Button variant="secondary" disabled={!canWithdraw(account) || busy === 'deposit'} loading={busy === 'withdraw'} onclick={() => send('withdraw')}>Withdraw cash</Button>
    </div>
    {#if account && (!canDeposit(account) || !canWithdraw(account))}
        <p class="au-hint access">
            {#if !canDeposit(account) && !canWithdraw(account)}
                You can view this account but cannot move cash in or out of it.
            {:else if !canDeposit(account)}
                You cannot deposit into this account.
            {:else}
                You cannot withdraw from this account.
            {/if}
        </p>
    {/if}
</form>

<style>
    .limits {
        font-size: var(--au-fs-xs);
        margin: 0 0 20px;
    }
    .access {
        margin: 12px 0 0;
    }
</style>
