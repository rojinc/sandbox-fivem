<script>
    import { formatClock } from '@sandbox/ui-kit';
    import { meter, miles, fare, tripStatus } from '../../state/meter.svelte.js';
    import { formatMiles } from '../../lib/format.js';
    import Segments from './Segments.svelte';

    /**
     * A dash-mounted taximeter: a black device body around one backlit amber
     * display. The display carries the state annunciators (the current one lit),
     * the fare in large digits, and distance, ride time and rate per mile.
     */
    const STATES = [
        { id: 'running', label: 'Running' },
        { id: 'paused', label: 'Paused' },
        { id: 'stopped', label: 'Stopped' },
    ];
    const status = $derived(tripStatus());
    const statusLabel = $derived(STATES.find((s) => s.id === status)?.label ?? '');

    const fareText = $derived(String(fare()));
    const rateText = $derived(String(Math.max(0, Math.round(Number(meter.rate) || 0))));
    const distanceText = $derived(formatMiles(miles()));
    const timeText = $derived(formatClock(meter.seconds));
</script>

<section class="meter" aria-label="Taxi meter">
    <div class="display">
        <div class="display__states" role="status" aria-label="Meter {statusLabel}">
            {#each STATES as s (s.id)}
                <span class="lamp" class:lamp--on={s.id === status} aria-hidden="true">{s.label}</span>
            {/each}
        </div>

        <div class="display__fare">
            <span class="legend">Fare</span>
            <span class="fare">
                <span class="fare__unit" aria-hidden="true">$</span>
                <Segments text={fareText} cells={4} />
            </span>
        </div>

        <dl class="display__readouts">
            <div class="readout">
                <dt class="legend">Dist</dt>
                <dd><Segments text={distanceText} /><span class="readout__unit">mi</span></dd>
            </div>
            <div class="readout">
                <dt class="legend">Time</dt>
                <dd><Segments text={timeText} /></dd>
            </div>
            <div class="readout readout--rate">
                <dt class="legend">Rate</dt>
                <dd><span class="readout__unit readout__unit--pre">$</span><Segments text={rateText} /><span class="readout__unit">/mi</span></dd>
            </div>
        </dl>
    </div>
    <div class="bezel" aria-hidden="true">Taximeter</div>
</section>

<style>
    /*
     * Device body: black housing, 1px edge and the slight inner shadow asked for
     * (a device exception to the flat house style), square like the kit.
     */
    .meter {
        width: 340px;
        padding: 8px 8px 0;
        background: var(--au-bg-sunk);
        border: 1px solid var(--au-border);
        border-radius: var(--au-radius-lg);
        box-shadow: inset 0 -3px 8px rgba(0, 0, 0, 0.55);
    }

    /* The backlit display window set into the body: flat black glass. */
    .display {
        padding: 10px 14px 12px;
        background: var(--hud-black);
        border-radius: var(--au-radius);
        color: var(--au-warning);
    }

    .legend {
        display: block;
        font-size: 12px;
        font-weight: 700;
        line-height: 16px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--au-warning);
        opacity: 0.7;
    }

    /* State annunciators: every word is printed on the glass, the current one is lit. */
    .display__states {
        display: flex;
        gap: 12px;
        height: 16px;
    }
    .lamp {
        font-size: 12px;
        font-weight: 700;
        line-height: 16px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--au-warning-bg);
        transition: color var(--au-fast) var(--au-ease);
    }
    .lamp--on {
        color: var(--au-warning);
    }

    .display__fare {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        margin-top: 8px;
    }
    .display__fare .legend {
        padding-top: 4px;
    }
    .fare {
        display: inline-flex;
        align-items: flex-start;
        gap: 4px;
        font-size: 48px;
        font-weight: 500;
    }
    .fare__unit {
        font-family: var(--au-font-mono);
        font-size: 24px;
        line-height: 1;
        padding-top: 4px;
    }

    .display__readouts {
        display: grid;
        grid-template-columns: 1.2fr 1fr 1fr;
        gap: 8px;
        margin: 10px 0 0;
        padding-top: 8px;
        border-top: 1px solid var(--au-bg-shade);
    }
    .readout {
        min-width: 0;
    }
    .readout dd {
        margin: 4px 0 0;
        display: flex;
        align-items: baseline;
        font-size: 16px;
        font-weight: 500;
        white-space: nowrap;
    }
    .readout--rate dd {
        font-size: 14px;
    }
    .readout--rate .legend,
    .readout--rate dd {
        justify-content: flex-end;
        text-align: right;
    }
    .readout__unit {
        margin-left: 3px;
        font-size: 12px;
        font-weight: 500;
        opacity: 0.7;
    }
    .readout__unit--pre {
        margin: 0 1px 0 0;
        opacity: 1;
    }

    /* Bottom lip of the housing with the printed device name. */
    .bezel {
        height: 24px;
        padding: 0 6px;
        font-size: 12px;
        font-weight: 500;
        line-height: 24px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--au-hint);
    }
</style>
