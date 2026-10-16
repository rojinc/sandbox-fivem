<script>
    import { meter } from './state/meter.svelte.js';
    import TaxiMeter from './components/meter/TaxiMeter.svelte';

    // Chrome is sized in px for 1920x1080; the root zooms so 1440p and 4K keep the same proportions.
    let zoom = $state(1);
    $effect(() => {
        const update = () => (zoom = Math.max(1, Math.min(window.innerWidth / 1920, window.innerHeight / 1080)));
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    });
</script>

<!-- Lua never grants this page focus: the whole layer is a passive overlay. -->
<div class="taxi-root" style="zoom:{zoom}">
    {#if meter.visible}
        <div class="taxi-root__anchor">
            <TaxiMeter />
        </div>
    {/if}
</div>

<style>
    .taxi-root {
        position: absolute;
        inset: 0;
        overflow: hidden;
        pointer-events: none;
    }
    /* Right edge, above the hud's speedometer cluster (which shows whenever the meter does). */
    .taxi-root__anchor {
        position: absolute;
        right: 60px;
        bottom: 280px;
    }
</style>
