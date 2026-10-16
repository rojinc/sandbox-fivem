<script>
    import { onMount } from 'svelte';
    import { MainNav, Button, Spinner, PageAlert, EmptyState, formatMoney } from '@sandbox/ui-kit';
    import { app, closeApp } from '../../state/app.svelte.js';
    import { accounts, getAccount, loadAccounts, resetAccounts, selectAccount, same } from '../../state/accounts.svelte.js';
    import { accountName, customerLine } from '../../lib/format.js';
    import AtmCash from './AtmCash.svelte';

    /**
     * ATM (SET_APP app = "ATM"): the machine's housing with its screen, card
     * slot and one hardware key. Balance, withdraw and deposit only.
     */
    const NAV = [
        { id: 'balance', label: 'Balance' },
        { id: 'withdraw', label: 'Withdraw' },
        { id: 'deposit', label: 'Deposit' },
    ];

    const account = $derived(getAccount(accounts.selected));

    onMount(() => {
        loadAccounts();
        return () => resetAccounts();
    });
</script>

<div class="atm">
    <header class="atm__head">
        <div>
            <strong class="atm__eyebrow">FLEECA</strong>
            <div class="atm__title">Cash machine</div>
        </div>
        <span class="atm__cash">Cash <span class="au-mono">{formatMoney(app.character?.Cash ?? 0)}</span></span>
    </header>

    <div class="atm__bezel">
        <div class="atm__screen">
            <MainNav items={NAV} active={app.tab} onselect={(id) => (app.tab = id)} label="ATM" />
            <div class="atm__body">
                {#if accounts.status === 'loading' || accounts.status === 'idle'}
                    <div class="loading"><Spinner /><span>Reading your card</span></div>
                {:else if accounts.status === 'error'}
                    <PageAlert type="error" title="Card not read">We could not load your accounts. Remove the card and try again.</PageAlert>
                {:else if accounts.items.length === 0}
                    <EmptyState icon="credit-card" title="No accounts">This card has no accounts linked to it.</EmptyState>
                {:else if app.tab === 'withdraw' || app.tab === 'deposit'}
                    {#key app.tab}
                        <AtmCash kind={app.tab} />
                    {/key}
                {:else}
                    <div class="balance">
                        <div class="au-hint">Available balance</div>
                        <div class="balance__figure au-mono">{formatMoney(account?.Balance ?? 0)}</div>
                        <div class="au-muted balance__name">{account ? `${accountName(account)} · ${account.Account}` : 'Choose an account'}</div>
                    </div>

                    <div class="accounts" role="listbox" aria-label="Accounts">
                        {#each accounts.items as a (a.Account)}
                            <button
                                type="button"
                                class="acct"
                                class:is-selected={same(a.Account, accounts.selected)}
                                role="option"
                                aria-selected={same(a.Account, accounts.selected)}
                                onclick={() => selectAccount(a.Account)}
                            >
                                <span class="acct__name">{accountName(a)}</span>
                                <span class="acct__num au-mono">{a.Account}</span>
                                <span class="acct__bal au-mono">{formatMoney(a.Balance)}</span>
                            </button>
                        {/each}
                    </div>

                    <div class="actions">
                        <Button size="lg" block icon="arrow-up" disabled={!account?.Permissions?.WITHDRAW} onclick={() => (app.tab = 'withdraw')}>Withdraw cash</Button>
                        <Button size="lg" block variant="secondary" icon="arrow-down" disabled={!account?.Permissions?.DEPOSIT} onclick={() => (app.tab = 'deposit')}>Deposit cash</Button>
                    </div>
                {/if}
            </div>
        </div>
    </div>

    <footer class="atm__base">
        <div class="slot" aria-hidden="true"><span></span></div>
        <div class="atm__customer au-hint">{customerLine(app.character)}</div>
        <Button variant="secondary" size="sm" icon="credit-card" onclick={closeApp}>Remove card</Button>
    </footer>
</div>

<style>
    .atm {
        display: flex;
        flex-direction: column;
        gap: 16px;
        width: 100%;
        height: 100%;
        padding: 20px;
        background: var(--au-bg-shade);
        border: 1px solid var(--au-border-strong);
        border-radius: var(--au-radius-lg);
        box-shadow: var(--au-shadow-2);
        color: var(--au-text);
    }
    .atm__head {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 16px;
        padding: 0 4px;
    }
    .atm__eyebrow {
        display: block;
        color: var(--au-action);
        font-size: var(--au-fs-xxs);
        letter-spacing: 0.08em;
    }
    .atm__title {
        font-size: var(--au-fs-md);
        font-weight: 700;
        line-height: var(--au-lh-heading);
        margin-top: 2px;
    }
    .atm__cash {
        color: var(--au-muted);
        font-size: var(--au-fs-xs);
        white-space: nowrap;
    }
    .atm__cash .au-mono {
        color: var(--au-text);
        font-size: var(--au-fs-sm);
        font-weight: 500;
        margin-left: 4px;
    }

    /* The display, recessed into the housing behind a dark bezel. */
    .atm__bezel {
        flex: 1;
        min-height: 0;
        display: flex;
        padding: 6px;
        background: var(--au-bg-sunk);
        border: 1px solid var(--au-border);
        border-radius: 6px;
    }
    .atm__screen {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        background: var(--au-bg);
        border-radius: var(--au-radius);
        overflow: hidden;
    }
    .atm__body {
        flex: 1;
        min-height: 0;
        overflow: auto;
        padding: 20px 24px 24px;
    }

    .balance {
        text-align: center;
        padding: 8px 0 20px;
    }
    .balance__figure {
        font-size: var(--au-fs-xxl);
        font-weight: 500;
        line-height: 1.2;
        margin: 4px 0;
    }
    .balance__name {
        font-size: var(--au-fs-xs);
    }

    .accounts {
        display: flex;
        flex-direction: column;
        border: 1px solid var(--au-border);
        border-radius: var(--au-radius);
        overflow: hidden;
        margin-bottom: 20px;
    }
    .acct {
        display: grid;
        grid-template-columns: 1fr auto 120px;
        gap: 16px;
        align-items: center;
        height: 48px;
        padding: 0 16px;
        border: 0;
        border-bottom: 1px solid var(--au-border);
        background: transparent;
        color: var(--au-text);
        font: inherit;
        font-size: var(--au-fs-xs);
        text-align: left;
        cursor: pointer;
        transition: background var(--au-fast) var(--au-ease);
    }
    .acct:last-child {
        border-bottom: 0;
    }
    .acct:hover {
        background: var(--au-bg-alt);
    }
    .acct.is-selected {
        background: var(--au-bg-alt-shade);
    }
    .acct:focus-visible {
        outline: 3px solid var(--au-focus);
        outline-offset: -3px;
    }
    .acct__name {
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .acct__num {
        color: var(--au-muted);
    }
    .acct__bal {
        text-align: right;
    }
    .actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
    }

    /* Housing base: the card slot and the one hardware key. */
    .atm__base {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 0 4px;
    }
    .slot {
        flex-shrink: 0;
        width: 120px;
        height: 28px;
        display: grid;
        place-items: center;
        background: var(--au-bg-alt);
        border: 1px solid var(--au-border-strong);
        border-radius: var(--au-radius);
    }
    .slot span {
        width: 88px;
        height: 4px;
        border-radius: 2px;
        background: var(--au-bg-sunk);
    }
    .atm__customer {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>
