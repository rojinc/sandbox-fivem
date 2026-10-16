<script>
    import { Spinner } from '@sandbox/ui-kit';
    import ItemImage from './ItemImage.svelte';
    import { catalog } from '../state/catalog.svelte.js';
    import { inv } from '../state/inventory.svelte.js';
    import { ui } from '../state/ui.svelte.js';
    import { view } from '../state/app.svelte.js';
    import { itemDef, itemLabel, durabilityOf, formatCount, formatPrice, unitPrice } from '../lib/item.js';
    import { shopBlock, isOpenContainer } from '../lib/actions.js';
    import { slotPointerDown, slotPointerUp, slotClick, slotContextMenu } from '../lib/pointer.js';

    /**
     * One square cell. `side` is player | secondary for the grids, hotbar for
     * the hotbar (read-only). Image centred, count bottom right, price under the
     * item in shops, durability as a thin line along the bottom, hotbar number
     * in the corner.
     */
    let { side, slot, instance = null, size = 96, hotkey = false, equipped = false, interactive = true } = $props();

    const def = $derived(instance ? itemDef(catalog.items, instance.Name) : null);
    const lockSide = $derived(side === 'hotbar' ? 'player' : side);
    const locked = $derived(Boolean(inv.locks[lockSide]?.[slot]));
    const durability = $derived(instance && def ? durabilityOf(instance, def) : null);
    const broken = $derived(durability !== null && durability <= 0);
    const inShop = $derived(side === 'secondary' && (inv.secondary.shop || inv.secondary.playerShop));
    const price = $derived(inShop && instance && def && !def.invalid ? unitPrice(instance, def, inv.secondary) : null);
    const blocked = $derived(interactive && instance ? Boolean(shopBlock(side, instance)) || isOpenContainer(instance) : false);
    const selected = $derived(interactive && ui.selection?.side === side && ui.selection?.slot === slot);
    const origin = $derived(interactive && ui.held?.side === side && ui.held?.slot === slot);
    const hovered = $derived(interactive && ui.hover?.side === side && ui.hover?.slot === slot);
    const count = $derived(Number(instance?.Count) || 0);
    const showCount = $derived(Boolean(instance) && !(side === 'secondary' && inv.secondary.shop) && (count > 1 || (inv.secondary.playerShop && side === 'secondary' && count > 0)));

    const label = $derived.by(() => {
        if (!instance) return hotkey ? `Slot ${slot}, empty` : `Empty slot ${slot}`;
        const parts = [itemLabel(instance, def)];
        if (count > 1) parts.push(`${formatCount(count)} in the stack`);
        if (price !== null) parts.push(price > 0 ? `${formatPrice(price)} each` : 'free');
        if (broken) parts.push('broken');
        else if (durability !== null) parts.push(`${durability}% durability`);
        if (equipped) parts.push('equipped');
        return parts.join(', ');
    });

    function enter(e) {
        if (!interactive || !instance) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const s = view.scale || 1;
        ui.hover = { side, slot, x: rect.left / s, y: rect.top / s, w: rect.width / s, h: rect.height / s };
    }

    function leave() {
        if (ui.hover?.side === side && ui.hover?.slot === slot) ui.hover = null;
    }
</script>

{#if interactive}
    <button
        type="button"
        class="slot"
        class:is-filled={Boolean(instance)}
        class:is-selected={selected}
        class:is-hovered={hovered && !ui.held}
        class:is-target={hovered && Boolean(ui.held) && !origin}
        class:is-origin={origin}
        class:is-broken={broken}
        class:is-blocked={blocked}
        class:is-locked={locked}
        style:--cell="{size}px"
        aria-label={label}
        aria-pressed={selected}
        data-side={side}
        data-slot={slot}
        onpointerdown={(e) => slotPointerDown(e, side, slot)}
        onpointerup={(e) => slotPointerUp(e, side, slot)}
        onclick={(e) => slotClick(e, side, slot)}
        oncontextmenu={(e) => slotContextMenu(e, side, slot)}
        onpointerenter={enter}
        onpointerleave={leave}
        onfocus={enter}
        onblur={leave}
    >
        {@render body()}
    </button>
{:else}
    <div class="slot" class:is-filled={Boolean(instance)} class:is-selected={equipped} class:is-broken={broken} class:is-locked={locked} style:--cell="{size}px" role="img" aria-label={label}>
        {@render body()}
    </div>
{/if}

{#snippet body()}
    {#if hotkey}<span class="key au-mono" aria-hidden="true">{slot}</span>{/if}
    {#if instance && def}
        <span class="pic" class:pic--shop={price !== null}><ItemImage {instance} {def} size={Math.round(size * 0.6)} textWidth={size - 8} /></span>
        {#if price !== null}
            <span class="price au-mono" aria-hidden="true">{price > 0 ? formatPrice(price) : 'Free'}</span>
        {/if}
        {#if showCount}
            <span class="count au-mono" class:count--top={price !== null} aria-hidden="true">{formatCount(count)}</span>
        {/if}
        {#if broken}
            <span class="broken" aria-hidden="true">Broken</span>
        {:else if durability !== null}
            <span class="wear" aria-hidden="true"><span class="wear__fill" style:width="{Math.max(2, Math.min(100, durability))}%"></span></span>
        {/if}
        {#if locked}
            <span class="busy"><Spinner size={20} label="Updating" /></span>
        {/if}
    {/if}
{/snippet}

<style>
    .slot {
        position: relative;
        display: grid;
        place-items: center;
        width: var(--cell);
        height: var(--cell);
        padding: 0;
        margin: 0;
        border: 1px solid var(--au-border);
        border-radius: 0;
        background: var(--au-bg-shade);
        color: var(--au-text);
        font: inherit;
        cursor: default;
        overflow: hidden;
        transition: background-color var(--au-fast) var(--au-ease);
    }
    button.slot.is-filled {
        cursor: grab;
    }
    /* 2px ink edge for the hovered, targeted and selected cell, drawn inside so the grid does not move. */
    .slot.is-hovered,
    .slot.is-target,
    .slot.is-selected {
        border-color: var(--au-ink);
        outline: 2px solid var(--au-ink);
        outline-offset: -2px;
    }
    .slot.is-hovered,
    .slot.is-target {
        background: var(--au-bg-alt);
    }
    .slot.is-selected {
        background: var(--au-bg-alt-shade);
    }
    .slot.is-origin {
        opacity: 0.4;
    }
    .slot.is-broken {
        background: var(--au-error-bg);
    }
    .slot.is-blocked .pic {
        opacity: 0.45;
    }
    .slot.is-locked .pic {
        opacity: 0.35;
    }
    .slot:focus-visible {
        outline: 3px solid var(--au-focus);
        outline-offset: 0;
        z-index: 1;
    }
    .pic {
        display: grid;
        place-items: center;
        pointer-events: none;
    }
    .pic--shop {
        margin-top: -14px;
    }
    .key {
        position: absolute;
        top: 2px;
        left: 6px;
        font-size: var(--au-fs-xs);
        line-height: 1.2;
        color: var(--au-muted);
        pointer-events: none;
    }
    .count {
        position: absolute;
        right: 6px;
        bottom: 4px;
        font-size: var(--au-fs-xs);
        line-height: 1.2;
        color: var(--au-text);
        pointer-events: none;
    }
    .count--top {
        top: 2px;
        bottom: auto;
    }
    .price {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 6px;
        font-size: var(--au-fs-xs);
        line-height: 1.2;
        text-align: center;
        color: var(--au-text);
        pointer-events: none;
    }
    .broken {
        position: absolute;
        left: 6px;
        bottom: 4px;
        font-size: var(--au-fs-xs);
        font-weight: 700;
        line-height: 1.2;
        color: var(--au-error);
        pointer-events: none;
    }
    .wear {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 3px;
        background: var(--au-border);
        pointer-events: none;
    }
    .wear__fill {
        display: block;
        height: 100%;
        background: var(--au-ink);
    }
    .busy {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        pointer-events: none;
    }
</style>
