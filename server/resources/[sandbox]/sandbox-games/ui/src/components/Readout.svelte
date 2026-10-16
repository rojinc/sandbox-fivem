<script>
    /** A muted label with a mono value, for the title row ("Strikes 1/2"). tone: success | warning | error. */
    let { label, value, tone } = $props();
</script>

<span class="gm-readout">
    <span class="gm-readout__label">{label}</span>
    <span class="gm-readout__value au-mono" class:is-success={tone === 'success'} class:is-warning={tone === 'warning'} class:is-error={tone === 'error'}>{value}</span>
</span>

<style>
    .gm-readout {
        display: inline-flex;
        align-items: baseline;
        gap: 6px;
        line-height: 1;
    }

    .gm-readout__label {
        font-size: var(--au-fs-xxs);
        color: var(--au-hint);
    }

    .gm-readout__value {
        font-size: var(--au-fs-xs);
        font-weight: 500;
        color: var(--au-text);
    }

    .is-success {
        color: var(--au-success);
    }

    .is-warning {
        color: var(--au-warning);
    }

    .is-error {
        color: var(--au-error);
    }
</style>
