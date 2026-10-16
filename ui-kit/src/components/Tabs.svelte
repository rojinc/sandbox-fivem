<script>
    import Icon from './Icon.svelte';

    /** items: [{ id, label, icon?, badge?, disabled? }] */
    let { items = [], active = $bindable(), onchange, class: className = '', label = 'Sections' } = $props();

    function pick(item) {
        if (item.disabled) return;
        active = item.id;
        onchange?.(item.id, item);
    }
</script>

<div class="au-tabs {className}" role="tablist" aria-label={label}>
    {#each items as item (item.id)}
        <button type="button" role="tab" class="au-tabs__tab" class:is-active={active === item.id} aria-selected={active === item.id} disabled={item.disabled} onclick={() => pick(item)}>
            {#if item.icon}<Icon icon={item.icon} />{/if}
            <span>{item.label}</span>
            {#if item.badge !== undefined && item.badge !== null}<span class="au-tabs__badge">{item.badge}</span>{/if}
        </button>
    {/each}
</div>

<style>
    .au-tabs {
        display: flex;
        gap: var(--au-s5);
        border-bottom: 1px solid var(--au-border);
        overflow-x: auto;
    }
    .au-tabs__tab {
        display: inline-flex;
        align-items: center;
        gap: var(--au-s2);
        min-height: 44px;
        padding: 0;
        border: 0;
        background: transparent;
        color: var(--au-muted);
        font: inherit;
        font-size: var(--au-fs-xs);
        font-weight: 700;
        white-space: nowrap;
        cursor: pointer;
    }
    .au-tabs__tab:hover {
        color: var(--au-text);
        text-decoration: underline;
        text-decoration-thickness: 3px;
        text-underline-offset: 0.3em;
    }
    .au-tabs__tab.is-active {
        color: var(--au-text);
        box-shadow: inset 0 -4px var(--au-ink);
    }
    .au-tabs__tab:focus-visible {
        outline: 3px solid transparent;
        background: var(--au-focus);
        color: var(--au-on-focus);
    }
    .au-tabs__tab:disabled {
        opacity: 0.45;
        cursor: not-allowed;
    }
    .au-tabs__badge {
        padding: 0 6px;
        background: var(--au-bg-alt-shade);
        color: var(--au-text);
        font-size: var(--au-fs-xxs);
        line-height: 1.5;
        font-variant-numeric: tabular-nums;
    }
</style>
