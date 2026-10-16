<script>
    import Icon from './Icon.svelte';

    /** items: [{ label, onclick? }]; the last item is the current page. */
    let { items = [], class: className = '' } = $props();
</script>

<nav class="au-breadcrumbs {className}" aria-label="Breadcrumb">
    <ol class="au-breadcrumbs__list">
        {#each items as item, i (i)}
            <li class="au-breadcrumbs__item">
                {#if i > 0}<span class="au-breadcrumbs__sep"><Icon icon="chevron-right" /></span>{/if}
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
        margin: 0 0 var(--au-s3);
        padding: 0;
        list-style: none;
        font-size: 13px;
        color: var(--au-hint);
    }
    .au-breadcrumbs__item {
        display: inline-flex;
        align-items: center;
        gap: var(--au-s1);
    }
    .au-breadcrumbs__sep {
        display: flex;
        font-size: 12px;
    }
    .au-breadcrumbs__link {
        border: 0;
        padding: 0;
        background: transparent;
        color: var(--au-muted);
        cursor: pointer;
        font: inherit;
    }
    .au-breadcrumbs__link:hover {
        color: var(--au-action);
    }
    [aria-current='page'] {
        color: var(--au-text);
    }
</style>
