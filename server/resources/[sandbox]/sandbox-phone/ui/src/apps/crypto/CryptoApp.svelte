<script>
    import { onMount } from 'svelte';
    import { Button, Field, Select, Spinner, TextInput } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import AppPage from '../../components/common/AppPage.svelte';
    import Sheet from '../../components/common/Sheet.svelte';
    import { data } from '../../state/data.svelte.js';
    import { showAlert } from '../../state/notify.svelte.js';
    import { copyText } from '../../lib/clipboard.js';
    import { plain } from '../../lib/format.js';

    /** DigiDollar: coin prices, what you hold, and buy, sell or send coins. */
    let { app } = $props();

    let coins = $state([]);
    let loading = $state(false);
    let failed = $state(false);
    async function load() {
        if (loading) return;
        loading = true;
        failed = false;
        try {
            const res = await fetchNui('GetCryptoCoins');
            coins = Array.isArray(res) ? res : Object.values(res ?? {});
        } catch {
            failed = true;
        }
        loading = false;
    }
    onMount(load);

    const held = $derived(data.player?.Crypto ?? {});
    const sellPrice = (c) => (c.Sellable === true || Number.isNaN(Number(c.Sellable)) ? Number(c.Price) : Number(c.Sellable));
    const shown = $derived(coins.filter((c) => c && (c.Buyable || Number(held[c.Short]) > 0)));
    const worth = $derived(coins.reduce((sum, c) => (c && c.Sellable && held[c.Short] ? sum + Number(held[c.Short]) * sellPrice(c) : sum), 0));
    const usd = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n) || 0);

    let trade = $state(null); // { kind: 'buy'|'sell'|'send', coin, qty, target }
    let error = $state('');
    let busy = $state(false);

    function start(kind, coin) {
        trade = { kind, coin: coin?.Short ?? shown[0]?.Short ?? '', qty: '1', target: '' };
        error = '';
    }

    async function submit(e) {
        e?.preventDefault();
        const coin = coins.find((c) => c.Short === trade.coin);
        const qty = Number(trade.qty);
        if (!coin) return (error = 'Choose a coin.');
        if (!Number.isInteger(qty) || qty < 1) return (error = 'Enter a whole number of coins, 1 or more.');
        if (trade.kind !== 'buy' && qty > (Number(held[coin.Short]) || 0)) return (error = `You hold ${Number(held[coin.Short]) || 0} ${coin.Short}.`);
        if (trade.kind === 'send' && !String(trade.target).trim()) return (error = 'Enter the wallet address to send to.');
        error = '';
        busy = true;
        try {
            let ok;
            if (trade.kind === 'buy') ok = await fetchNui('BuyCrypto', { Short: coin.Short, Quantity: qty });
            else if (trade.kind === 'sell') {
                const res = await fetchNui('SellCrypto', { Short: coin.Short, Quantity: qty });
                ok = res && !res.error;
            } else ok = await fetchNui('TransferCrypto', { Short: coin.Short, Quantity: qty, Target: String(trade.target).trim() });
            const verb = { buy: 'Bought', sell: 'Sold', send: 'Sent' }[trade.kind];
            if (ok) {
                showAlert(`${verb} ${qty} ${coin.Short}`, 'success');
                trade = null;
                load();
            } else error = 'That did not go through. Check your balance and try again.';
        } catch {
            error = 'That did not go through. Try again.';
        }
        busy = false;
    }

    let wallet = $state(false);
</script>

<AppPage title={app?.label ?? 'DigiDollar'}>
    {#snippet actions()}
        <Button size="sm" variant="tertiary" onclick={() => (wallet = true)}>Wallet</Button>
    {/snippet}
    <dl class="ph-facts">
        <div><dt>Total value</dt><dd class="worth">{usd(worth)}</dd></div>
    </dl>
    {#if loading && !coins.length}
        <p class="ph-note state"><Spinner size={18} /> Loading prices</p>
    {:else if failed}
        <div class="ph-pad">
            <p class="err" role="alert">Prices could not be loaded.</p>
            <Button variant="secondary" onclick={load}>Try again</Button>
        </div>
    {:else if shown.length}
        <ul class="ph-list">
            {#each shown as c (c.Short)}
                <li class="coin">
                    <div class="coin__head">
                        <span><strong>{plain(c.Name)}</strong> <span class="au-mono">{c.Short}</span></span>
                        <span class="ph-num">{usd(c.Price)}</span>
                    </div>
                    <div class="coin__held">You hold {Number(held[c.Short]) || 0} {c.Short}</div>
                    <div class="coin__actions">
                        {#if c.Buyable}<Button size="sm" variant="secondary" onclick={() => start('buy', c)}>Buy</Button>{/if}
                        {#if c.Sellable && Number(held[c.Short]) > 0}<Button size="sm" variant="secondary" onclick={() => start('sell', c)}>Sell for {usd(sellPrice(c))} each</Button>{/if}
                        {#if Number(held[c.Short]) > 0}<Button size="sm" variant="tertiary" onclick={() => start('send', c)}>Send</Button>{/if}
                    </div>
                </li>
            {/each}
        </ul>
    {:else}
        <p class="ph-note">No coins are on sale right now.</p>
    {/if}
</AppPage>

<Sheet open={Boolean(trade)} title={trade ? { buy: 'Buy coins', sell: 'Sell coins', send: 'Send coins' }[trade.kind] : ''} onclose={() => (trade = null)}>
    {#if trade}
        <form id="cr-form" onsubmit={submit} novalidate>
            {#if error}<p class="err" role="alert"><span class="au-hidden">Error:</span> {error}</p>{/if}
            <Field label="Coin" id="cr-coin">
                <Select id="cr-coin" options={shown.map((c) => ({ value: c.Short, label: `${plain(c.Name)} (${c.Short})` }))} bind:value={trade.coin} />
            </Field>
            <Field label="How many" id="cr-qty">
                <TextInput id="cr-qty" bind:value={trade.qty} inputmode="numeric" maxlength="7" width="40%" block={false} />
            </Field>
            {#if trade.kind === 'send'}
                <Field label="Wallet address" hint="The address of the wallet you are sending to" id="cr-target">
                    <TextInput id="cr-target" mono bind:value={trade.target} autocomplete="off" />
                </Field>
            {/if}
        </form>
    {/if}
    {#snippet actions()}
        <Button type="submit" form="cr-form" loading={busy}>{trade ? { buy: 'Buy', sell: 'Sell', send: 'Send' }[trade.kind] : ''} coins</Button>
        <Button variant="secondary" onclick={() => (trade = null)}>Cancel</Button>
    {/snippet}
</Sheet>

<Sheet open={wallet} title="Your wallet" onclose={() => (wallet = false)}>
    <p>People send coins to this address.</p>
    <p class="au-mono addr">{data.player?.CryptoWallet ?? 'No wallet yet'}</p>
    {#snippet actions()}
        {#if data.player?.CryptoWallet}
            <Button onclick={() => showAlert(copyText(data.player.CryptoWallet) ? 'Wallet address copied' : 'The address could not be copied.')}>Copy address</Button>
        {/if}
        <Button variant="secondary" onclick={() => (wallet = false)}>Close</Button>
    {/snippet}
</Sheet>

<style>
    .worth {
        font-weight: 700;
    }
    .coin {
        padding: var(--au-s3) var(--au-s4);
    }
    .coin__head {
        display: flex;
        justify-content: space-between;
        gap: var(--au-s2);
    }
    .coin__held {
        color: var(--au-muted);
    }
    .coin__actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--au-s2);
        margin-top: var(--au-s2);
    }
    .addr {
        overflow-wrap: anywhere;
        user-select: text;
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
