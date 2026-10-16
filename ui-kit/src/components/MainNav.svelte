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
        min-height: 48px;
        padding: 0;
        border: 0;
        background: transparent;
        color: var(--au-text);
        font: inherit;
        font-size: var(--au-fs-xs);
        font-weight: 700;
        white-space: nowrap;
        cursor: pointer;
    }
    .au-mainnav__link:hover {
        text-decoration: underline;
        text-decoration-thickness: 3px;
        text-underline-offset: 0.3em;
    }
    .au-mainnav__link.is-active {
        box-shadow: inset 0 -4px var(--au-ink);
    }
    .au-mainnav__link:focus-visible {
        outline: 3px solid transparent;
        background: var(--au-focus);
        color: var(--au-on-focus);
        box-shadow: inset 0 -4px var(--au-on-focus);
    }
    .au-mainnav__link:disabled {
        opacity: 0.45;
        cursor: not-allowed;
    }
    .au-mainnav__badge {
        padding: 0 6px;
        background: var(--au-bg-alt-shade);
        color: var(--au-text);
        font-size: var(--au-fs-xxs);
        line-height: 1.5;
        font-variant-numeric: tabular-nums;
    }
    .au-mainnav__right {
        display: flex;
        align-items: center;
        gap: var(--au-s2);
        color: var(--au-muted);
        font-size: var(--au-fs-xs);
    }
</style>
