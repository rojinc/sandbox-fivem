<script>
    import { imageSources, itemLabel } from '../lib/item.js';

    /**
     * The item picture, trying each source in turn (custom image, icon, then
     * the placeholder). When none loads, the item name stands in for it.
     */
    let { instance, def, size = 56, fallback = true, textWidth = size + 28 } = $props();

    const sources = $derived(imageSources(instance, def));
    let failed = $state(0);
    let lastKey = '';

    $effect.pre(() => {
        const key = sources.join('|');
        if (key !== lastKey) {
            lastKey = key;
            failed = 0;
        }
    });

    const src = $derived(sources[failed] ?? null);
</script>

{#if src}
    <img class="img" {src} alt="" draggable="false" style:width="{size}px" style:height="{size}px" onerror={() => (failed += 1)} />
{:else if fallback}
    <span class="name" lang="en" style:max-width="{textWidth}px">{itemLabel(instance, def)}</span>
{/if}

<style>
    .img {
        display: block;
        object-fit: contain;
        pointer-events: none;
        user-select: none;
    }
    .name {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        font-size: var(--au-fs-xs);
        line-height: 1.2;
        text-align: center;
        color: var(--au-muted);
        hyphens: auto;
        overflow-wrap: break-word;
        pointer-events: none;
    }
</style>
