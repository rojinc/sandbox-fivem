<script>
    import { untrack } from 'svelte';
    import { Field, TextInput, Select, Radio, Button, Modal, Spinner, EmptyState, uid, formatMoney } from '@sandbox/ui-kit';
    import { app, startCooldown, cooldownLeft } from '../../state/app.svelte.js';
    import { accounts, same, getAccount, patchAccount, creditAccount, loadAccounts } from '../../state/accounts.svelte.js';
    import { api } from '../../lib/api.js';
    import { parseAmount, accountOption, accountLabel, accountName, accountType } from '../../lib/format.js';
    import ResultAlert from '../shared/ResultAlert.svelte';

    /** Transfer tab: Bank:Transfer to a State ID (type = true) or an account number (type = false). */
    const ids = { from: uid('from'), target: uid('to'), amount: uid('amt'), desc: uid('desc') };
    let form = $state({ from: '', mode: 'sid', target: '', amount: '', comments: '' });
    let errors = $state({});
    let alert = $state(null);
    let confirm = $state(null); // { account, value, mode, target, comments } while the dialog is open
    let busy = $state(false);

    const sources = $derived(accounts.items.filter((a) => a.Permissions?.WITHDRAW));
    const fromAccount = $derived(getAccount(form.from));
    const toSid = $derived(form.mode === 'sid');

    // Default source once the accounts are in, and apply a NAVIGATE prefill (previews / deep links) once.
    $effect(() => {
        const ready = accounts.status === 'ready';
        const pre = app.prefill;
        if (!ready) return;
        untrack(() => applyDefaults(pre?.transfer));
    });

    function applyDefaults(pre) {
        const current = getAccount(form.from);
        if (!current || !current.Permissions?.WITHDRAW) {
            const preferred = sources.find((a) => same(a.Account, accounts.selected)) ?? sources[0];
            form.from = preferred?.Account ?? '';
        }
        if (!pre) return;
        app.prefill = null;
        if (pre.from != null) form.from = Number(pre.from);
        if (pre.mode === 'sid' || pre.mode === 'account') form.mode = pre.mode;
        if (pre.target != null) form.target = String(pre.target);
        if (pre.amount != null) form.amount = String(pre.amount);
        if (pre.comments != null) form.comments = String(pre.comments);
        if (pre.submit) submit();
    }

    function validate() {
        const e = {};
        if (!fromAccount) e.from = 'Choose the account to send from.';
        const target = String(form.target).trim();
        if (!target) e.target = toSid ? 'Enter the State ID to send to.' : 'Enter the account number to send to.';
        else if (!/^\d+$/.test(target)) e.target = toSid ? 'A State ID is a number.' : 'An account number is a number.';
        else if (!toSid && fromAccount && same(target, fromAccount.Account)) e.target = 'You cannot transfer to the same account.';
        else if (toSid && fromAccount?.Type === 'personal' && same(target, app.character?.SID)) e.target = 'That State ID pays into this account. Choose a different destination.';
        const parsed = parseAmount(form.amount);
        if (parsed.error) e.amount = parsed.error;
        else if (fromAccount && parsed.value > fromAccount.Balance) e.amount = `This account only has ${formatMoney(fromAccount.Balance)} available.`;
        errors = e;
        return Object.keys(e).length ? null : parsed.value;
    }

    function submit(e) {
        e?.preventDefault();
        if (busy) return;
        const value = validate();
        if (value === null) {
            alert = { type: 'error', title: 'Check the form', message: 'Fix the highlighted fields and try again.' };
            return;
        }
        alert = null;
        confirm = { account: fromAccount, value, mode: form.mode, target: form.target.trim(), comments: form.comments.trim() };
    }

    function reset() {
        form.target = '';
        form.amount = '';
        form.comments = '';
        errors = {};
        alert = null;
    }

    async function send() {
        if (!confirm || busy) return;
        if (cooldownLeft() > 0) {
            confirm = null;
            alert = { type: 'warning', title: 'Please wait a moment', message: 'The bank accepts one transaction every 2 seconds. Try again shortly.' };
            return;
        }
        const c = confirm;
        busy = true;
        let res = null;
        try {
            res = await api.transfer(c.account.Account, c.mode === 'sid', c.target, c.value, c.comments);
        } catch {
            res = null;
        }
        busy = false;
        confirm = null;
        startCooldown();
        if (res && res.state) {
            // The server answers without a balance for transfers: mirror the move locally, then refresh quietly.
            const balance = typeof res.balance === 'number' ? res.balance : c.account.Balance - c.value;
            patchAccount(c.account.Account, { Balance: balance });
            if (c.mode === 'account') creditAccount(c.target, c.value);
            else if (same(c.target, app.character?.SID)) {
                const personal = accounts.items.find((a) => a.Type === 'personal');
                if (personal) creditAccount(personal.Account, c.value);
            }
            reset();
            alert = {
                type: 'success',
                title: 'Transfer sent',
                message: `${formatMoney(c.value)} sent from ${accountLabel(c.account)} to ${c.mode === 'sid' ? `State ID ${c.target}` : `account ${c.target}`}.`,
            };
            loadAccounts({ quiet: true });
        } else {
            alert = { type: 'error', title: 'Transfer declined', message: 'Check the destination and the available balance, then try again.' };
        }
    }
</script>

<div class="page-head">
    <div>
        <h1>Transfer money</h1>
        <p>Send money to a person by State ID, or to any account number. Transfers are immediate and cannot be reversed.</p>
    </div>
</div>

<div class="layout">
    <div>
        <ResultAlert {alert} onclose={() => (alert = null)} />

        {#if accounts.status === 'loading' || accounts.status === 'idle'}
            <div class="loading"><Spinner /><span>Loading your accounts</span></div>
        {:else if sources.length === 0}
            <EmptyState icon="lock" title="Nothing to send from">None of your accounts allow withdrawals.</EmptyState>
        {:else}
            <form onsubmit={submit} novalidate>
                <Field label="From account" id={ids.from} error={errors.from} required>
                    <Select id={ids.from} bind:value={form.from} options={sources.map(accountOption)} placeholder="Choose an account" invalid={Boolean(errors.from)} />
                </Field>

                <fieldset class="mode">
                    <legend>Send to</legend>
                    <div class="au-row radios">
                        <Radio bind:group={form.mode} value="sid" name="transfer-mode" label="A person (State ID)" />
                        <Radio bind:group={form.mode} value="account" name="transfer-mode" label="An account number" />
                    </div>
                </fieldset>

                <div class="pair">
                    <Field
                        label={toSid ? 'State ID' : 'Account number'}
                        id={ids.target}
                        hint={toSid ? 'Paid into their checking account' : 'As shown on their statement'}
                        error={errors.target}
                        required
                    >
                        <TextInput id={ids.target} bind:value={form.target} inputmode="numeric" autocomplete="off" mono invalid={Boolean(errors.target)} />
                    </Field>

                    <Field label="Amount" id={ids.amount} hint="Whole dollars" error={errors.amount} required>
                        <TextInput id={ids.amount} bind:value={form.amount} inputmode="numeric" autocomplete="off" placeholder="0" mono invalid={Boolean(errors.amount)} />
                    </Field>
                </div>

                <Field label="Description (optional)" id={ids.desc} hint="Shown on both statements">
                    <TextInput id={ids.desc} bind:value={form.comments} maxlength="80" autocomplete="off" />
                </Field>

                <div class="au-row">
                    <Button type="submit" icon="send">Review transfer</Button>
                    <Button variant="tertiary" onclick={reset}>Clear</Button>
                </div>
            </form>
        {/if}
    </div>

    <aside class="summary" aria-label="Sending account">
        <h2 class="section-title">Sending from</h2>
        {#if fromAccount}
            <div class="summary-balance au-mono">{formatMoney(fromAccount.Balance)}</div>
            <div class="au-hint">Available balance</div>
            <dl class="au-dl summary-dl">
                <dt>Account</dt>
                <dd class="au-mono">{fromAccount.Account}</dd>
                <dt>Name</dt>
                <dd>{accountName(fromAccount)}</dd>
                <dt>Type</dt>
                <dd>{accountType(fromAccount).label}</dd>
            </dl>
        {:else}
            <p class="au-muted">Choose an account to send from.</p>
        {/if}
        <p class="au-hint note">The bank accepts one transaction every 2 seconds. You cannot send money to another character of your own.</p>
    </aside>
</div>

{#if confirm}
    <Modal title="Confirm transfer" onclose={() => (confirm = null)} width="480px">
        <dl class="au-dl">
            <dt>From</dt>
            <dd>{accountLabel(confirm.account)}</dd>
            <dt>To</dt>
            <dd>{confirm.mode === 'sid' ? `State ID ${confirm.target}` : `Account ${confirm.target}`}</dd>
            <dt>Amount</dt>
            <dd class="au-mono">{formatMoney(confirm.value)}</dd>
            {#if confirm.comments}
                <dt>Description</dt>
                <dd>{confirm.comments}</dd>
            {/if}
        </dl>
        <p>This transfer is immediate and cannot be reversed.</p>
        {#snippet actions()}
            <Button variant="secondary" onclick={() => (confirm = null)} disabled={busy}>Cancel</Button>
            <Button onclick={send} loading={busy}>Send {formatMoney(confirm.value)}</Button>
        {/snippet}
    </Modal>
{/if}

<style>
    .layout {
        display: grid;
        grid-template-columns: minmax(0, 560px) 320px;
        gap: 48px;
        align-items: start;
    }
    .mode {
        border: 0;
        padding: 0;
        margin: 0 0 16px;
    }
    .mode legend {
        padding: 0;
        margin-bottom: 4px;
        font-size: var(--au-fs-xs);
        font-weight: 500;
    }
    .radios {
        gap: 24px;
    }
    .pair {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
    }
    .summary {
        background: var(--au-bg-shade);
        border: 1px solid var(--au-border);
        border-radius: var(--au-radius-lg);
        padding: 20px;
    }
    .summary-balance {
        font-size: var(--au-fs-xl);
        font-weight: 500;
        line-height: 1.2;
    }
    .summary-dl {
        margin: 16px 0;
        font-size: var(--au-fs-xs);
    }
    .note {
        margin: 0;
        padding-top: 12px;
        border-top: 1px solid var(--au-border);
    }
</style>
