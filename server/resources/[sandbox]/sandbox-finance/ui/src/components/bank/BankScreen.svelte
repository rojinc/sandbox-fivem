<script>
    import { onMount } from 'svelte';
    import { AppShell, Button, Tag, Kbd, formatMoney } from '@sandbox/ui-kit';
    import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
    import { app, closeApp } from '../../state/app.svelte.js';
    import { loadAccounts, resetAccounts } from '../../state/accounts.svelte.js';
    import { resetTransactions } from '../../state/transactions.svelte.js';
    import { brandName, customerLine } from '../../lib/format.js';
    import Wordmark from '../shared/Wordmark.svelte';
    import AccountsPage from './AccountsPage.svelte';
    import TransferPage from './TransferPage.svelte';
    import TransactionsPage from './TransactionsPage.svelte';
    import ManagePage from './ManagePage.svelte';

    /** The branch portal (SET_APP app = "BANK"): one gov page with four tabs. */
    const NAV = [
        { id: 'accounts', label: 'Accounts' },
        { id: 'transfer', label: 'Transfer' },
        { id: 'transactions', label: 'Transactions' },
        { id: 'manage', label: 'Manage' },
    ];

    onMount(() => {
        loadAccounts();
        return () => {
            resetAccounts();
            resetTransactions();
        };
    });
</script>

<AppShell title={brandName(app.brand)} subline={customerLine(app.character)} navItems={NAV} navActive={app.tab} onnav={(id) => (app.tab = id)}>
    {#snippet brand()}<Wordmark />{/snippet}
    {#snippet actions()}
        <Tag solid class="cash-tag">
            <span class="au-muted">Cash on hand</span>
            <span class="au-mono">{formatMoney(app.character?.Cash ?? 0)}</span>
        </Tag>
        <Button variant="secondary" size="sm" icon={faRightFromBracket} onclick={closeApp}>Close</Button>
    {/snippet}
    {#snippet footer()}
        <span>{brandName(app.brand)} · Online banking</span>
        <span class="foot-spacer"></span>
        <span><Kbd>Tab</Kbd> Next field</span>
        <span><Kbd>Esc</Kbd> Close</span>
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
