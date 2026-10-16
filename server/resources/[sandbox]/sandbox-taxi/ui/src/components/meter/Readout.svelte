<script>
    /** One small labelled readout inside a <dl>: label above, mono value, optional dim unit. */
    let { label, value, unit } = $props();
</script>

<div class="readout">
    <dt class="readout__label">{label}</dt>
    <dd class="readout__value au-mono">
        {value}{#if unit}<span class="readout__unit">{unit}</span>{/if}
    </dd>
</div>

<style>
    .readout {
        min-width: 0;
    }
    .readout__label {
        font-size: var(--au-fs-xs);
        line-height: 1.5;
        color: var(--au-muted);
    }
    .readout__value {
        margin: 0;
        font-size: var(--au-fs-lg);
        font-weight: 500;
        line-height: 1.25;
        white-space: nowrap;
    }
    .readout__unit {
        margin-left: 0.25em;
        font-family: var(--au-font);
        font-size: var(--au-fs-xs);
        font-weight: 400;
        color: var(--au-muted);
    }
</style>
