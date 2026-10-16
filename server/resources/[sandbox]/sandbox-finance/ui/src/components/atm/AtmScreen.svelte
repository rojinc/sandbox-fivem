<script>
    import { onMount } from 'svelte';
    import { AppShell, Button, Tag, Kbd, Spinner, PageAlert, EmptyState, formatMoney } from '@sandbox/ui-kit';
    import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
    import { app, closeApp } from '../../state/app.svelte.js';
    import { accounts, loadAccounts, resetAccounts, selectAccount } from '../../state/accounts.svelte.js';
    import { brandShort, customerLine } from '../../lib/format.js';
    import AccountsTable from '../shared/AccountsTable.svelte';
    import MoneyForm from '../shared/MoneyForm.svelte';
    import ResultAlert from '../shared/ResultAlert.svelte';

    /** ATM (SET_APP app = "ATM"): the same page system in a narrower frame, balance / withdraw / deposit only. */
    const NAV = [
        { id: 'balance', label: 'Balance' },
        { id: 'withdraw', label: 'Withdraw' },
        { id: 'deposit', label: 'Deposit' },
    ];
    let alert = $state(null);

    onMount(() => {
        loadAccounts();
        return () => resetAccounts();
    });

    function pickTab(id) {
        app.tab = id;
        alert = null;
    }
</script>

<AppShell title="{brandShort(app.brand)} ATM" subline={customerLine(app.character)} navItems={NAV} navActive={app.tab} onnav={pickTab}>
    {#snippet actions()}
        <Tag solid class="cash-tag">
            <span class="au-muted">Cash</span>
            <span class="au-mono">{formatMoney(app.character?.Cash ?? 0)}</span>
        </Tag>
        <Button variant="secondary" size="sm" icon={faRightFromBracket} onclick={closeApp}>Remove card</Button>
    {/snippet}
    {#snippet footer()}
        <span>{brandShort(app.brand)} ATM</span>
        <span class="foot-spacer"></span>
        <span><Kbd>Esc</Kbd> Remove card</span>
    {/snippet}

    {#if accounts.status === 'loading' || accounts.status === 'idle'}
        <div class="loading"><Spinner /><span>Reading your card</span></div>
    {:else if accounts.status === 'error'}
        <PageAlert type="error" title="Card not recognised">We could not load your accounts. Remove the card and try again.</PageAlert>
    {:else if accounts.items.length === 0}
        <EmptyState title="No accounts">This card has no accounts linked to it.</EmptyState>
    {:else if app.tab === 'withdraw'}
        <h1>Withdraw cash</h1>
        <ResultAlert {alert} onclose={() => (alert = null)} />
        <MoneyForm action="withdraw" pickAccount heading={false} onresult={(r) => (alert = r)} />
    {:else if app.tab === 'deposit'}
        <h1>Deposit cash</h1>
        <ResultAlert {alert} onclose={() => (alert = null)} />
        <MoneyForm action="deposit" pickAccount heading={false} onresult={(r) => (alert = r)} />
    {:else}
        <h1>Balance</h1>
        <AccountsTable rows={accounts.items} compact selected={accounts.selected} onselect={selectAccount} />
        <p class="au-hint atm-hint">Select an account, then choose Withdraw or Deposit.</p>
    {/if}
</AppShell>

<style>
    .atm-hint {
        margin-top: 12px;
    }
</style>
