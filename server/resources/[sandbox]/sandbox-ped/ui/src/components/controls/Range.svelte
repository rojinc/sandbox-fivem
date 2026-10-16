<script>
    import { uid } from '@sandbox/ui-kit';
    import { throttled } from '../../lib/throttle.js';
    import Row from './Row.svelte';

    /**
     * A continuous value (opacity, blend, face feature) as a labelled slider
     * with its number beside it. Changes stream to the game while dragging.
     */
    let { label, value = 0, min = 0, max = 100, step = 1, unit = '', onchange, disabled = false } = $props();

    const id = uid('rng');
    let local = $state(0);
    let dragging = false;
    $effect.pre(() => {
        const v = Math.round(Number(value) || 0);
        if (!dragging) local = v;
    });

    const send = throttled((v) => onchange?.(v), 60);
    const shown = $derived(`${local > 0 && min < 0 ? '+' : ''}${local}${unit}`);
</script>

<Row {label} {id}>
    <div class="ped-range" class:is-disabled={disabled}>
        <input
            {id}
            type="range"
            {min}
            {max}
            {step}
            {disabled}
            bind:value={local}
            oninput={() => {
                dragging = true;
                send.push(Number(local));
            }}
            onchange={() => {
                dragging = false;
                send.flush(Number(local));
            }}
        />
        <span class="ped-range__value au-mono">{shown}</span>
    </div>
</Row>

<style>
    .ped-range {
        display: flex;
        align-items: center;
        gap: var(--au-s2);
        width: 216px;
    }
    .ped-range.is-disabled {
        opacity: 0.45;
    }
    .ped-range__value {
        width: 52px;
        flex-shrink: 0;
        text-align: right;
        font-size: var(--au-fs-xs);
    }
    input[type='range'] {
        -webkit-appearance: none;
        appearance: none;
        flex: 1;
        min-width: 0;
        height: 36px;
        margin: 0;
        background: transparent;
        cursor: pointer;
    }
    input[type='range']:disabled {
        cursor: not-allowed;
    }
    input[type='range']::-webkit-slider-runnable-track {
        height: 4px;
        background: var(--au-bg-sunk);
        border: 2px solid var(--au-ink);
    }
    input[type='range']::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 14px;
        height: 24px;
        margin-top: -12px;
        background: var(--au-ink);
        border: 0;
        border-radius: 0;
    }
    input[type='range']:focus-visible {
        outline: 3px solid var(--au-focus);
        outline-offset: 0;
    }
    input[type='range']:focus-visible::-webkit-slider-thumb {
        background: var(--au-focus);
    }
</style>
