<script>
    import { Button, Modal, PageAlert, Icon } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import { showAlert } from '../../state/notify.svelte.js';
    import { crypto, formatNumber } from '../../lib/format.js';

    /**
     * The black market: items for crypto, collected at the day's pickup
     * location. Up to 5 of each item per order, never more than the stock.
     */
    let { items = [], banned = false, onordered } = $props();

    const MAX_EACH = 5;

    let cart = $state({}); // { [id]: quantity }
    let checkingOut = $state(false);
    let busy = $state(false);
    let failure = $state(null);

    const rows = $derived(items.filter((i) => i && i.id !== undefined));
    const lines = $derived(rows.filter((i) => cart[i.id] > 0).map((i) => ({ item: i, quantity: cart[i.id] })));
    const totals = $derived.by(() => {
        const t = {};
        for (const { item, quantity } of lines) t[item.coin] = (t[item.coin] ?? 0) + item.price * quantity;
        return Object.entries(t);
    });
    const count = $derived(lines.reduce((n, l) => n + l.quantity, 0));

    function stockLeft(item) {
        return Number(item.qty) === -1 ? Infinity : Math.max(0, Number(item.qty) || 0);
    }

    function canAdd(item) {
        if (item.delayed) return false;
        const q = cart[item.id] ?? 0;
        return q < MAX_EACH && q < stockLeft(item);
    }

    function add(item) {
        if (canAdd(item)) cart[item.id] = (cart[item.id] ?? 0) + 1;
    }

    function remove(item) {
        const q = cart[item.id] ?? 0;
        if (q > 1) cart[item.id] = q - 1;
        else delete cart[item.id];
    }

    function stockText(item) {
        if (item.delayed) return 'Not for sale yet';
        if (Number(item.qty) === -1) return 'In stock';
        if ((Number(item.qty) || 0) <= 0) return 'Sold out';
        return `${formatNumber(item.qty)} left`;
    }

    async function checkout() {
        busy = true;
        failure = null;
        const body = lines.map(({ item, quantity }) => ({ ...item, quantity }));
        const res = await fetchNui('LSUNDG:Market:Checkout', body);
        busy = false;
        if (res && typeof res === 'object' && res.success) {
            checkingOut = false;
            cart = {};
            showAlert('Order placed. Your GPS shows the pickup location.', 'success');
            onordered?.();
        } else {
            failure = 'The order did not go through. Check you have enough crypto and that the items are still in stock.';
        }
    }
</script>

{#if banned}
    <PageAlert type="error" title="You are banned from LS Underground">You cannot buy from the market.</PageAlert>
{:else}
    <section class="section">
        <div class="section-head">
            <h3 class="heading">Market</h3>
        </div>
        <p class="lead">Pay in crypto and collect your order from the dock worker at today's pickup location. You can order up to 5 of each item.</p>
        {#if rows.length}
            <table class="au-table">
                <thead>
                    <tr>
                        <th scope="col">Item</th>
                        <th scope="col" class="is-numeric">Price</th>
                        <th scope="col">Stock</th>
                        <th scope="col" class="cell-actions">In order</th>
                    </tr>
                </thead>
                <tbody>
                    {#each rows as item (item.id)}
                        {@const q = cart[item.id] ?? 0}
                        <tr class:is-selected={q > 0}>
                            <td>{item.itemData?.label ?? item.item}</td>
                            <td class="is-numeric">{crypto(item.price, item.coin)}</td>
                            <td class:au-muted={item.delayed || Number(item.qty) === 0}>{stockText(item)}</td>
                            <td class="cell-actions">
                                <div class="qty">
                                    <button type="button" class="qty__btn" aria-label="Remove one {item.itemData?.label ?? item.item}" disabled={q === 0 || busy} onclick={() => remove(item)}><Icon icon="minus" stroke={2} /></button>
                                    <span class="qty__n au-mono" aria-live="polite">{q}</span>
                                    <button type="button" class="qty__btn" aria-label="Add one {item.itemData?.label ?? item.item}" disabled={!canAdd(item) || busy} onclick={() => add(item)}><Icon icon="plus" stroke={2} /></button>
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>

            <div class="order">
                {#if count}
                    <p class="order__sum"><strong>{count} {count === 1 ? 'item' : 'items'}</strong> for {totals.map(([coin, sum]) => crypto(sum, coin)).join(' and ')}</p>
                    <Button onclick={() => (checkingOut = true)}>Review order</Button>
                {:else}
                    <p class="order__sum au-muted">Add items to start an order.</p>
                {/if}
            </div>
        {:else}
            <div class="state">
                <strong>Nothing for sale for you yet</strong>
                <p>The market shows items your reputation unlocks. Some need a phone VPN. Race and chop vehicles to unlock more.</p>
            </div>
        {/if}
    </section>
{/if}

{#if checkingOut}
    <Modal title="Place this order?" onclose={() => !busy && (checkingOut = false)} width="560px">
        {#if failure}<PageAlert type="error" compact>{failure}</PageAlert>{/if}
        <table class="au-table">
            <thead>
                <tr>
                    <th scope="col">Item</th>
                    <th scope="col" class="is-numeric">Quantity</th>
                    <th scope="col" class="is-numeric">Cost</th>
                </tr>
            </thead>
            <tbody>
                {#each lines as { item, quantity } (item.id)}
                    <tr>
                        <td>{item.itemData?.label ?? item.item}</td>
                        <td class="is-numeric">{quantity}</td>
                        <td class="is-numeric">{crypto(item.price * quantity, item.coin)}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
        <p class="modal-note au-muted">The crypto leaves your wallet now. Collect the items at today's pickup location.</p>
        {#snippet actions()}
            <Button variant="secondary" disabled={busy} onclick={() => (checkingOut = false)}>Keep shopping</Button>
            <Button loading={busy} onclick={checkout}>Pay {totals.map(([coin, sum]) => crypto(sum, coin)).join(' and ')}</Button>
        {/snippet}
    </Modal>
{/if}

<style>
    .qty {
        display: inline-flex;
        align-items: center;
        gap: var(--au-s1);
    }
    .qty__btn {
        width: 36px;
        height: 36px;
        display: grid;
        place-items: center;
        border: 2px solid var(--au-ink);
        background: var(--au-input-bg);
        color: var(--au-text);
        cursor: pointer;
    }
    .qty__btn:hover:not(:disabled) {
        background: var(--au-bg-alt-shade);
    }
    .qty__btn:focus-visible {
        outline: 3px solid var(--au-focus);
        outline-offset: 0;
    }
    .qty__btn:disabled {
        opacity: 0.35;
        cursor: not-allowed;
    }
    .qty__n {
        min-width: 2.5em;
        text-align: center;
    }
    .order {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--au-s4);
        margin-top: var(--au-s4);
    }
    .order__sum {
        margin: 0;
    }
    .modal-note {
        margin: var(--au-s4) 0 0;
    }
</style>
