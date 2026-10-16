<script>
    import { Tag, formatMoney, formatClock } from '@sandbox/ui-kit';
    import { meter, miles, fare, tripStatus } from '../../state/meter.svelte.js';
    import { formatMiles } from '../../lib/format.js';
    import Readout from './Readout.svelte';

    /**
     * The meter panel: header row (title, rate per mile), the fare in large
     * mono digits with the ride state tag, then distance and time readouts.
     */
    const STATUS = {
        running: { label: 'Running', tone: 'success', solid: true },
        paused: { label: 'Paused', tone: 'warning', solid: true },
        stopped: { label: 'Stopped', tone: 'default', solid: false },
    };
    const status = $derived(STATUS[tripStatus()]);
    const fareText = $derived(formatMoney(fare()));
    const rateText = $derived(formatMoney(meter.rate));
    const distanceText = $derived(formatMiles(miles()));
    const timeText = $derived(formatClock(meter.seconds));
</script>

<section class="meter au-dark" aria-label="Taxi meter">
    <header class="meter__head">
        <h2 class="meter__title">Taxi meter</h2>
        <p class="meter__rate"><span class="au-mono">{rateText}</span> <span class="au-muted">per mile</span></p>
    </header>
    <div class="meter__body">
        <div class="meter__fare-head">
            <span class="meter__label">Fare</span>
            <Tag tone={status.tone} solid={status.solid}>{status.label}</Tag>
        </div>
        <div class="meter__fare au-mono">{fareText}</div>
        <dl class="meter__readouts">
            <Readout label="Distance" value={distanceText} unit="mi" />
            <Readout label="Time" value={timeText} />
        </dl>
    </div>
</section>

<style>
    .meter {
        width: 320px;
        background: var(--au-bg);
        color: var(--au-text);
        border-radius: var(--au-radius);
        box-shadow: var(--au-shadow-2);
        overflow: hidden;
        animation: au-rise-in var(--au-normal) var(--au-ease);
    }
    .meter__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--au-s3);
        padding: var(--au-s2) var(--au-s4);
        background: var(--au-bg-alt);
    }
    .meter__title {
        margin: 0;
        font-size: var(--au-fs-sm);
        font-weight: 700;
        line-height: 1.5;
    }
    .meter__rate {
        margin: 0;
        max-width: none;
        font-size: var(--au-fs-xs);
        line-height: 1.5;
        white-space: nowrap;
    }
    .meter__body {
        padding: var(--au-s3) var(--au-s4) var(--au-s4);
    }
    .meter__fare-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--au-s2);
    }
    .meter__label {
        font-size: var(--au-fs-xs);
        color: var(--au-muted);
    }
    .meter__fare {
        font-size: var(--au-fs-xxxl);
        font-weight: 700;
        line-height: 1.25;
        letter-spacing: -0.02em;
        white-space: nowrap;
    }
    .meter__readouts {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--au-s4);
        margin: var(--au-s3) 0 0;
        padding-top: var(--au-s3);
        border-top: 1px solid var(--au-bg-alt-shade);
    }
</style>
