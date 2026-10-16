<script>
    import Icon from './Icon.svelte';

    /** Horizontal main navigation under the header. items: [{ id, label, icon?, badge?, disabled? }]. */
    let { items = [], active, onselect, dark = false, right, class: className = '', label = 'Main' } = $props();
</script>

<nav class="au-mainnav {className}" class:au-dark={dark} aria-label={label}>
    <ul class="au-mainnav__list">
        {#each items as item (item.id)}
            <li>
                <button
                    type="button"
                    class="au-mainnav__link"
                    class:is-active={active === item.id}
                    aria-current={active === item.id ? 'page' : undefined}
                    disabled={item.disabled}
                    onclick={() => onselect?.(item.id, item)}
                >
                    {#if item.icon}<Icon icon={item.icon} />{/if}
                    <span>{item.label}</span>
                    {#if item.badge !== undefined && item.badge !== null}<span class="au-mainnav__badge">{item.badge}</span>{/if}
                </button>
            </li>
        {/each}
    </ul>
    {#if right}<div class="au-mainnav__right">{@render right()}</div>{/if}
</nav>

<style>
    .au-mainnav {
        display: flex;
        align-items: stretch;
        background: var(--au-bg-shade);
        color: var(--au-text);
        border-bottom: 1px solid var(--au-bg-alt-shade);
        padding: 0 var(--au-s3);
    }
    .au-mainnav__list {
        display: flex;
        flex: 1;
        min-width: 0;
        list-style: none;
        margin: 0;
        padding: 0;
        overflow-x: auto;
    }
    .au-mainnav__link {
        display: inline-flex;
        align-items: center;
        gap: var(--au-s2);
        padding: var(--au-s3) var(--au-s4) 10px;
        border: 0;
        border-bottom: 4px solid transparent;
        background: transparent;
        color: var(--au-text);
        font-weight: 700;
        white-space: nowrap;
        cursor: pointer;
        font: inherit;
        font-weight: 700;
        transition:
            background var(--au-fast) var(--au-ease),
            border-color var(--au-fast) var(--au-ease);
    }
    .au-mainnav__link:hover {
        background: var(--au-bg-alt);
    }
    .au-mainnav__link.is-active {
        border-bottom-color: var(--au-action);
        background: var(--au-bg);
    }
    .au-mainnav.au-dark .au-mainnav__link.is-active {
        background: var(--au-bg-alt);
    }
    .au-mainnav__link:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    .au-mainnav__badge {
        min-width: 20px;
        padding: 0 6px;
        border-radius: 10px;
        background: var(--au-action);
        color: var(--au-action-contrast);
        font-size: 12px;
        line-height: 20px;
        text-align: center;
    }
    .au-mainnav__right {
        display: flex;
        align-items: center;
        gap: var(--au-s2);
        padding: var(--au-s1) 0;
    }
</style>
