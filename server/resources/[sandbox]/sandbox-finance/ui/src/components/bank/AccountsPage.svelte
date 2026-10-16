<script>
    import { PageAlert, Spinner, EmptyState, Button, formatMoney } from '@sandbox/ui-kit';
    import { app } from '../../state/app.svelte.js';
    import { accounts, selectAccount, loadAccounts } from '../../state/accounts.svelte.js';
    import AccountsTable from '../shared/AccountsTable.svelte';
    import ResultAlert from '../shared/ResultAlert.svelte';
    import CashForm from './CashForm.svelte';
    import RecentActivity from './RecentActivity.svelte';

    /** Accounts tab: every account the character can see, and cash in or out of the selected one. */
    let alert = $state(null);

    // Job accounts are not the character's money, so the headline total leaves them out.
    const personal = $derived(accounts.items.filter((a) => a.Type !== 'organization'));
    const total = $derived(personal.reduce((sum, a) => sum + (Number(a.Balance) || 0), 0));
</script>

<div class="page-head">
    <div>
        <h1>Your accounts</h1>
        <p>Accounts you own, hold jointly or use through your job. Select one to move cash.</p>
    </div>
    {#if accounts.status === 'ready' && personal.length}
        <div class="total">
            <span class="au-hint">Personal balance</span>
            <span class="au-mono">{formatMoney(total)}</span>
        </div>
    {/if}
</div>

{#if accounts.status === 'loading' || accounts.status === 'idle'}
    <div class="loading"><Spinner /><span>Loading your accounts</span></div>
{:else if accounts.status === 'error'}
    <PageAlert type="error" title="We could not load your accounts">Try again, or close the bank and reopen it.</PageAlert>
    <Button variant="secondary" icon="refresh" onclick={() => loadAccounts()}>Try again</Button>
{:else if accounts.items.length === 0}
    <EmptyState icon="building-bank" title="No accounts">
        You do not hold any accounts at this bank yet.
        {#snippet actions()}
            <Button variant="secondary" onclick={() => (app.tab = 'manage')}>Open a savings account</Button>
        {/snippet}
    </EmptyState>
{:else}
    <div class="layout">
        <div class="table-col">
            <AccountsTable rows={accounts.items} selected={accounts.selected} onselect={selectAccount} />
            <RecentActivity />
        </div>
        <section class="cash-panel" aria-labelledby="cash-title">
            <h2 class="section-title" id="cash-title">Deposit or withdraw cash</h2>
            <ResultAlert {alert} compact onclose={() => (alert = null)} />
            <CashForm onresult={(r) => (alert = r)} />
        </section>
    </div>
{/if}

<style>
    .layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 360px;
        gap: 24px;
        align-items: start;
    }
    .table-col {
        min-width: 0;
    }
    .cash-panel {
        background: var(--au-bg-shade);
        border: 1px solid var(--au-border);
        border-radius: var(--au-radius-lg);
        padding: 20px;
    }
</style>
