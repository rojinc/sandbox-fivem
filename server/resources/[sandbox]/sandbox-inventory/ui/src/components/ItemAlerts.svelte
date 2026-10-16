<script>
    import ItemImage from './ItemImage.svelte';
    import { app } from '../state/app.svelte.js';
    import { catalog } from '../state/catalog.svelte.js';
    import { itemDef, formatCount } from '../lib/item.js';

    /** ADD_ALERT: what just changed in your inventory, on a background tinted by the kind of change. */
    const VERBS = { add: 'Added', removed: 'Removed', used: 'Used', Equipped: 'Equipped', Holstered: 'Holstered' };
    const TONES = { add: 'success', removed: 'error', used: 'info' };

    const list = $derived(catalog.loaded ? app.alerts : []);
</script>

{#if list.length}
    <ol class="alerts" aria-live="polite">
        {#each list as a (a.key)}
            {@const def = itemDef(catalog.items, a.item)}
            <li class="alert alert--{TONES[a.type] ?? 'neutral'}">
                <span class="pic"><ItemImage instance={{ Name: a.item }} {def} size={40} fallback={false} /></span>
                <span class="text">
                    <strong class="au-truncate">{def?.label ?? a.item}</strong>
                    <span>{VERBS[a.type] ?? a.type}{#if Number(a.count) > 0}&nbsp;<span class="au-mono">{formatCount(a.count)}</span>{/if}</span>
                </span>
            </li>
        {/each}
    </ol>
{/if}

<style>
    .alerts {
        position: absolute;
        right: 20%;
        bottom: 32px;
        display: flex;
        flex-direction: column;
        gap: var(--au-s1);
        width: 300px;
        margin: 0;
        padding: 0;
        list-style: none;
        pointer-events: none;
    }
    .alert {
        display: flex;
        align-items: center;
        gap: var(--au-s3);
        padding: var(--au-s2) var(--au-s3);
        background: var(--au-bg-alt);
        color: var(--au-text);
        font-size: var(--au-fs-xs);
        line-height: 1.3;
    }
    .alert--success {
        background: var(--au-success-bg);
    }
    .alert--error {
        background: var(--au-error-bg);
    }
    .alert--info {
        background: var(--au-info-bg);
    }
    .pic {
        flex: none;
        display: grid;
        place-items: center;
        width: 44px;
        height: 44px;
    }
    .text {
        display: flex;
        flex-direction: column;
        min-width: 0;
    }
</style>
