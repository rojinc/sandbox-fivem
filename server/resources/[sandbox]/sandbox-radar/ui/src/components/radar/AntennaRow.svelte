<script>
    import { Tag } from '@sandbox/ui-kit';
    import { hasSpeed } from '../../state/radar.svelte.js';
    import SpeedReadout from './SpeedReadout.svelte';
    import PlateLine from './PlateLine.svelte';
    import DirectionArrows from './DirectionArrows.svelte';

    /**
     * One antenna (front or rear): beam state, the live target readout with its
     * direction lamps and plate, and the sticky fast / locked readout with its plate.
     */
    let { name, settings = {}, target = {}, fast = {}, fastSpeed = 0 } = $props();

    const xmit = $derived(Boolean(settings?.transmit));
    const sameLane = $derived(settings?.lane !== false);
    const armed = $derived(Number(fastSpeed) > 20);

    // An antenna that is not transmitting shows nothing, whatever Lua last sent for it.
    const live = $derived(xmit ? (target ?? {}) : {});
    const held = $derived(xmit ? (fast ?? {}) : {});

    const liveHas = $derived(hasSpeed(live));
    const over = $derived(liveHas && armed && live.speed >= Number(fastSpeed));
    const heldHas = $derived(hasSpeed(held));
    const locked = $derived(Boolean(held.locked));
</script>

<div class="row" class:row--off={!xmit}>
    <div class="row__antenna">
        <span class="row__name">{name}</span>
        <Tag tone={xmit ? 'success' : 'default'} solid={xmit}>{xmit ? 'On' : 'Off'}</Tag>
        <span class="row__lane au-muted">{sameLane ? 'Same lane' : 'Opposite lane'}</span>
    </div>

    <div class="row__cell">
        <div class="row__labels">
            <span class="radar-label">Target</span>
            {#if over}<Tag tone="warning" solid>Over {fastSpeed}</Tag>{/if}
        </div>
        <div class="row__readout">
            <SpeedReadout value={liveHas ? live.speed : null} />
            <DirectionArrows direction={xmit ? live.direction : false} />
        </div>
        <PlateLine plate={xmit ? live.plate : null} vehicleClass={live.class} flag={live.flag} />
    </div>

    <div class="row__cell">
        <div class="row__labels">
            <span class="radar-label">Fast</span>
            {#if locked}
                <Tag tone="error" solid>Locked</Tag>
            {:else if heldHas}
                <Tag tone="warning" solid>Held</Tag>
            {/if}
        </div>
        <div class="row__readout">
            <SpeedReadout value={heldHas ? held.speed : null} />
        </div>
        <PlateLine plate={heldHas ? held.plate : null} vehicleClass={held.class} flag={held.flag} />
    </div>
</div>

<style>
    .row {
        display: grid;
        grid-template-columns: 104px minmax(0, 1fr) minmax(0, 1fr);
        align-items: stretch;
        transition: opacity var(--au-normal) var(--au-ease);
    }
    .row--off {
        opacity: 0.55;
    }
    .row__antenna {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 6px;
        padding: 12px;
        border-right: 1px solid var(--au-bg-alt-shade);
    }
    .row__name {
        font-variant-caps: all-small-caps;
        font-size: 20px;
        font-weight: 700;
        line-height: 1;
        letter-spacing: 0.06em;
    }
    .row__lane {
        font-size: 12px;
        line-height: 1.25;
    }
    .row__cell {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
        padding: 10px 12px;
    }
    .row__cell + .row__cell {
        border-left: 1px solid var(--au-bg-alt-shade);
    }
    .row__labels {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        min-height: 24px;
    }
    .row__readout {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 44px;
    }
</style>
