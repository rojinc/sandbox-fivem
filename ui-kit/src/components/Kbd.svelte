<script>
    let { class: className = '', children } = $props();
</script>

<kbd class="au-kbd {className}">{@render children?.()}</kbd>

<style>
    .au-kbd {
        display: inline-block;
        min-width: 1.6em;
        padding: 0 0.45em;
        border: 1px solid var(--au-border);
        border-bottom-width: 3px;
        border-radius: var(--au-radius);
        background: var(--au-bg-shade);
        color: var(--au-text);
        font-family: var(--au-font);
        font-size: 0.85em;
        font-weight: 700;
        line-height: 1.6;
        text-align: center;
        vertical-align: middle;
        white-space: nowrap;
    }
</style>
