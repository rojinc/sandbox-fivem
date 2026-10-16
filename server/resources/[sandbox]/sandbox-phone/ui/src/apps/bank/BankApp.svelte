<script>
    import { onMount } from 'svelte';
    import { Button, EmptyState, PageAlert, Spinner } from '@sandbox/ui-kit';
    import AppPage from '../../components/common/AppPage.svelte';
    import AccountView from './AccountView.svelte';
    import Bills from './Bills.svelte';
    import MoneyForm from './MoneyForm.svelte';
    import { openApp } from '../../state/router.svelte.js';
    import { bank, loadBank, accounts, bills, accountName, sortAccounts, dollars } from './bank.svelte.js';

    /**
     * Fleeca: accounts (root), one account (view/:account), bills to pay (bill),
     * transfer/:account and send-bill/:account.
     */
    let { app, segs = [] } = $props();

    onMount(() => {
        if (Date.now() - bank.loadedAt > 2000) loadBank();
    });

    const list = $derived(sortAccounts(accounts()));
    const due = $derived(bills());
    const acc = $derived(segs[1] ? (list.find((a) => String(a.Account) === String(segs[1])) ?? null) : null);
</script>

{#if segs[0] === 'view'}
    <AccountView account={acc} />
{:else if segs[0] === 'bill'}
    <Bills />
{:else if segs[0] === 'transfer' || segs[0] === 'send-bill'}
    <MoneyForm account={acc} mode={segs[0] === 'transfer' ? 'transfer' : 'bill'} />
{:else}
    <AppPage title={app?.label ?? 'Fleeca'}>
        {#snippet actions()}
            <Button size="sm" variant="secondary" onclick={() => openApp('bank', 'bill')}>Bills{due.length ? ` (${due.length})` : ''}</Button>
        {/snippet}
        {#if bank.loading && !list.length}
            <div class="state"><Spinner size={20} /> Loading your accounts</div>
        {:else if bank.failed && !list.length}
            <div class="ph-pad">
                <p class="err" role="alert">Your accounts could not be loaded.</p>
                <Button variant="secondary" onclick={loadBank}>Try again</Button>
            </div>
        {:else}
            {#if due.length}
                <div class="ph-pad due">
                    <PageAlert type="warning" title="You have {due.length} {due.length === 1 ? 'bill' : 'bills'} to pay">
                        <Button size="sm" variant="secondary" onclick={() => openApp('bank', 'bill')}>See bills</Button>
                    </PageAlert>
                </div>
            {/if}
            {#if list.length}
                <ul class="ph-list">
                    {#each list as a (a.Account)}
                        <li>
                            <button type="button" class="ph-row" onclick={() => openApp('bank', `view/${a.Account}`)}>
                                <span class="ph-row__main">
                                    <span class="ph-row__title">{accountName(a)}</span>
                                    <span class="ph-row__sub au-mono">{a.Account}</span>
                                </span>
                                <span class="ph-row__side bal">{a.Permissions?.BALANCE === false ? 'Hidden' : dollars(a.Balance)}</span>
                            </button>
                        </li>
                    {/each}
                </ul>
                <div class="ph-actions">
                    <Button variant="tertiary" size="sm" loading={bank.loading} onclick={loadBank}>Refresh balances</Button>
                </div>
            {:else}
                <EmptyState title="No accounts">Open an account at any Fleeca branch to see it here.</EmptyState>
            {/if}
        {/if}
    </AppPage>
{/if}

<style>
    .state {
        display: flex;
        align-items: center;
        gap: var(--au-s3);
        padding: var(--au-s5) var(--au-s4);
        color: var(--au-muted);
    }
    .err {
        color: var(--au-error);
        font-weight: 700;
    }
    .due {
        padding-bottom: 0;
    }
    .bal {
        color: var(--au-text);
        font-weight: 700;
    }
</style>
