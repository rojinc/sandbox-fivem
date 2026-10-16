<script>
    /** items: [{ label, onclick? }]; the last item is the current page. */
    let { items = [], class: className = '' } = $props();
</script>

<nav class="au-breadcrumbs {className}" aria-label="Breadcrumb">
    <ol class="au-breadcrumbs__list">
        {#each items as item, i (i)}
            <li class="au-breadcrumbs__item">
                {#if i < items.length - 1 && item.onclick}
                    <button type="button" class="au-breadcrumbs__link" onclick={item.onclick}>{item.label}</button>
                {:else}
                    <span aria-current={i === items.length - 1 ? 'page' : undefined}>{item.label}</span>
                {/if}
            </li>
        {/each}
    </ol>
</nav>

<style>
    .au-breadcrumbs__list {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--au-s1);
        margin: 0 0 var(--au-s4);
        padding: 0;
        list-style: none;
        font-size: var(--au-fs-xs);
        color: var(--au-muted);
    }
    .au-breadcrumbs__item + .au-breadcrumbs__item::before {
        content: '›';
        margin: 0 var(--au-s1);
        color: var(--au-muted);
    }
    .au-breadcrumbs__link {
        border: 0;
        padding: 0;
        background: transparent;
        color: var(--au-action);
        text-decoration: underline;
        text-underline-offset: 2px;
        cursor: pointer;
        font: inherit;
    }
    .au-breadcrumbs__link:hover {
        color: var(--au-action-hover);
        text-decoration-thickness: 2px;
    }
    [aria-current='page'] {
        color: var(--au-text);
        font-weight: 700;
    }
</style>
