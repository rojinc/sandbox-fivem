<script>
    import { fade } from 'svelte/transition';
    import { ui } from '../../state/ui.svelte.js';
    import texture from '../../assets/blindfold.webp';

    /** Near-black cloth texture covering the screen while blindfolded (client/blindfold.lua). */
</script>

{#if ui.blindfolded}
    <div class="blindfold" style="background-image:url({texture})" transition:fade={{ duration: 400 }}></div>
{/if}

<style>
    .blindfold {
        position: absolute;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.92);
        background-size: cover;
        background-position: 50% 0;
        background-repeat: no-repeat;
    }
</style>
