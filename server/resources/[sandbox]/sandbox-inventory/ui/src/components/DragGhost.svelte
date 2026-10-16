<script>
    import ItemImage from './ItemImage.svelte';
    import { catalog } from '../state/catalog.svelte.js';
    import { slotItem } from '../state/inventory.svelte.js';
    import { ui, pointer } from '../state/ui.svelte.js';
    import { itemDef, formatCount } from '../lib/item.js';

    /** The held item, following the pointer. */
    const held = $derived(ui.held);
    const instance = $derived(held ? slotItem(held.side, held.slot) : null);
    const def = $derived(instance ? itemDef(catalog.items, instance.Name) : null);
</script>

{#if held && instance && def}
    <div class="ghost" style:left="{pointer.x}px" style:top="{pointer.y}px" aria-hidden="true">
        <ItemImage {instance} {def} size={58} />
        {#if held.count > 1}<span class="count au-mono">{formatCount(held.count)}</span>{/if}
    </div>
{/if}

<style>
    .ghost {
        position: absolute;
        z-index: 100;
        width: 96px;
        height: 96px;
        display: grid;
        place-items: center;
        transform: translate(-50%, -50%);
        background: var(--au-bg-alt);
        border: 2px solid var(--au-ink);
        opacity: 0.92;
        pointer-events: none;
    }
    .count {
        position: absolute;
        right: 6px;
        bottom: 4px;
        font-size: var(--au-fs-xs);
        line-height: 1.2;
    }
</style>
