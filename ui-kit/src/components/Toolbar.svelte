<script>
    /** A row of controls above a list or table: search on the left, actions on the right. */
    let { class: className = '', children, right } = $props();
</script>

<div class="au-toolbar {className}">
    <div class="au-toolbar__left">{@render children?.()}</div>
    {#if right}<div class="au-toolbar__right">{@render right()}</div>{/if}
</div>

<style>
    .au-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--au-s3);
        margin: 0 0 var(--au-s4);
        flex-wrap: wrap;
    }
    .au-toolbar__left,
    .au-toolbar__right {
        display: flex;
        align-items: center;
        gap: var(--au-s2);
        flex-wrap: wrap;
    }
</style>
