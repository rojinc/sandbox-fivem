<script>
    import { Button, Spinner } from '@sandbox/ui-kit';
    import InventoryPanel from './InventoryPanel.svelte';
    import ActionColumn from './ActionColumn.svelte';
    import CraftingPanel from './CraftingPanel.svelte';
    import ItemTooltip from './ItemTooltip.svelte';
    import DragGhost from './DragGhost.svelte';
    import { app } from '../state/app.svelte.js';
    import { catalog } from '../state/catalog.svelte.js';
    import { inv } from '../state/inventory.svelte.js';
    import { closeInventory } from '../lib/actions.js';
    import { windowPointerMove, windowPointerUp, windowPointerDown, backgroundPointerDown } from '../lib/pointer.js';

    /** The open inventory: player grid, the actions between, then the secondary grid or the crafting bench. */
    $effect(() => {
        window.addEventListener('pointermove', windowPointerMove);
        window.addEventListener('pointerup', windowPointerUp);
        window.addEventListener('pointerdown', windowPointerDown);
        return () => {
            window.removeEventListener('pointerdown', windowPointerDown);
            window.removeEventListener('pointermove', windowPointerMove);
            window.removeEventListener('pointerup', windowPointerUp);
        };
    });
</script>

<div class="screen" role="presentation" onpointerdown={backgroundPointerDown} oncontextmenu={(e) => e.preventDefault()}>
    {#if !catalog.loaded}
        <div class="loading" role="status">
            <Spinner size={28} label="Loading" />
            <p><strong>Loading the item list</strong></p>
            <p class="au-muted">This takes a few seconds after you join or after staff reload items.</p>
            <Button variant="secondary" onclick={closeInventory}>Close inventory</Button>
        </div>
    {:else}
        <div class="columns" role="presentation" onpointerdown={backgroundPointerDown}>
            <InventoryPanel side="player" />
            <ActionColumn />
            {#if app.mode === 'crafting'}
                <CraftingPanel />
            {:else if inv.showSecondary}
                <InventoryPanel side="secondary" />
            {/if}
        </div>
        <ItemTooltip />
        <DragGhost />
    {/if}
</div>

<style>
    .screen {
        position: absolute;
        inset: 0;
        background: var(--inv-scrim);
        pointer-events: auto;
    }
    .columns {
        position: absolute;
        inset: 0;
        display: flex;
        justify-content: center;
        align-items: stretch;
        align-content: center;
        gap: 40px;
        padding: 0 48px;
        height: fit-content;
        margin: auto;
    }
    .loading {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 420px;
        padding: var(--au-s6);
        background: var(--au-bg);
        border: 2px solid var(--au-ink);
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: var(--au-s2);
        font-size: var(--au-fs-xs);
    }
    .loading p {
        margin: 0;
    }
    .loading :global(.au-btn) {
        margin-top: var(--au-s3);
    }
</style>
