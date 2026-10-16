<script>
    import Icon from './Icon.svelte';

    /**
     * GOLD side navigation. items: [{ id, label, icon?, badge?, disabled?, children? }].
     * Selecting an item calls onselect(item).
     */
    let { title, items = [], active, onselect, class: className = '' } = $props();
</script>

{#snippet list(entries, depth)}
    <ul class="au-sidenav__list" class:au-sidenav__list--sub={depth > 0}>
        {#each entries as item (item.id ?? item.label)}
            <li class="au-sidenav__item">
                <button
                    type="button"
                    class="au-sidenav__link"
                    class:is-active={active === item.id}
                    aria-current={active === item.id ? 'page' : undefined}
                    disabled={item.disabled}
                    onclick={() => onselect?.(item)}
                >
                    {#if item.icon}<Icon icon={item.icon} fixedWidth />{/if}
                    <span class="au-sidenav__label">{item.label}</span>
                    {#if item.badge !== undefined && item.badge !== null}<span class="au-sidenav__badge">{item.badge}</span>{/if}
                </button>
                {#if item.children?.length}{@render list(item.children, depth + 1)}{/if}
            </li>
        {/each}
    </ul>
{/snippet}

<nav class="au-sidenav {className}" aria-label={title ?? 'Section'}>
    {#if title}<h2 class="au-sidenav__title">{title}</h2>{/if}
    {@render list(items, 0)}
</nav>

<style>
    .au-sidenav__title {
        font-size: var(--au-fs-sm);
        padding: 0 var(--au-s4) var(--au-s2);
        margin: 0;
        border-bottom: 1px solid var(--au-bg-alt-shade);
    }
    .au-sidenav__list {
        list-style: none;
        margin: 0;
        padding: 0;
    }
    .au-sidenav__list--sub .au-sidenav__link {
        padding-left: var(--au-s8);
        font-size: var(--au-fs-xs);
    }
    .au-sidenav__link {
        display: flex;
        align-items: center;
        gap: var(--au-s2);
        width: 100%;
        padding: var(--au-s2) var(--au-s4);
        border: 0;
        border-left: 4px solid transparent;
        background: transparent;
        color: var(--au-text);
        text-align: left;
        cursor: pointer;
        font: inherit;
        line-height: 1.5;
    }
    .au-sidenav__link:hover {
        background: var(--au-bg-alt);
    }
    .au-sidenav__link.is-active {
        border-left-color: var(--au-action);
        background: var(--au-bg-alt);
        font-weight: 700;
    }
    .au-sidenav__link:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    .au-sidenav__label {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .au-sidenav__badge {
        min-width: 20px;
        padding: 0 6px;
        border-radius: 10px;
        background: var(--au-action);
        color: var(--au-action-contrast);
        font-size: 12px;
        font-weight: 700;
        line-height: 20px;
        text-align: center;
    }
</style>
