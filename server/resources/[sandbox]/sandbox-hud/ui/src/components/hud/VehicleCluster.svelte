<script>
    import { hud } from '../../state/hud.svelte.js';
    import { vehicle } from '../../state/vehicle.svelte.js';
    import { gearLabel } from '../../lib/status.js';
    import Speedometer from './Speedometer.svelte';
    import Indicator from './Indicator.svelte';

    /** Bottom-right speedometer and indicator row, shown while in a vehicle. */
    const kph = $derived(hud.config.speedUnit === 'kph');
    const speed = $derived(kph ? vehicle.speed * 1.609344 : vehicle.speed);
    const skew = $derived(hud.config.skewed ? `perspective(1000px) rotateY(-${Number(hud.config.skewAmount) || 15}deg)` : 'none');
    const gear = $derived(gearLabel(vehicle.gear, vehicle.speed, vehicle.ignition));
</script>

{#if vehicle.showing}
    <div class="veh" style="transform:{skew}">
        <Speedometer
            {speed}
            rpm={vehicle.rpm}
            gears={vehicle.gears}
            {gear}
            unit={kph ? 'KM/H' : 'MPH'}
            ignition={vehicle.ignition}
            showRPM={hud.config.showRPM}
            showGears={hud.config.showGears}
        />
        <div class="veh__row">
            {#if !vehicle.fuelHide}<Indicator icon="gas-pump" value={vehicle.fuel} label="Fuel" />{/if}
            {#if vehicle.nos > 0}<Indicator icon="fire-flame-curved" value={vehicle.nos} color="var(--hud-blue)" label="Nitrous" />{/if}
            <Indicator icon="car-burst" state={!vehicle.checkEngine} alert={vehicle.checkEngine} label="Engine" />
            <Indicator icon="lightbulb" value={vehicle.headlights >= 2 ? 100 : vehicle.headlights >= 1 ? 50 : 0} color="var(--hud-white)" label="Headlights" />
            {#if !vehicle.seatbeltHide}
                <Indicator state={vehicle.seatbelt} alert={!vehicle.seatbelt && vehicle.ignition} label="Seatbelt">
                    {#snippet custom()}
                        <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
                            <path d="M6 3h4l1 4-6 6H3zM8 21l9-15h4L12 21z" fill="currentColor" />
                            <rect x="12" y="13" width="8" height="5" rx="1" fill="currentColor" />
                        </svg>
                    {/snippet}
                </Indicator>
            {/if}
            {#if vehicle.cruise}<Indicator icon="gauge-high" state={true} color="var(--hud-cyan)" label="Cruise control" />{/if}
        </div>
    </div>
{/if}

<style>
    .veh {
        position: absolute;
        right: 3.2vw;
        bottom: 3.5vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25em;
        transform-origin: right center;
        backface-visibility: hidden;
        animation: au-fade-in 200ms var(--au-ease);
    }
    .veh__row {
        display: flex;
        align-items: flex-start;
        gap: 0.4em;
        margin-top: -1.6em;
    }
</style>
