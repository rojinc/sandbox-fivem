<script>
    import { Button, Spinner } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import AppPage from '../../components/common/AppPage.svelte';
    import { openApp } from '../../state/router.svelte.js';
    import { accountName, accountType, dollars, bankTime, bank } from './bank.svelte.js';
    import { stamp, plain } from '../../lib/format.js';

    /** One account: its balance, money in and out, and transfer or bill actions. */
    let { account } = $props();

    const PER_PAGE = 15;
    let tx = $state([]);
    let more = $state(false);
    let loading = $state(false);
    let failed = $state(false);

    async function loadTx(reset = false) {
        if (!account?.Permissions?.TRANSACTIONS || loading) return;
        loading = true;
        failed = false;
        try {
            const res = await fetchNui('Banking:GetTransactions', { account: account.Account, offset: reset ? 0 : tx.length, perPage: PER_PAGE });
            const rows = Array.isArray(res?.data) ? res.data : Object.values(res?.data ?? {});
            tx = reset ? rows : [...tx, ...rows];
            more = Boolean(res?.more) && tx.length < 100;
        } catch {
            failed = true;
        }
        loading = false;
    }

    let loadedFor = null;
    $effect(() => {
        if (account && loadedFor !== account.Account) {
            loadedFor = account.Account;
            loadTx(true);
        }
    });
</script>

<AppPage title={account ? accountName(account) : 'Account'}>
    {#if account}
        <dl class="ph-facts">
            <div><dt>Balance</dt><dd class="bal">{account.Permissions?.BALANCE === false ? 'You cannot see this balance' : dollars(account.Balance)}</dd></div>
            <div><dt>Account number</dt><dd class="au-mono">{account.Account}</dd></div>
            <div><dt>Type</dt><dd>{accountType(account)}</dd></div>
        </dl>
        {#if account.Permissions?.WITHDRAW || account.Permissions?.BILL}
            <div class="ph-actions">
                {#if account.Permissions?.WITHDRAW}<Button onclick={() => openApp('bank', `transfer/${account.Account}`)}>Transfer money</Button>{/if}
                {#if account.Permissions?.BILL}<Button variant="secondary" onclick={() => openApp('bank', `send-bill/${account.Account}`)}>Send a bill</Button>{/if}
            </div>
        {/if}

        {#if account.Permissions?.TRANSACTIONS}
            <h2 class="ph-section">Money in and out</h2>
            {#if tx.length}
                <ul class="ph-list">
                    {#each tx as t, i (t.Id ?? `${t.Timestamp}-${i}`)}
                        <li class="tx">
                            <span class="tx__main">
                                <span class="tx__title">{plain(t.Title) || 'Transaction'}</span>
                                {#if t.Description}<span class="tx__sub">{plain(t.Description)}</span>{/if}
                                <span class="tx__sub">{stamp(bankTime(t.Timestamp))}</span>
                            </span>
                            <span class="tx__amt ph-num" class:in={Number(t.Amount) > 0}>{Number(t.Amount) > 0 ? '+' : '−'}{dollars(Math.abs(Number(t.Amount) || 0))}</span>
                        </li>
                    {/each}
                </ul>
                {#if more}
                    <div class="ph-actions"><Button size="sm" variant="secondary" loading={loading} onclick={() => loadTx()}>Show older transactions</Button></div>
                {/if}
            {:else if loading}
                <p class="ph-note state"><Spinner size={18} /> Loading transactions</p>
            {:else if failed}
                <div class="ph-pad">
                    <p class="err" role="alert">Transactions could not be loaded.</p>
                    <Button size="sm" variant="secondary" onclick={() => loadTx(true)}>Try again</Button>
                </div>
            {:else}
                <p class="ph-note">No money has moved in or out of this account yet.</p>
            {/if}
        {/if}
    {:else if bank.loading}
        <p class="ph-note state"><Spinner size={18} /> Loading account</p>
    {:else}
        <div class="ph-pad">
            <p>You no longer have access to this account.</p>
            <Button variant="secondary" onclick={() => openApp('bank')}>See your accounts</Button>
        </div>
    {/if}
</AppPage>

<style>
    .bal {
        font-weight: 700;
    }
    .tx {
        display: flex;
        align-items: flex-start;
        gap: var(--au-s3);
        padding: var(--au-s2) var(--au-s4);
    }
    .tx__main {
        flex: 1;
        min-width: 0;
    }
    .tx__title {
        display: block;
        font-weight: 700;
        overflow-wrap: anywhere;
    }
    .tx__sub {
        display: block;
        color: var(--au-muted);
        overflow-wrap: anywhere;
    }
    .tx__amt {
        flex-shrink: 0;
        font-weight: 700;
        text-align: right;
    }
    .tx__amt.in {
        color: var(--au-success);
    }
    .state {
        display: flex;
        align-items: center;
        gap: var(--au-s2);
    }
    .err {
        color: var(--au-error);
        font-weight: 700;
    }
</style>
