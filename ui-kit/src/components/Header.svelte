<script>
    /** Navy header band: brand snippet, title, subline, actions snippet. */
    let { title, subline, dark = true, compact = false, brand, actions, class: className = '' } = $props();
</script>

<header class="au-header {className}" class:au-dark={dark} class:au-header--compact={compact}>
    {#if brand}<div class="au-header__brand">{@render brand()}</div>{/if}
    <div class="au-header__text">
        {#if title}<div class="au-header__title">{title}</div>{/if}
        {#if subline}<div class="au-header__subline">{subline}</div>{/if}
    </div>
    {#if actions}<div class="au-header__actions">{@render actions()}</div>{/if}
</header>

<style>
    .au-header {
        display: flex;
        align-items: center;
        gap: var(--au-s4);
        padding: var(--au-s5) var(--au-s6);
        background: var(--au-bg);
        color: var(--au-text);
        border-bottom: 1px solid var(--au-bg-alt-shade);
    }
    .au-header.au-dark {
        border-bottom: 0;
    }
    .au-header--compact {
        padding: var(--au-s3) var(--au-s5);
    }
    .au-header__brand {
        flex-shrink: 0;
        display: flex;
        align-items: center;
    }
    .au-header__text {
        flex: 1;
        min-width: 0;
    }
    .au-header__title {
        font-size: var(--au-fs-lg);
        font-weight: 700;
        line-height: 1.25;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .au-header--compact .au-header__title {
        font-size: var(--au-fs-md);
    }
    .au-header__subline {
        color: var(--au-muted);
        font-size: var(--au-fs-xs);
        margin-top: 2px;
    }
    .au-header__actions {
        display: flex;
        align-items: center;
        gap: var(--au-s2);
        flex-shrink: 0;
    }
</style>
