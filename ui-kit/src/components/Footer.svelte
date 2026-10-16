<script>
    /** Quiet meta line at the bottom of a page. */
    let { class: className = '', children } = $props();
</script>

<footer class="au-footer {className}">{@render children?.()}</footer>

<style>
    .au-footer {
        display: flex;
        align-items: center;
        gap: var(--au-s4);
        padding: var(--au-s3) var(--au-s6);
        border-top: 4px solid var(--au-ink);
        background: var(--au-bg-shade);
        color: var(--au-muted);
        font-size: var(--au-fs-xs);
    }
    .au-footer :global(.au-icon) {
        font-size: 15px;
    }
</style>
