<script>
    /**
     * A speed in a recessed LED window: right-aligned in a fixed three-cell field,
     * unused cells showing as unlit "8"s. `null` leaves the window dark (no
     * reading). tone: red (target) | amber (fast) | green (patrol).
     */
    let { value = null, tone = 'red', size = 44, cells = 3 } = $props();

    const has = $derived(typeof value === 'number' && Number.isFinite(value));
    const lit = $derived(has ? String(Math.min(999, Math.max(0, Math.round(value)))) : '');
    const width = $derived(Math.max(cells, lit.length));
    const ghost = $derived('8'.repeat(width - lit.length) + ' '.repeat(lit.length));
    const shown = $derived(lit.padStart(width, ' '));
</script>

<span class="led led--{tone}" style="font-size:{size}px">
    <span class="au-hidden">{has ? `${lit} mph` : 'No reading'}</span>
    <span class="led__ghost" aria-hidden="true">{ghost}</span>
    <span class="led__lit" aria-hidden="true">{shown}</span>
</span>

<style>
    .led {
        --lit: var(--hud-red);
        --unlit: var(--au-error-bg);
        position: relative;
        display: inline-grid;
        font-family: var(--au-font-mono);
        font-variant-numeric: tabular-nums;
        font-weight: 500;
        line-height: 1;
        white-space: pre;
    }
    .led--amber {
        --lit: var(--au-warning);
        --unlit: var(--au-warning-bg);
    }
    .led--green {
        --lit: var(--hud-green);
        --unlit: var(--au-success-bg);
    }
    .led__ghost,
    .led__lit {
        grid-area: 1 / 1;
        text-align: right;
    }
    .led__ghost {
        color: var(--unlit);
        opacity: 0.45;
    }
    .led__lit {
        color: var(--lit);
        transition: color var(--au-fast) var(--au-ease);
    }
</style>
