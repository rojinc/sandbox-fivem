<script>
    import { PageAlert, Spinner, EmptyState, Button, Field, Select, uid } from '@sandbox/ui-kit';
    import { accounts, selectAccount, loadAccounts } from '../../state/accounts.svelte.js';
    import { accountOption } from '../../lib/format.js';
    import AccountsTable from '../shared/AccountsTable.svelte';
    import MoneyForm from '../shared/MoneyForm.svelte';
    import ResultAlert from '../shared/ResultAlert.svelte';

    /** Accounts tab: every account the character can see, plus cash deposits and withdrawals. */
    let alert = $state(null);
    const selectId = uid('acct');
</script>

<h1>Your accounts</h1>
<p class="lead">Every account you own, hold jointly or can use through your job. Select an account to deposit or withdraw cash.</p>

{#if accounts.status === 'loading' || accounts.status === 'idle'}
    <div class="loading"><Spinner /><span>Loading your accounts</span></div>
{:else if accounts.status === 'error'}
    <PageAlert type="error" title="We could not load your accounts">Try again, or close the bank and reopen it.</PageAlert>
    <Button variant="secondary" onclick={() => loadAccounts()}>Try again</Button>
{:else if accounts.items.length === 0}
    <EmptyState title="No accounts">You do not hold any accounts at this bank. Open a savings account from the Manage tab.</EmptyState>
{:else}
    <AccountsTable rows={accounts.items} selected={accounts.selected} onselect={selectAccount} />

    <section class="cash-actions">
        <h2>Deposit or withdraw cash</h2>
        <ResultAlert {alert} onclose={() => (alert = null)} />
        <Field label="Account" id={selectId} hint="Select a row above or choose here">
            <Select
                id={selectId}
                value={accounts.selected ?? ''}
                options={accounts.items.map(accountOption)}
                placeholder="Choose an account"
                block={false}
                class="account-select"
                onchange={(e) => selectAccount(e.currentTarget.value)}
            />
        </Field>
        <div class="two-col">
            <MoneyForm action="deposit" onresult={(r) => (alert = r)} />
            <MoneyForm action="withdraw" onresult={(r) => (alert = r)} />
        </div>
    </section>
{/if}

<style>
    .cash-actions {
        margin-top: 32px;
        padding-top: 24px;
        border-top: 1px solid var(--au-bg-alt-shade);
    }
    .cash-actions :global(.account-select) {
        min-width: 420px;
    }
</style>
