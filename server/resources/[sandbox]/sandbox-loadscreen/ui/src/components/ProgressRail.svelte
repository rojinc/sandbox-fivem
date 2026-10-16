<script>
    /** 6px teal rail along the bottom edge; mirrors the big bar in the status card. */
    let { fraction = 0 } = $props();
    const pct = $derived(Math.round(Math.min(1, Math.max(0, Number(fraction) || 0)) * 100));
</script>

<div class="rail" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={pct} aria-label="Loading progress">
    <div class="rail__fill" style="width:{pct}%"></div>
</div>

<style>
    .rail {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 6px;
        background: var(--au-dark-bg-alt-shade);
    }
    .rail__fill {
        height: 100%;
        background: var(--au-dark-action);
        transition: width var(--au-slow) var(--au-ease);
    }
</style>
