<script>
    import { radio } from '../state/radio.svelte.js';
    import { formatFrequency } from '../lib/entry.js';
    import { rangeFor } from '../lib/ranges.js';

    /** The readout panel: channel digits, channel name and the volume meter, all from UPDATE_DATA. */
    const SEGMENTS = Array.from({ length: 10 }, (_, i) => i);

    const onChannel = $derived(radio.power && radio.frequency > 0);
    const masked = $derived(onChannel && radio.maskRadio);
    const digits = $derived(!radio.power ? '---.-' : masked ? '???.?' : formatFrequency(radio.frequency));
    const line = $derived(
        !radio.power ? 'Power off' : !onChannel ? 'No channel' : masked ? 'Channel hidden' : radio.frequencyName || 'Open channel',
    );
    const range = $derived(rangeFor(radio.type));
    const volume = $derived(Math.round(Math.max(0, Math.min(200, Number(radio.volume) || 0))));
    const lit = $derived(Math.round(volume / 20));
</script>

<div class="screen" class:is-off={!radio.power} role="status" aria-live="polite">
    <div class="screen__row">
        <span class="screen__label">Channel</span>
        {#if radio.power}
            <span class="screen__label">{range ? `Range ${range.min}–${range.max}` : 'No radio'}</span>
        {/if}
    </div>
    <div class="screen__digits au-mono" class:is-dim={!onChannel}>{digits}</div>
    <div class="screen__name au-truncate" class:is-dim={!onChannel}>{line}</div>
    <div class="screen__row screen__row--foot">
        <span class="screen__label">Volume</span>
        <span class="meter" aria-hidden="true">
            {#each SEGMENTS as i (i)}
                <span class="meter__seg" class:is-lit={radio.power && i < lit}></span>
            {/each}
        </span>
        <span class="screen__vol au-mono">{radio.power ? `${volume}%` : '--'}</span>
    </div>
</div>

<style>
    .screen {
        display: flex;
        flex-direction: column;
        gap: var(--au-s1);
        padding: var(--au-s3) var(--au-s4);
        background: var(--au-bg-alt);
        border-radius: var(--au-radius);
    }
    .screen__row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--au-s2);
    }
    .screen__row--foot {
        justify-content: flex-start;
        margin-top: var(--au-s2);
    }
    .screen__label {
        font-size: var(--au-fs-xs);
        color: var(--au-muted);
        white-space: nowrap;
    }
    .screen__digits {
        font-size: var(--au-fs-xxl);
        font-weight: 700;
        line-height: 1.1;
        letter-spacing: 1px;
        white-space: nowrap;
        transition: color var(--au-fast) var(--au-ease);
    }
    .screen__name {
        font-size: var(--au-fs-sm);
        font-weight: 500;
        min-height: 24px;
    }
    .is-dim {
        color: var(--au-muted);
    }
    .meter {
        display: inline-flex;
        gap: 2px;
        margin-left: var(--au-s1);
    }
    .meter__seg {
        width: 8px;
        height: 12px;
        border-radius: 1px;
        background: var(--au-bg-alt-shade);
        transition: background var(--au-fast) var(--au-ease);
    }
    .meter__seg.is-lit {
        background: var(--au-action);
    }
    .screen__vol {
        margin-left: auto;
        font-size: var(--au-fs-xs);
        min-width: 40px;
        text-align: right;
    }
</style>
