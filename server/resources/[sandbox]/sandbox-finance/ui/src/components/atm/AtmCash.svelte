<script>
    import { untrack } from 'svelte';
    import { Field, TextInput, Select, Button, uid, formatMoney } from '@sandbox/ui-kit';
    import { app } from '../../state/app.svelte.js';
    import { accounts, getAccount, selectAccount } from '../../state/accounts.svelte.js';
    import { accountOption, parseAmount } from '../../lib/format.js';
    import { checkCashAmount, runCashAction, canDeposit, canWithdraw } from '../../lib/actions.js';
    import ResultAlert from '../shared/ResultAlert.svelte';

    /** ATM withdraw or deposit: big presets, an "other amount" field and one confirm key. kind: 'withdraw' | 'deposit'. */
    let { kind = 'withdraw' } = $props();

    const PRESETS = [20, 50, 100, 200, 500, 1000];
    const ids = { account: uid('atm-acct'), amount: uid('atm-amt') };

    let amount = $state('');
    let error = $state('');
    let alert = $state(null);
    let busy = $state(false);

    const deposit = $derived(kind === 'deposit');
    const account = $derived(getAccount(accounts.selected));
    const cash = $derived(Number(app.character?.Cash) || 0);
    const limit = $derived(deposit ? cash : (account?.Balance ?? 0));
    const allowed = $derived(deposit ? canDeposit(account) : canWithdraw(account));
    const parsed = $derived(parseAmount(amount));
    const picked = $derived(parsed.value ?? null);
    const options = $derived(accounts.items.filter((a) => (deposit ? canDeposit(a) : canWithdraw(a))).map(accountOption));

    // Keep the selection on an account this action is allowed on.
    $effect(() => {
        const ok = allowed;
        const first = options[0]?.value;
        untrack(() => {
            if (!ok && first != null) selectAccount(first);
        });
    });

    // Preview / deep-link prefill: { atm: { amount, submit } }.
    $effect(() => {
        const pre = app.prefill?.atm;
        if (!pre || accounts.status !== 'ready') return;
        untrack(() => {
            app.prefill = null;
            if (pre.amount != null) amount = String(pre.amount);
            if (pre.submit) submit();
        });
    });

    function pick(value) {
        amount = String(value);
        error = '';
        alert = null;
    }

    async function submit() {
        if (busy || !allowed) return;
        const check = checkCashAmount(kind, account, amount);
        if (check.error) {
            error = check.error;
            return;
        }
        error = '';
        busy = true;
        const result = await runCashAction(kind, account, check.value);
        busy = false;
        if (result.ok) amount = '';
        alert = result;
    }
</script>

<form
    class="cash"
    onsubmit={(e) => {
        e.preventDefault();
        submit();
    }}
    novalidate
>
    <ResultAlert {alert} compact onclose={() => (alert = null)} />

    <Field label={deposit ? 'Into account' : 'From account'} id={ids.account}>
        <Select id={ids.account} value={accounts.selected ?? ''} {options} placeholder="Choose an account" onchange={(e) => selectAccount(e.currentTarget.value)} />
    </Field>

    <div class="presets-head">
        <span class="label">Amount</span>
        <span class="au-hint">{deposit ? 'Cash on hand' : 'Available'} <span class="au-mono">{formatMoney(limit)}</span></span>
    </div>
    <div class="presets" role="group" aria-label="Amount">
        {#each PRESETS as value (value)}
            <button type="button" class="preset au-mono" class:is-picked={picked === value} aria-pressed={picked === value} disabled={!allowed || value > limit} onclick={() => pick(value)}>
                {formatMoney(value)}
            </button>
        {/each}
    </div>

    <Field label="Other amount" id={ids.amount} error={error}>
        <TextInput id={ids.amount} bind:value={amount} inputmode="numeric" autocomplete="off" placeholder="0" mono invalid={Boolean(error)} disabled={!allowed} />
    </Field>

    <Button type="submit" size="lg" block loading={busy} disabled={!allowed}>
        {deposit ? 'Deposit' : 'Withdraw'}{picked ? ` ${formatMoney(picked)}` : ''}
    </Button>
</form>

<style>
    .presets-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        margin-bottom: 8px;
    }
    .label {
        font-size: var(--au-fs-xs);
        font-weight: 500;
    }
    .presets-head .au-mono {
        color: var(--au-text);
        margin-left: 4px;
    }
    .presets {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        margin-bottom: 16px;
    }
    .preset {
        height: 56px;
        border: 1px solid var(--au-border-strong);
        border-radius: var(--au-radius);
        background: var(--au-bg-shade);
        color: var(--au-text);
        font-size: var(--au-fs-md);
        font-weight: 500;
        cursor: pointer;
        transition:
            background var(--au-fast) var(--au-ease),
            border-color var(--au-fast) var(--au-ease);
    }
    .preset:hover {
        background: var(--au-bg-alt);
    }
    .preset.is-picked {
        background: var(--au-action-soft);
        border-color: var(--au-action);
        color: var(--au-action);
    }
    .preset:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
    .preset:focus-visible {
        outline: 3px solid var(--au-focus);
        outline-offset: 2px;
    }
</style>
