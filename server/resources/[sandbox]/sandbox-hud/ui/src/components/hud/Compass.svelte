<script>
    import { hud } from '../../state/hud.svelte.js';
    import { location } from '../../state/location.svelte.js';
    import { vehicle } from '../../state/vehicle.svelte.js';
    import { ui } from '../../state/ui.svelte.js';
    import CompassBox from './CompassBox.svelte';

    /** Heading, street and area as three pill boxes at the top (or bottom) centre. */
    const shown = $derived(
        location.showing &&
            !ui.blindfolded &&
            hud.config.compassLocation !== 'hidden' &&
            (hud.config.compassAlways || vehicle.showing),
    );
    const street = $derived(
        location.cross && !hud.config.hideCrossStreet ? `${location.main} · ${location.cross}` : location.main || '—',
    );
</script>

{#if shown}
    <div class="compass" class:is-bottom={hud.config.compassLocation === 'bottom'}>
        <CompassBox icon="compass" label={location.direction || '-'} bare={hud.config.hideCompassBg} minWidth="4.4em" />
        <CompassBox icon="map-pin" label={street} bare={hud.config.hideCompassBg} minWidth="12em" grow />
        <CompassBox icon="map" label={location.area || '—'} bare={hud.config.hideCompassBg} minWidth="7em" />
    </div>
{/if}

<style>
    .compass {
        position: absolute;
        left: 0;
        right: 0;
        top: 2.2vh;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.75em;
        animation: au-fade-in 200ms var(--au-ease);
    }
    .compass.is-bottom {
        top: auto;
        bottom: 1.4vh;
    }
</style>
