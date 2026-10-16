<script>
    import { app, STATE_CHARACTERS, STATE_SPAWN } from './state/app.svelte.js';
    import Splash from './components/Splash.svelte';
    import LoadingOverlay from './components/LoadingOverlay.svelte';
    import CharactersScreen from './components/characters/CharactersScreen.svelte';
    import SpawnScreen from './components/spawn/SpawnScreen.svelte';

    /* Everything is laid out for 1920x1080; larger (or smaller) screens get the same page scaled. */
    const DESIGN_W = 1920;
    const DESIGN_H = 1080;
    let scale = $state(1);
    let width = $state(DESIGN_W);
    let height = $state(DESIGN_H);

    function fit() {
        const s = Math.min(window.innerWidth / DESIGN_W, window.innerHeight / DESIGN_H) || 1;
        scale = s;
        width = Math.round(window.innerWidth / s);
        height = Math.round(window.innerHeight / s);
    }

    $effect(() => {
        fit();
        window.addEventListener('resize', fit);
        return () => window.removeEventListener('resize', fit);
    });
</script>

{#if !app.hidden}
    <div class="cs-root" style="zoom:{scale};width:{width}px;height:{height}px">
        {#if app.state === STATE_CHARACTERS}
            <CharactersScreen />
        {:else if app.state === STATE_SPAWN}
            <SpawnScreen />
        {:else if !app.loading}
            <Splash />
        {/if}
        <LoadingOverlay />
    </div>
{/if}
