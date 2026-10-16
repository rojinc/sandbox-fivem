<script>
    import Icon from './Icon.svelte';

    /** Secondary navigation inside a page. items: [{ id, label, icon?, badge?, disabled? }]. */
    let { items = [], active = $bindable(), onchange, class: className = '', label = 'Sections' } = $props();

    function pick(item) {
        if (item.disabled) return;
        active = item.id;
        onchange?.(item.id, item);
    }
</script>

<div class="au-tabs {className}" role="tablist" aria-label={label}>
    {#each items as item (item.id)}
        <button
            type="button"
            role="tab"
            class="au-tabs__tab"
            class:is-active={active === item.id}
            aria-selected={active === item.id}
            disabled={item.disabled}
            onclick={() => pick(item)}
        >
            {#if item.icon}<Icon icon={item.icon} />{/if}
            <span>{item.label}</span>
            {#if item.badge !== undefined && item.badge !== null}<span class="au-tabs__badge">{item.badge}</span>{/if}
        </button>
    {/each}
</div>

<style>
    .au-tabs {
        display: flex;
        gap: var(--au-s1);
        border-bottom: 1px solid var(--au-bg-alt-shade);
        overflow-x: auto;
    }
    .au-tabs__tab {
        display: inline-flex;
        align-items: center;
        gap: var(--au-s2);
        padding: var(--au-s2) var(--au-s3) 6px;
        border: 0;
        border-bottom: 4px solid transparent;
        background: transparent;
        color: var(--au-muted);
        font-weight: 700;
        white-space: nowrap;
        cursor: pointer;
        margin-bottom: -1px;
        transition:
            color var(--au-fast) var(--au-ease),
            border-color var(--au-fast) var(--au-ease);
    }
    .au-tabs__tab:hover {
        color: var(--au-text);
        background: var(--au-bg-shade);
    }
    .au-tabs__tab.is-active {
        color: var(--au-text);
        border-bottom-color: var(--au-action);
    }
    .au-tabs__tab:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    .au-tabs__badge {
        min-width: 20px;
        padding: 0 6px;
        border-radius: 10px;
        background: var(--au-action);
        color: var(--au-action-contrast);
        font-size: 12px;
        line-height: 20px;
        text-align: center;
    }
</style>
