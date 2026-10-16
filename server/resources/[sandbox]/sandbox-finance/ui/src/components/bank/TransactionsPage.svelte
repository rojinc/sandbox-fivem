<script>
    import { untrack } from 'svelte';
    import { Toolbar, Select, Button, Tag, Spinner, EmptyState, PageAlert, formatMoney } from '@sandbox/ui-kit';
    import { faArrowRotateRight, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
    import { accounts, getAccount, selectAccount } from '../../state/accounts.svelte.js';
    import { transactions, loadTransactions, PER_PAGE } from '../../state/transactions.svelte.js';
    import { accountOption, accountName, txType, formatWhen, formatSigned } from '../../lib/format.js';

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

<h1>Transactions</h1>

<Toolbar>
    <span class="account-select">
        <Select
            aria-label="Account"
            value={accounts.selected ?? ''}
            options={visible.map(accountOption)}
            placeholder="Choose an account"
            size="sm"
            onchange={(e) => selectAccount(e.currentTarget.value)}
        />
    </span>
    <Button variant="secondary" size="sm" icon={faArrowRotateRight} disabled={!account || loading} onclick={() => goto(transactions.page)}>Refresh</Button>
    {#snippet right()}
        {#if account}
            <span class="au-hint">Balance</span>
            <span class="au-mono balance">{formatMoney(account.Balance)}</span>
        {/if}
    {/snippet}
</Toolbar>

{#if !account}
    <EmptyState title="No account selected">Choose an account to see its transactions.</EmptyState>
{:else if !allowed}
    <PageAlert type="info" title="No access">You do not have access to the transactions of {accountName(account)} ({account.Account}).</PageAlert>
{:else if loading && transactions.items.length === 0}
    <div class="loading"><Spinner /><span>Loading transactions</span></div>
{:else if transactions.status === 'error'}
    <PageAlert type="error" title="We could not load the transactions">Try refreshing, or close the bank and reopen it.</PageAlert>
{:else if transactions.items.length === 0}
    <EmptyState title={transactions.page > 0 ? 'No more transactions' : 'No transactions yet'}>
        {#if transactions.page > 0}
            Go back to the previous page.
        {:else}
            Deposits, withdrawals and transfers on this account will appear here.
        {/if}
    </EmptyState>
    {#if transactions.page > 0}
        <div class="pager">
            <Button variant="secondary" size="sm" icon={faChevronLeft} onclick={() => goto(transactions.page - 1)}>Previous</Button>
        </div>
    {/if}
{:else}
    <table class="au-table au-table--striped au-table--hover au-table--dense" class:is-busy={loading}>
        <thead>
            <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Title</th>
                <th>Description</th>
                <th class="is-numeric">Amount</th>
            </tr>
        </thead>
        <tbody>
            {#each transactions.items as t, i (i)}
                {@const type = txType(t)}
                <tr>
                    <td class="nowrap">{formatWhen(t.Timestamp)}</td>
                    <td><Tag tone={type.tone}>{type.label}</Tag></td>
                    <td class="nowrap">{t.Title}</td>
                    <td class="au-muted">{t.Description}</td>
                    <td class="is-numeric" class:is-credit={t.Amount > 0}>{formatSigned(t.Amount)}</td>
                </tr>
            {/each}
        </tbody>
    </table>

    <div class="pager">
        <span class="au-hint">Showing {first}–{last}{transactions.more ? '' : ' (last page)'} · newest first</span>
        <div class="au-row">
            <Button variant="secondary" size="sm" icon={faChevronLeft} disabled={transactions.page === 0 || loading} onclick={() => goto(transactions.page - 1)}>Previous</Button>
            <span class="page au-mono">Page {transactions.page + 1}</span>
            <Button variant="secondary" size="sm" iconRight={faChevronRight} disabled={!transactions.more || loading} onclick={() => goto(transactions.page + 1)}>Next</Button>
        </div>
    </div>
{/if}

<style>
    .account-select {
        display: inline-block;
        width: 420px;
    }
    .balance {
        font-weight: 700;
    }
    .pager {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        margin-top: 16px;
    }
    .page {
        padding: 0 8px;
    }
    .is-busy {
        opacity: 0.6;
    }
</style>
