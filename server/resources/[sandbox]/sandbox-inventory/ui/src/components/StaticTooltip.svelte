<script>
    import TooltipBody from './TooltipBody.svelte';
    import { catalog } from '../state/catalog.svelte.js';
    import { app } from '../state/app.svelte.js';

    /** OPEN_STATIC_TOOLTIP: the same tooltip, held on the right edge while the inventory is closed. */
    const instance = $derived(app.staticTooltip);
    const def = $derived(instance ? catalog.items[instance.Name] : null);
</script>

{#if catalog.loaded && instance && def}
    <aside class="static" aria-label="Item details">
        <TooltipBody {instance} {def} context="static" />
    </aside>
{/if}

<style>
    .static {
        position: absolute;
        top: 50%;
        right: 2%;
        width: 360px;
        transform: translateY(-50%);
        padding: var(--au-s4);
        background: var(--au-bg);
        border: 2px solid var(--au-ink);
        color: var(--au-text);
        pointer-events: none;
    }
</style>
