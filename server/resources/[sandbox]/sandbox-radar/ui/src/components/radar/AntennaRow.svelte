<script>
    import { hasSpeed } from '../../state/radar.svelte.js';
    import LedDigits from './LedDigits.svelte';
    import PlateLine from './PlateLine.svelte';
    import DirectionArrows from './DirectionArrows.svelte';
    import Lamp from './Lamp.svelte';

    /**
     * One antenna (front or rear) on the faceplate: its XMIT and lane lamps, the
     * live target window (red) with direction lamps and plate, and the sticky
     * fast window (amber) with HELD / LOCK lamps and plate.
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

<div class="row" role="group" aria-label="{name} antenna">
    <div class="row__antenna">
        <span class="row__name">{name}</span>
        <Lamp on={xmit} tone="green">Xmit</Lamp>
        <span class="row__lane">
            <Lamp on={xmit && sameLane} tone="white" dot={false}>Same</Lamp>
            <Lamp on={xmit && !sameLane} tone="white" dot={false}>Opp</Lamp>
        </span>
    </div>

    <div class="row__cell">
        <div class="row__labels">
            <span class="radar-label">Target</span>
            <Lamp on={over} tone="red" dot={false}>Over</Lamp>
        </div>
        <div class="win">
            <LedDigits value={liveHas ? live.speed : null} tone="red" />
            <DirectionArrows direction={xmit ? live.direction : false} />
        </div>
        <PlateLine plate={xmit ? live.plate : null} vehicleClass={live.class} flag={live.flag} />
    </div>

    <div class="row__cell">
        <div class="row__labels">
            <span class="radar-label">Fast</span>
            <span class="row__lamps">
                <Lamp on={heldHas && !locked} tone="amber" dot={false}>Held</Lamp>
                <Lamp on={locked} tone="red" dot={false}>Lock</Lamp>
            </span>
        </div>
        <div class="win">
            <LedDigits value={heldHas ? held.speed : null} tone="amber" />
        </div>
        <PlateLine plate={heldHas ? held.plate : null} vehicleClass={held.class} flag={held.flag} />
    </div>
</div>

<style>
    .row {
        display: grid;
        grid-template-columns: 88px minmax(0, 1fr) minmax(0, 1fr);
        gap: 12px;
        padding: 10px 0;
    }
    .row__antenna {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
        padding-top: 2px;
    }
    .row__name {
        font-size: 14px;
        font-weight: 700;
        line-height: 16px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--au-text);
        margin-bottom: 2px;
    }
    .row__lane,
    .row__lamps {
        display: inline-flex;
        gap: 8px;
    }
    .row__cell {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
    }
    .row__labels {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        height: 16px;
    }
    /* Recessed LED window. */
    .win {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        height: 60px;
        padding: 0 10px 0 12px;
        background: var(--hud-black);
        border: 1px solid #000;
        border-radius: var(--au-radius);
        box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.9);
    }
</style>
