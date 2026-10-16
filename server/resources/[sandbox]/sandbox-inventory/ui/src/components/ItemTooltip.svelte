<script>
    import TooltipBody from './TooltipBody.svelte';
    import { catalog } from '../state/catalog.svelte.js';
    import { slotItem } from '../state/inventory.svelte.js';
    import { ui } from '../state/ui.svelte.js';
    import { view } from '../state/app.svelte.js';
    import { itemDef } from '../lib/item.js';

    /** The tooltip of the hovered slot: right of a player slot, left of a secondary one, kept on screen. */
    const WIDTH = 360;
    const GAP = 8;
    const MARGIN = 16;

    const hover = $derived(ui.held ? null : ui.hover);
    const instance = $derived(hover ? slotItem(hover.side, hover.slot) : null);
    const def = $derived(instance ? itemDef(catalog.items, instance.Name) : null);

    let height = $state(0);

    const pos = $derived.by(() => {
        if (!hover) return null;
        let left = hover.side === 'player' ? hover.x + hover.w + GAP : hover.x - WIDTH - GAP;
        if (left + WIDTH > view.width - MARGIN) left = hover.x - WIDTH - GAP;
        if (left < MARGIN) left = hover.x + hover.w + GAP;
        let top = hover.y;
        if (top + height > view.height - MARGIN) top = Math.max(MARGIN, view.height - MARGIN - height);
        return { left, top };
    });
</script>

{#if instance && def && pos}
    <div class="tooltip" role="tooltip" style:left="{pos.left}px" style:top="{pos.top}px" style:width="{WIDTH}px" bind:offsetHeight={height}>
        <TooltipBody {instance} {def} context={hover.side} />
    </div>
{/if}

<style>
    .tooltip {
        position: absolute;
        z-index: 50;
        padding: var(--au-s4);
        background: var(--au-bg);
        border: 2px solid var(--au-ink);
        color: var(--au-text);
        pointer-events: none;
    }
</style>
