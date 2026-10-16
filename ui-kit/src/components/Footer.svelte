<script>
    let { dark = true, class: className = '', children } = $props();
</script>

<footer class="au-footer {className}" class:au-dark={dark}>{@render children?.()}</footer>

<style>
    .au-footer {
        display: flex;
        align-items: center;
        gap: var(--au-s4);
        padding: var(--au-s3) var(--au-s6);
        background: var(--au-bg-shade);
        color: var(--au-muted);
        font-size: var(--au-fs-xs);
        border-top: 1px solid var(--au-bg-alt-shade);
    }
    .au-footer.au-dark {
        background: var(--au-bg-alt);
        border-top: 0;
    }
</style>
