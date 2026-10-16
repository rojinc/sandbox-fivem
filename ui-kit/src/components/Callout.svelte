<script>
    /** A raised note: title and text on the shade surface. */
    let { title, class: className = '', children } = $props();
</script>

<div class="au-callout {className}">
    {#if title}<h3 class="au-callout__title">{title}</h3>{/if}
    <div class="au-callout__body">{@render children?.()}</div>
</div>

<style>
    .au-callout {
        background: var(--au-bg-shade);
        border-radius: var(--au-radius-lg);
        padding: var(--au-s4) var(--au-s5);
        margin: 0 0 var(--au-s4);
    }
    .au-callout__title {
        margin-bottom: var(--au-s1);
        font-size: var(--au-fs-sm);
    }
    .au-callout__body {
        color: var(--au-muted);
        font-size: var(--au-fs-xs);
    }
    .au-callout__body :global(p:last-child) {
        margin-bottom: 0;
    }
</style>
