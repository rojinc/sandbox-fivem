<script>
    import { untrack } from 'svelte';
    import { Button, Spinner } from '@sandbox/ui-kit';
    import { app } from '../../state/app.svelte.js';
    import { accounts, getAccount } from '../../state/accounts.svelte.js';
    import { api } from '../../lib/api.js';
    import { accountName, formatWhen, formatSigned, txDescription } from '../../lib/format.js';

    /**
     * The last few transactions of the selected account (Bank:GetTransactions,
     * offset 0). Reloads when the selection changes or money moves.
     */
    const COUNT = 5;

    let rows = $state([]);
    let status = $state('idle'); // idle | loading | ready | error
    let request = 0;

    const account = $derived(getAccount(accounts.selected));
    const allowed = $derived(Boolean(account?.Permissions?.TRANSACTIONS));

    $effect(() => {
        const id = allowed ? account.Account : null;
        void app.activity;
        untrack(() => load(id));
    });

    async function load(id) {
        const mine = ++request;
        if (id == null) {
            rows = [];
            status = 'idle';
            return;
        }
        if (!rows.length) status = 'loading';
        let res = null;
        try {
            res = await api.transactions(id, 0, COUNT);
        } catch {
            res = null;
        }
        if (mine !== request) return;
        const list = res && typeof res === 'object' ? (Array.isArray(res.data) ? res.data : Object.values(res.data ?? {})) : null;
        if (!list) {
            rows = [];
            status = 'error';
            return;
        }
        rows = list.filter(Boolean).slice(0, COUNT).map((t) => ({ ...t, Amount: Number(t.Amount) || 0 }));
        status = 'ready';
    }
</script>

<section class="recent" aria-labelledby="recent-title">
    <div class="recent__head">
        <h2 class="section-title" id="recent-title">
            Recent activity
            {#if account}<span class="au-muted account">{accountName(account)}</span>{/if}
        </h2>
        {#if allowed}
            <Button variant="tertiary" size="sm" iconRight="chevron-right" onclick={() => (app.tab = 'transactions')}>All transactions</Button>
        {/if}
    </div>
    {#if !account}
        <p class="au-hint">Select an account to see its recent activity.</p>
    {:else if !allowed}
        <p class="au-hint">You cannot view the transactions of this account.</p>
    {:else if status === 'loading'}
        <div class="loading"><Spinner size={16} /><span>Loading recent activity</span></div>
    {:else if status === 'error'}
        <p class="au-hint">Recent activity is not available right now.</p>
    {:else if rows.length === 0}
        <p class="au-hint">No transactions on this account yet.</p>
    {:else}
        <table class="au-table au-table--dense">
            <tbody>
                {#each rows as t, i (i)}
                    <tr>
                        <td class="nowrap au-muted col-when">{formatWhen(t.Timestamp)}</td>
                        <td class="nowrap col-title">{t.Title}</td>
                        <td class="au-muted au-truncate desc" title={txDescription(t)}>{txDescription(t)}</td>
                        <td class="is-numeric col-amount" class:is-credit={t.Amount > 0}>{formatSigned(t.Amount)}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {/if}
</section>

<style>
    .recent {
        margin-top: 32px;
    }
    .recent__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 4px;
    }
    .recent__head .section-title {
        margin: 0;
    }
    .recent__head .account {
        margin-left: 8px;
        font-weight: 400;
    }
    table {
        table-layout: fixed;
    }
    td {
        height: 32px;
    }
    .col-when {
        width: 150px;
    }
    .col-title {
        width: 200px;
    }
    .col-amount {
        width: 120px;
    }
    .desc {
        max-width: 0;
    }
    .loading {
        padding: 12px 0;
    }
</style>
