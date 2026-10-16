<script>
    import { Button, Icon, Spinner } from '@sandbox/ui-kit';
    import Slot from './Slot.svelte';
    import WeightLine from './WeightLine.svelte';
    import { inv, capacityOf } from '../state/inventory.svelte.js';
    import { catalog } from '../state/catalog.svelte.js';
    import { inventoryWeight, formatWeight, WEIGHT_UNIT } from '../lib/item.js';
    import { submitAction } from '../lib/actions.js';

    /**
     * A title row on the world (name in bold, weight in mono, a thin weight
     * line) over a square dark grid of slots.
     */
    let { side, columns = 6, cell = 96, rows = 6 } = $props();

    const data = $derived(inv[side]);
    const isShop = $derived(side === 'secondary' && (data.shop || data.playerShop));
    const isGround = $derived(side === 'secondary' && Number(data.invType) === 10);
    const title = $derived(isGround ? 'Ground' : data.name || (side === 'player' ? 'Your inventory' : 'Storage'));
    const weight = $derived(inventoryWeight(data.inventory, catalog.items));
    const capacity = $derived(capacityOf(side));
    const size = $derived(Math.max(0, Number(data.size) || 0));
    const bySlot = $derived.by(() => {
        const map = new Map();
        for (const it of data.inventory) map.set(it.Slot, it);
        return map;
    });
    const slots = $derived(Array.from({ length: size }, (_, i) => i + 1));
    const gap = 4;
    const pad = 12;
    const SCROLLBAR = 10;
    const scrolls = $derived(Math.ceil(size / columns) > rows);
    const gridWidth = $derived(columns * cell + (columns - 1) * gap + pad * 2);
    const maxHeight = $derived(rows * cell + (rows - 1) * gap + pad * 2);

    const subline = $derived.by(() => {
        if (side !== 'secondary') return null;
        if (data.shop && data.free) return 'Everything here is free.';
        if (data.shop) return 'You pay with cash, or from your bank when your cash runs short.';
        if (data.playerShop && data.modifyShop) return 'Drag your items here to list them for sale.';
        if (data.playerShop) return 'Run by players. You pay with cash, or from your bank when your cash runs short.';
        if (isGround && data.loaded && data.inventory.length === 0) return 'Drag items here to leave them on the ground.';
        return null;
    });
</script>

<section class="panel-wrap" aria-label={title} style:width="{gridWidth + 4 + SCROLLBAR}px">
    <div class="head au-overworld">
        <h2 class="title au-truncate">{title}</h2>
        {#if !isShop}
            <span class="weight au-mono" class:is-full={capacity > 0 && weight >= capacity}>
                {#if capacity > 0 && weight >= capacity}<span class="full">Full</span>{/if}
                {formatWeight(weight)} / {formatWeight(capacity)} {WEIGHT_UNIT}
            </span>
        {/if}
    </div>
    {#if !isShop}
        <WeightLine value={weight} max={capacity} label="Weight in {title}" />
    {/if}
    {#if subline}<p class="sub au-overworld">{subline}</p>{/if}

    <div class="panel">
        {#if !data.loaded}
            <div class="state" style:height="{Math.min(maxHeight, 320)}px">
                <Spinner size={28} label="Loading" />
                <span>{side === 'player' ? 'Loading your items' : `Loading ${title.toLowerCase()}`}</span>
            </div>
        {:else if size === 0}
            <div class="state" style:height="200px">
                <span>{side === 'player' ? 'Your inventory has no slots.' : 'This storage has no slots.'}</span>
            </div>
        {:else if isShop && data.inventory.length === 0 && !data.modifyShop}
            <div class="state" style:height="200px">
                <span>There is nothing here you can buy. Some shops only sell to certain jobs.</span>
            </div>
        {:else}
            <div class="grid" style:grid-template-columns="repeat({columns}, {cell}px)" style:gap="{gap}px" style:padding="{pad}px" style:max-height="{maxHeight}px" style:width="{gridWidth + SCROLLBAR}px" style:padding-right="{pad + (scrolls ? 0 : SCROLLBAR)}px">
                {#each slots as n (n)}
                    <Slot {side} slot={n} instance={bySlot.get(n) ?? null} size={cell} hotkey={side === 'player' && n <= 5} />
                {/each}
            </div>
        {/if}
    </div>

    {#if side === 'secondary' && data.action && data.loaded}
        <div class="action">
            <Button variant="secondary" onclick={submitAction}>
                {#if data.action.icon}<Icon icon={data.action.icon} stroke={2} />{/if}
                {data.action.text || 'Continue'}
            </Button>
        </div>
    {/if}
</section>

<style>
    .panel-wrap {
        display: flex;
        flex-direction: column;
        min-width: 0;
    }
    .head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: var(--au-s4);
        margin-bottom: var(--au-s2);
    }
    .title {
        margin: 0;
        font-size: var(--au-fs-md);
        line-height: 1.3;
        min-width: 0;
    }
    .weight {
        flex: none;
        font-size: var(--au-fs-xs);
    }
    .full {
        font-family: var(--au-font);
        font-weight: 700;
        margin-right: var(--au-s2);
    }
    .sub {
        margin: var(--au-s2) 0 0;
        font-size: var(--au-fs-xs);
        max-width: none;
    }
    .panel {
        margin-top: var(--au-s3);
        background: var(--au-bg);
        border: 2px solid var(--au-ink);
    }
    .grid {
        display: grid;
        align-content: start;
        overflow-y: auto;
        overflow-x: hidden;
    }
    .state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--au-s3);
        padding: var(--au-s6);
        font-size: var(--au-fs-xs);
        color: var(--au-muted);
        text-align: center;
    }
    .action {
        margin-top: var(--au-s4);
    }
</style>
