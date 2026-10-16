<script>
    import Slot from './Slot.svelte';
    import { app } from '../state/app.svelte.js';
    import { catalog } from '../state/catalog.svelte.js';
    import { itemDef, itemLabel } from '../lib/item.js';

    /** Slots 1 to 5 at the bottom centre, no panel behind them; the equipped weapon is marked. */
    const SLOTS = [1, 2, 3, 4, 5];
    const items = $derived(app.hotbar.items);
    const bySlot = $derived(new Map(items.map((s) => [Number(s.Slot), s])));
    const equipped = $derived(app.equipped);
    const eqSlot = $derived(Number(equipped?.Slot) || 0);
    const eqLabel = $derived(equipped ? itemLabel(equipped, itemDef(catalog.items, equipped.Name)) : null);
    const show = $derived(app.hotbar.showing && catalog.loaded && app.mode !== 'crafting' && !app.visible);
</script>

{#if show}
    <div class="hotbar" aria-label="Hotbar">
        {#if eqLabel}<p class="equipped au-overworld">{eqLabel} equipped</p>{/if}
        <div class="row">
            {#each SLOTS as n (n)}
                <Slot side="hotbar" slot={n} instance={bySlot.get(n) ?? null} size={80} hotkey interactive={false} equipped={eqSlot === n} />
            {/each}
            {#if equipped && eqSlot > 5}
                <span class="sep" aria-hidden="true"></span>
                <Slot side="hotbar" slot={eqSlot} instance={equipped} size={80} interactive={false} equipped />
            {/if}
        </div>
    </div>
{/if}

<style>
    .hotbar {
        position: absolute;
        left: 50%;
        bottom: 32px;
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        pointer-events: none;
    }
    .equipped {
        margin: 0 0 var(--au-s2);
        font-size: var(--au-fs-xs);
        font-weight: 700;
    }
    .row {
        display: flex;
        gap: var(--au-s1);
    }
    .sep {
        width: var(--au-s4);
    }
</style>
