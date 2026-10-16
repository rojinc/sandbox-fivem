<script>
    /** A key name inside running text ("Press E to open"). Not for hint footers. */
    let { class: className = '', children } = $props();
</script>

<kbd class="au-kbd {className}">{@render children?.()}</kbd>

<style>
    .au-kbd {
        display: inline-block;
        min-width: 1.5em;
        padding: 0 0.4em;
        border: 1px solid var(--au-border-strong);
        border-radius: var(--au-radius);
        background: var(--au-bg-alt);
        color: var(--au-text);
        font-family: var(--au-font);
        font-size: 0.85em;
        font-weight: 500;
        line-height: 1.6;
        text-align: center;
        vertical-align: baseline;
        white-space: nowrap;
    }
</style>
