<script>
    /** GOLD callout: a left rule in the action colour on a shaded block. */
    let { title, class: className = '', children } = $props();
</script>

<div class="au-callout {className}">
    {#if title}<h3 class="au-callout__title">{title}</h3>{/if}
    <div class="au-callout__body">{@render children?.()}</div>
</div>

<style>
    .au-callout {
        border-left: 4px solid var(--au-action);
        background: var(--au-bg-shade);
        padding: var(--au-s4) var(--au-s5);
        margin: 0 0 var(--au-s4);
    }
    .au-callout__title {
        margin-bottom: var(--au-s2);
        font-size: var(--au-fs-md);
    }
    .au-callout__body :global(p:last-child) {
        margin-bottom: 0;
    }
</style>
