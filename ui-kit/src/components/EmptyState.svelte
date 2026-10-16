<script>
    import Icon from './Icon.svelte';

    /** What a list shows when it has nothing in it. */
    let { icon, title = 'Nothing here yet', class: className = '', children, actions } = $props();
</script>

<div class="au-empty {className}">
    {#if icon}<div class="au-empty__icon"><Icon {icon} /></div>{/if}
    <div class="au-empty__title">{title}</div>
    {#if children}<div class="au-empty__body">{@render children()}</div>{/if}
    {#if actions}<div class="au-empty__actions">{@render actions()}</div>{/if}
</div>

<style>
    .au-empty {
        padding: var(--au-s8) var(--au-s4);
        text-align: center;
        color: var(--au-muted);
        font-size: var(--au-fs-xs);
    }
    .au-empty__icon {
        font-size: 24px;
        margin-bottom: var(--au-s2);
        color: var(--au-hint);
    }
    .au-empty__title {
        font-weight: 500;
        color: var(--au-text);
    }
    .au-empty__body {
        margin-top: var(--au-s1);
    }
    .au-empty__actions {
        margin-top: var(--au-s4);
        display: flex;
        justify-content: center;
        gap: var(--au-s2);
    }
</style>
