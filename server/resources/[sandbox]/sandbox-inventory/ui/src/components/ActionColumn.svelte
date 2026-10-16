<script>
    import { Button, Checkbox, Field, PageAlert, TextInput } from '@sandbox/ui-kit';
    import { app } from '../state/app.svelte.js';
    import { catalog } from '../state/catalog.svelte.js';
    import { inv, slotItem } from '../state/inventory.svelte.js';
    import { ui } from '../state/ui.svelte.js';
    import { itemDef, itemLabel, formatCount, formatPrice, unitPrice } from '../lib/item.js';
    import { quickTransfer, useSlot, submitAddToShop, closeInventory, saveSettings } from '../lib/actions.js';

    /**
     * Between the panels: the selected item, the amount field and the actions
     * for it, the add-to-shop form, inline messages, sound and Close.
     */
    const sel = $derived(ui.selection);
    const instance = $derived(sel ? slotItem(sel.side, sel.slot) : null);
    const def = $derived(instance ? itemDef(catalog.items, instance.Name) : null);
    const label = $derived(instance ? itemLabel(instance, def) : '');
    const count = $derived(Math.max(1, Number(instance?.Count) || 1));
    const max = $derived(Math.min(count, 10000));

    const crafting = $derived(app.mode === 'crafting');
    const fromSecondary = $derived(sel?.side === 'secondary');
    const shop = $derived(fromSecondary && (inv.secondary.shop || (inv.secondary.playerShop && !inv.secondary.modifyShop)));
    const canCross = $derived(!crafting && inv.showSecondary && inv.secondary.loaded);
    const toShop = $derived(!fromSecondary && inv.secondary.playerShop && inv.secondary.modifyShop);
    const blockedTarget = $derived(!fromSecondary && (inv.secondary.shop || (inv.secondary.playerShop && !inv.secondary.modifyShop)));
    // Generic containers read better in sentence case; named places keep their name.
    const PLACES = { 4: 'the trunk', 5: 'the glovebox', 10: 'the ground' };
    const otherName = $derived(fromSecondary ? 'your inventory' : (PLACES[Number(inv.secondary.invType)] ?? (inv.secondary.name || 'storage')));

    const parsed = $derived(Math.floor(Number(ui.amount)));
    const amountValid = $derived(ui.amount !== '' && Number.isFinite(parsed) && parsed >= 1 && parsed <= max && String(ui.amount).trim() !== '');
    const amountError = $derived(ui.amount !== '' && !amountValid ? `Enter a number from 1 to ${formatCount(max)}.` : null);
    const amount = $derived(amountValid ? parsed : max);
    const price = $derived(shop && instance ? unitPrice(instance, def, inv.secondary) : 0);

    const emptyPlayer = $derived(inv.player.loaded && inv.player.inventory.length === 0);

    function move() {
        quickTransfer(sel.side, sel.slot, amount);
    }

    function use() {
        useSlot(sel.side, sel.slot);
    }
</script>

<div class="col au-overworld">
    {#if ui.addToShop}
        {@const form = ui.addToShop}
        <form
            class="block"
            onsubmit={(e) => {
                e.preventDefault();
                submitAddToShop();
            }}
        >
            <h3 class="name name--form">Add {form.label} to the shop</h3>
            <Field label="Quantity" id="shop-qty" hint={form.stackable ? `Up to ${formatCount(form.max)}` : 'This item does not stack'}>
                <TextInput id="shop-qty" type="number" mono min="1" max={form.max} disabled={!form.stackable} bind:value={ui.addToShop.quantity} />
            </Field>
            <Field label="Price per unit" id="shop-price" hint="In dollars. Enter 0 to give it away.">
                <TextInput id="shop-price" type="number" mono min="0" bind:value={ui.addToShop.price} />
            </Field>
            <div class="buttons">
                <Button type="submit" block loading={Boolean(form.busy)}>Add to shop</Button>
                <Button variant="secondary" block onclick={() => (ui.addToShop = null)}>Cancel</Button>
            </div>
        </form>
    {:else if instance && def}
        <div class="block">
            <h3 class="name">{label}</h3>
            <p class="meta">
                {#if shop}
                    <span class="au-mono">{price > 0 ? `${formatPrice(price)} each` : 'Free'}</span>
                {:else}
                    <span class="au-mono">{formatCount(count)}</span> in {fromSecondary ? (Number(inv.secondary.invType) === 10 ? 'the pile on the ground' : (PLACES[Number(inv.secondary.invType)] ?? 'this storage')) : 'your inventory'}
                {/if}
            </p>

            {#if count > 1 || shop}
                <Field label={shop ? 'Amount to buy' : 'Amount to move'} id="amount" hint={`1 to ${formatCount(max)}`} error={amountError}>
                    <TextInput id="amount" type="number" mono min="1" max={max} bind:value={ui.amount} />
                </Field>
            {/if}

            {#if shop}
                <p class="total">Total <span class="au-mono">{formatPrice(price * amount)}</span></p>
                <div class="buttons">
                    <Button block onclick={move} disabled={!canCross}>Buy {label}</Button>
                </div>
            {:else}
                <div class="buttons">
                    {#if !fromSecondary && !crafting && def.isUsable}
                        <Button block onclick={use}>Use {label}</Button>
                    {/if}
                    {#if canCross && !blockedTarget}
                        <Button block variant={fromSecondary ? 'primary' : 'secondary'} onclick={move}>{toShop ? 'List in the shop' : `Move to ${otherName}`}</Button>
                    {/if}
                </div>
            {/if}
            {#if inv.inUse && !fromSecondary}
                <p class="status" role="status">You are using an item. Wait for it to finish.</p>
            {/if}
        </div>
    {:else if !inv.player.loaded}
        <div class="block">
            <p class="meta" role="status">Your items are on their way from the server.</p>
        </div>
    {:else if emptyPlayer}
        <div class="block">
            <h3 class="name">Your inventory is empty</h3>
            <p class="meta">Items you buy or pick up appear on the left.</p>
        </div>
    {:else}
        <div class="block">
            <h3 class="name">No item selected</h3>
            {#if crafting}
                <p class="meta">Craft from the recipes on the right. Each one is checked against the items on the left.</p>
            {:else}
                <p class="meta">Select an item to use it or to move part of a stack. Drag items between slots to move them.</p>
            {/if}
        </div>
    {/if}

    {#if ui.message}
        <div class="msg">
            <PageAlert type={ui.message.tone} compact>{ui.message.text}</PageAlert>
        </div>
    {/if}

    <div class="foot">
        <Checkbox label="Play inventory sounds" checked={!app.settings.muted} onchange={(e) => saveSettings({ muted: !e.currentTarget.checked })} />
        <Button variant="secondary" block onclick={closeInventory}>Close inventory</Button>
    </div>
</div>

<style>
    .col {
        width: 280px;
        flex: none;
        display: flex;
        flex-direction: column;
        gap: var(--au-s6);
        padding-top: 56px;
    }
    .col :global(input),
    .col :global(button),
    .col :global(.au-alert) {
        text-shadow: none;
    }
    .block {
        display: flex;
        flex-direction: column;
    }
    .name {
        margin: 0 0 var(--au-s1);
        font-size: var(--au-fs-md);
        line-height: 1.25;
        overflow-wrap: anywhere;
    }
    .name--form {
        margin-bottom: var(--au-s4);
    }
    .meta {
        margin: 0 0 var(--au-s4);
        font-size: var(--au-fs-xs);
    }
    .total {
        margin: 0 0 var(--au-s4);
        font-size: var(--au-fs-sm);
        font-weight: 700;
        display: flex;
        justify-content: space-between;
    }
    .buttons {
        display: flex;
        flex-direction: column;
        gap: var(--au-s3);
    }
    .status {
        margin: var(--au-s3) 0 0;
        font-size: var(--au-fs-xs);
        font-weight: 700;
    }
    .msg :global(.au-alert) {
        margin: 0;
    }
    .foot {
        margin-top: auto;
        display: flex;
        flex-direction: column;
        gap: var(--au-s4);
    }
</style>
