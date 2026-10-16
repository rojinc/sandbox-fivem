<script>
    import { fly } from 'svelte/transition';
    import { ui } from '../../state/ui.svelte.js';
    import huntingDark from '../../assets/hunting-map-dark.webp';
    import huntingLight from '../../assets/hunting-map-light.webp';

    /** Left-side image panel for held items such as maps (Hud.Overlay:Show). */
    function imageFor(item) {
        if (!item?.Name) return null;
        if (item.Name === 'hunting_map_dark') return huntingDark;
        if (item.Name === 'hunting_map_light') return huntingLight;
        if (item.Name.includes('vanityitem')) return item.MetaData?.CustomItemImage ?? null;
        return null;
    }
    const src = $derived(imageFor(ui.overlay.items[0]));
</script>

{#if ui.overlay.showing && src}
    <div class="panel" transition:fly={{ x: -40, duration: 220 }}>
        <img {src} alt={ui.overlay.items[0]?.Name ?? 'Item'} />
    </div>
{/if}

<style>
    .panel {
        position: absolute;
        top: 25vh;
        left: 2vw;
        width: 25vw;
        height: 50vh;
        padding: 10px;
        border-radius: var(--au-radius);
        background: var(--au-light-bg);
        box-shadow: var(--au-shadow-2);
    }
    img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
</style>
