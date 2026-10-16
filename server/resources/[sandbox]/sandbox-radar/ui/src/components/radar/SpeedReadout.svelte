<script>
    /** Three-character mono speed readout; a missing value renders as dashes. */
    let { value = null, size = 40 } = $props();

    const has = $derived(typeof value === 'number' && Number.isFinite(value));
    const text = $derived(has ? String(Math.min(999, Math.max(0, Math.round(value)))) : '---');
</script>

<span class="readout au-mono" class:readout--empty={!has} style="font-size:{size}px">{text}</span>

<style>
    .readout {
        display: inline-block;
        min-width: 3ch;
        text-align: right;
        font-weight: 700;
        line-height: 1;
        color: var(--au-text);
        white-space: nowrap;
        transition: color var(--au-fast) var(--au-ease);
    }
    .readout--empty {
        color: var(--au-muted);
        opacity: 0.6;
    }
</style>
