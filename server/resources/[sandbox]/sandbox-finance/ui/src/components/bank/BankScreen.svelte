<script>
    import { onMount } from 'svelte';
    import { AppShell, Button, Icon, formatMoney } from '@sandbox/ui-kit';
    import { app, closeApp } from '../../state/app.svelte.js';
    import { accounts, loadAccounts, resetAccounts } from '../../state/accounts.svelte.js';
    import { resetTransactions } from '../../state/transactions.svelte.js';
    import { brandName, customerLine } from '../../lib/format.js';
    import AccountsPage from './AccountsPage.svelte';
    import TransferPage from './TransferPage.svelte';
    import TransactionsPage from './TransactionsPage.svelte';
    import ManagePage from './ManagePage.svelte';

    /** The branch console (SET_APP app = "BANK"): identity header, four sections. */
    const NAV = [
        { id: 'accounts', label: 'Accounts' },
        { id: 'transfer', label: 'Transfer' },
        { id: 'transactions', label: 'Transactions' },
        { id: 'manage', label: 'Manage' },
    ];

    const count = $derived(accounts.items.length);

    onMount(() => {
        loadAccounts();
        return () => {
            resetAccounts();
            resetTransactions();
        };
    });
</script>

<AppShell eyebrow="FLEECA" title="Online banking" subline={customerLine(app.character)} navItems={NAV} navActive={app.tab} onnav={(id) => (app.tab = id)}>
    {#snippet actions()}
        <span class="cash">Cash <span class="au-mono">{formatMoney(app.character?.Cash ?? 0)}</span></span>
        <Button variant="secondary" size="sm" icon="x" onclick={closeApp}>Close</Button>
    {/snippet}
    {#snippet footer()}
        <span class="meta"><Icon icon="building-bank" />{brandName(app.brand)} branch</span>
        {#if accounts.status === 'ready'}
            <span class="meta-right">{count} {count === 1 ? 'account' : 'accounts'}</span>
        {/if}
    {/snippet}

    {#if app.tab === 'transfer'}
        <TransferPage />
    {:else if app.tab === 'transactions'}
        <TransactionsPage />
    {:else if app.tab === 'manage'}
        <ManagePage />
    {:else}
        <AccountsPage />
    {/if}
</AppShell>

<style>
    .cash {
        color: var(--au-muted);
        font-size: var(--au-fs-xs);
        margin-right: 12px;
        white-space: nowrap;
    }
    .cash .au-mono {
        color: var(--au-text);
        font-size: var(--au-fs-sm);
        font-weight: 500;
        margin-left: 4px;
    }
    .meta {
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }
    .meta-right {
        margin-left: auto;
    }
</style>
