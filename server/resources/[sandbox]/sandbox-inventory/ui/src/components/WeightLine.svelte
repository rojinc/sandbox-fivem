<script>
    /** A thin square weight line: ink fill on a rule track, the error colour once full (the text beside it says "Full"). */
    let { value = 0, max = 0, label = 'Weight' } = $props();
    const pct = $derived(max > 0 ? Math.max(0, Math.min(100, (Number(value) / Number(max)) * 100)) : 0);
    const full = $derived(max > 0 && Number(value) >= Number(max));
</script>

<div class="line" role="meter" aria-label={label} aria-valuemin="0" aria-valuemax={max} aria-valuenow={Math.round(Number(value) * 100) / 100}>
    <span class="fill" class:is-full={full} style:width="{pct}%"></span>
</div>

<style>
    .line {
        height: 4px;
        background: var(--au-border);
    }
    .fill {
        display: block;
        height: 100%;
        background: var(--au-ink);
        transition: width var(--au-normal) var(--au-ease);
    }
    .fill.is-full {
        background: var(--au-error);
    }
</style>
