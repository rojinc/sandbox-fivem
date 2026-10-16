<script>
    import Icon from './Icon.svelte';

    /** Top-level sections as a row of text links. items: [{ id, label, icon?, badge?, disabled? }] */
    let { items = [], active, onselect, right, class: className = '', label = 'Main' } = $props();
</script>

<nav class="au-mainnav {className}" aria-label={label}>
    <ul class="au-mainnav__list">
        {#each items as item (item.id)}
            <li>
                <button type="button" class="au-mainnav__link" class:is-active={active === item.id} aria-current={active === item.id ? 'page' : undefined} disabled={item.disabled} onclick={() => onselect?.(item.id, item)}>
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
        gap: var(--au-s4);
        padding: 0 var(--au-s6);
        border-bottom: 1px solid var(--au-border);
    }
    .au-mainnav__list {
        display: flex;
        gap: var(--au-s6);
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
        height: 44px;
        padding: 0;
        border: 0;
        border-bottom: 2px solid transparent;
        background: transparent;
        color: var(--au-muted);
        font: inherit;
        font-size: var(--au-fs-xs);
        font-weight: 500;
        white-space: nowrap;
        cursor: pointer;
        margin-bottom: -1px;
        transition:
            color var(--au-fast) var(--au-ease),
            border-color var(--au-fast) var(--au-ease);
    }
    .au-mainnav__link:hover {
        color: var(--au-text);
    }
    .au-mainnav__link.is-active {
        color: var(--au-text);
        border-bottom-color: var(--au-action);
    }
    .au-mainnav__link:disabled {
        opacity: 0.45;
        cursor: not-allowed;
    }
    .au-mainnav__badge {
        min-width: 18px;
        padding: 0 5px;
        border-radius: 9px;
        background: var(--au-bg-alt-shade);
        color: var(--au-text);
        font-size: 11px;
        line-height: 18px;
        text-align: center;
    }
    .au-mainnav__right {
        display: flex;
        align-items: center;
        gap: var(--au-s2);
        color: var(--au-muted);
        font-size: 13px;
    }
</style>
