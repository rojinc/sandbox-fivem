<script>
    import { untrack } from 'svelte';
    import { Select, Button, Tag, Spinner, EmptyState, PageAlert, formatMoney } from '@sandbox/ui-kit';
    import { accounts, getAccount, selectAccount } from '../../state/accounts.svelte.js';
    import { transactions, loadTransactions, PER_PAGE } from '../../state/transactions.svelte.js';
    import { accountOption, accountName, txType, formatWhen, formatSigned, txDescription } from '../../lib/format.js';

    /** Transactions tab: one server page (Bank:GetTransactions) of the selected account, newest first. */
    const visible = $derived(accounts.items.filter((a) => a.Permissions?.TRANSACTIONS));
    const account = $derived(getAccount(accounts.selected));
    const allowed = $derived(Boolean(account?.Permissions?.TRANSACTIONS));
    const loading = $derived(transactions.status === 'loading');
    const first = $derived(transactions.page * PER_PAGE + 1);
    const last = $derived(transactions.page * PER_PAGE + transactions.items.length);

    // Reload whenever the selected account changes (and on first mount).
    $effect(() => {
        const ready = accounts.status === 'ready';
        const id = allowed ? (account?.Account ?? null) : null;
        untrack(() => {
            if (!ready) return;
            if (id !== transactions.account || transactions.status === 'idle') loadTransactions(id, 0);
        });
    });

    const goto = (page) => loadTransactions(account.Account, page);
</script>

<div class="page-head">
    <div>
        <h1>Transactions</h1>
        <p>
            {#if account}
                {accountName(account)} <span class="au-mono">{account.Account}</span> · balance <span class="au-mono figure">{formatMoney(account.Balance)}</span>
            {:else}
                Newest first, {PER_PAGE} to a page.
            {/if}
        </p>
    </div>
    <div class="au-row controls">
        <span class="account-select">
            <Select aria-label="Account" value={accounts.selected ?? ''} options={visible.map(accountOption)} placeholder="Choose an account" size="sm" onchange={(e) => selectAccount(e.currentTarget.value)} />
        </span>
        <Button variant="secondary" size="sm" icon="refresh" disabled={!allowed || loading} onclick={() => goto(transactions.page)}>Refresh</Button>
    </div>
</div>

{#if accounts.status === 'loading' || accounts.status === 'idle'}
    <div class="loading"><Spinner /><span>Loading your accounts</span></div>
{:else if !account}
    <EmptyState title="No account selected">Choose an account to see its transactions.</EmptyState>
{:else if !allowed}
    <PageAlert type="info" title="No access">You cannot view the transactions of {accountName(account)} ({account.Account}).</PageAlert>
{:else if loading && transactions.items.length === 0}
    <div class="loading"><Spinner /><span>Loading transactions</span></div>
{:else if transactions.status === 'error'}
    <PageAlert type="error" title="We could not load the transactions">Try refreshing, or close the bank and reopen it.</PageAlert>
{:else if transactions.items.length === 0}
    <EmptyState icon="receipt" title={transactions.page > 0 ? 'No more transactions' : 'No transactions yet'}>
        {#if transactions.page > 0}
            Go back to the previous page.
        {:else}
            Deposits, withdrawals and transfers on this account will appear here.
        {/if}
        {#snippet actions()}
            {#if transactions.page > 0}
                <Button variant="secondary" size="sm" icon="chevron-left" onclick={() => goto(transactions.page - 1)}>Previous</Button>
            {/if}
        {/snippet}
    </EmptyState>
{:else}
    <table class="au-table au-table--hover au-table--dense tx" class:is-busy={loading}>
        <thead>
            <tr>
                <th class="col-date">Date</th>
                <th class="col-type">Type</th>
                <th class="col-title">Title</th>
                <th>Description</th>
                <th class="is-numeric col-amount">Amount</th>
            </tr>
        </thead>
        <tbody>
            {#each transactions.items as t, i (i)}
                {@const type = txType(t)}
                <tr>
                    <td class="nowrap au-muted">{formatWhen(t.Timestamp)}</td>
                    <td><Tag tone={type.tone}>{type.label}</Tag></td>
                    <td class="nowrap">{t.Title}</td>
                    <td class="au-muted au-truncate desc" title={txDescription(t)}>{txDescription(t)}</td>
                    <td class="is-numeric" class:is-credit={t.Amount > 0}>{formatSigned(t.Amount)}</td>
                </tr>
            {/each}
        </tbody>
    </table>

    <div class="pager">
        <span class="au-hint">Showing <span class="au-mono">{first}–{last}</span>{transactions.more ? '' : ', the oldest on record'}</span>
        <div class="au-row">
            <Button variant="secondary" size="sm" icon="chevron-left" disabled={transactions.page === 0 || loading} onclick={() => goto(transactions.page - 1)}>Previous</Button>
            <span class="page au-mono">Page {transactions.page + 1}</span>
            <Button variant="secondary" size="sm" iconRight="chevron-right" disabled={!transactions.more || loading} onclick={() => goto(transactions.page + 1)}>Next</Button>
        </div>
    </div>
{/if}

<style>
    .controls {
        flex-wrap: nowrap;
    }
    .account-select {
        display: inline-block;
        width: 360px;
    }
    .figure {
        color: var(--au-text);
    }
    .tx {
        table-layout: fixed;
    }
    .tx td {
        height: 30px;
    }
    .col-date {
        width: 168px;
    }
    .col-type {
        width: 124px;
    }
    .col-title {
        width: 220px;
    }
    .col-amount {
        width: 140px;
    }
    .desc {
        max-width: 0;
    }
    .pager {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        margin-top: 12px;
    }
    .page {
        padding: 0 8px;
        font-size: var(--au-fs-xs);
        color: var(--au-muted);
    }
    .is-busy {
        opacity: 0.6;
    }
</style>
