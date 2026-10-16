<script>
    import Icon from './Icon.svelte';

    /** items: [{ id, label, icon?, badge?, disabled?, children? }]; onselect(item). */
    let { title, items = [], active, onselect, class: className = '' } = $props();
</script>

{#snippet list(entries, depth)}
    <ul class="au-sidenav__list" class:au-sidenav__list--sub={depth > 0}>
        {#each entries as item (item.id ?? item.label)}
            <li>
                <button type="button" class="au-sidenav__link" class:is-active={active === item.id} aria-current={active === item.id ? 'page' : undefined} disabled={item.disabled} onclick={() => onselect?.(item)}>
                    {#if item.icon}<span class="au-sidenav__icon"><Icon icon={item.icon} /></span>{/if}
                    <span class="au-sidenav__label">{item.label}</span>
                    {#if item.badge !== undefined && item.badge !== null}<span class="au-sidenav__badge">{item.badge}</span>{/if}
                </button>
                {#if item.children?.length}{@render list(item.children, depth + 1)}{/if}
            </li>
        {/each}
    </ul>
{/snippet}

<nav class="au-sidenav {className}" aria-label={title ?? 'Section'}>
    {#if title}<div class="au-sidenav__title">{title}</div>{/if}
    {@render list(items, 0)}
</nav>

<style>
    .au-sidenav {
        padding: 0 var(--au-s2);
    }
    .au-sidenav__title {
        padding: 0 var(--au-s3) var(--au-s2);
        color: var(--au-text);
        font-size: var(--au-fs-xs);
        font-weight: 700;
    }
    .au-sidenav__list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
    }
    .au-sidenav__list--sub .au-sidenav__link {
        padding-left: 40px;
    }
    .au-sidenav__link {
        display: flex;
        align-items: center;
        gap: var(--au-s3);
        width: 100%;
        min-height: 40px;
        padding: 0 var(--au-s3);
        border: 0;
        border-radius: 0;
        background: transparent;
        color: var(--au-text);
        text-align: left;
        cursor: pointer;
        font: inherit;
        font-size: var(--au-fs-xs);
    }
    .au-sidenav__link:hover {
        background: var(--au-bg-alt);
        color: var(--au-text);
    }
    .au-sidenav__link.is-active {
        background: var(--au-bg-alt-shade);
        color: var(--au-text);
        font-weight: 700;
    }
    .au-sidenav__link:disabled {
        opacity: 0.45;
        cursor: not-allowed;
    }
    .au-sidenav__icon {
        display: flex;
        font-size: 16px;
    }
    .au-sidenav__label {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .au-sidenav__badge {
        padding: 0 6px;
        background: var(--au-bg-alt-shade);
        color: var(--au-text);
        font-size: var(--au-fs-xxs);
        line-height: 1.5;
        font-variant-numeric: tabular-nums;
    }
</style>
