<script>
    let { size = 24, label = 'Loading', class: className = '' } = $props();
</script>

<span class="au-spinner {className}" role="status" aria-label={label} style="width:{size}px;height:{size}px;border-width:{Math.max(2, Math.round(size / 8))}px"></span>

<style>
    .au-spinner {
        display: inline-block;
        border-style: solid;
        border-color: var(--au-bg-alt-shade);
        border-top-color: var(--au-action);
        border-radius: 50%;
        animation: au-spin 0.8s linear infinite;
    }
</style>
