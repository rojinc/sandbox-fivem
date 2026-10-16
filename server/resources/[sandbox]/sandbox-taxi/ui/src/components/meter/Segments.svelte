<script>
    /**
     * A value on the meter's display, drawn like a segment readout: the value is
     * right-aligned in a fixed field and the unused leading cells show as unlit
     * "8"s, so the display keeps its shape while the number grows. `cells` is the
     * minimum field width; longer values widen it.
     */
    let { text = '', cells = 0, class: className = '' } = $props();

    const lit = $derived(String(text ?? ''));
    const width = $derived(Math.max(Number(cells) || 0, lit.length));
    const ghost = $derived('8'.repeat(width - lit.length) + ' '.repeat(lit.length));
    const shown = $derived(lit.padStart(width, ' '));
</script>

<span class="seg {className}">
    <span class="au-hidden">{lit}</span>
    <span class="seg__ghost" aria-hidden="true">{ghost}</span>
    <span class="seg__lit" aria-hidden="true">{shown}</span>
</span>

<style>
    .seg {
        display: inline-grid;
        font-family: var(--au-font-mono);
        font-variant-numeric: tabular-nums;
        line-height: 1;
        white-space: pre;
    }
    .seg__ghost,
    .seg__lit {
        grid-area: 1 / 1;
        text-align: right;
    }
    .seg__ghost {
        color: var(--au-warning-bg);
        opacity: 0.55;
    }
</style>
