<script>
    import { app, STATE_CHARACTERS, STATE_SPAWN } from './state/app.svelte.js';
    import Splash from './components/Splash.svelte';
    import LoadingOverlay from './components/LoadingOverlay.svelte';
    import CharactersScreen from './components/characters/CharactersScreen.svelte';
    import SpawnScreen from './components/spawn/SpawnScreen.svelte';

    /*
     * Laid out in px for 1920x1080. Larger (or smaller) screens get the same
     * page zoomed, so 1440p and 4K keep the proportions instead of looking tiny.
     */
    const DESIGN_W = 1920;
    const DESIGN_H = 1080;
    let scale = $state(1);
    let width = $state(DESIGN_W);
    let height = $state(DESIGN_H);

    function fit() {
        const s = Math.min(window.innerWidth / DESIGN_W, window.innerHeight / DESIGN_H) || 1;
        scale = Math.round(s * 1000) / 1000;
        width = Math.round(window.innerWidth / scale);
        height = Math.round(window.innerHeight / scale);
    }

    $effect(() => {
        fit();
        window.addEventListener('resize', fit);
        return () => window.removeEventListener('resize', fit);
    });
</script>

{#if !app.hidden}
    <div class="cs-root" style:zoom={scale} style:width="{width}px" style:height="{height}px">
        {#if app.state === STATE_CHARACTERS}
            <CharactersScreen />
        {:else if app.state === STATE_SPAWN}
            <SpawnScreen />
        {:else}
            <Splash />
        {/if}
        <LoadingOverlay />
    </div>
{/if}
