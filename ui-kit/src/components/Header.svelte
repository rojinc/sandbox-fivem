<script>
    /**
     * Page identity: a short bold label (agency or app acronym) over the
     * title, an optional meta line, and actions on the right.
     */
    let { eyebrow, title, subline, compact = false, brand, actions, class: className = '' } = $props();
</script>

<header class="au-header {className}" class:au-header--compact={compact}>
    {#if brand}<div class="au-header__brand">{@render brand()}</div>{/if}
    <div class="au-header__text">
        {#if eyebrow}<strong class="au-header__eyebrow">{eyebrow}</strong>{/if}
        {#if title}<h2 class="au-header__title">{title}</h2>{/if}
        {#if subline}<div class="au-header__subline">{subline}</div>{/if}
    </div>
    {#if actions}<div class="au-header__actions">{@render actions()}</div>{/if}
</header>

<style>
    .au-header {
        display: flex;
        align-items: center;
        gap: var(--au-s4);
        padding: var(--au-s5) var(--au-s6) var(--au-s4);
        border-bottom: 1px solid var(--au-border);
    }
    .au-header--compact {
        padding: var(--au-s4) var(--au-s5) var(--au-s3);
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
    .au-header__eyebrow {
        display: block;
        color: var(--au-action);
        font-size: var(--au-fs-xxs);
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }
    .au-header__title {
        margin: 2px 0 0;
        font-size: var(--au-fs-md);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .au-header__subline {
        color: var(--au-muted);
        font-size: 13px;
        margin-top: 2px;
    }
    .au-header__actions {
        display: flex;
        align-items: center;
        gap: var(--au-s2);
        flex-shrink: 0;
    }
</style>
