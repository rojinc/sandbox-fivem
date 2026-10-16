<script>
    import logo from '../../assets/logo.webp';

    /**
     * The console panel, docked to the right edge at full height. The rest of
     * the screen stays transparent: client/nui.lua points the camera north at
     * the player's characters standing as peds left of centre (about
     * x 400-870 at 1080p), so the panel must not sit on the left.
     *
     * Identity block on top (4px ink rule under it), a scrolling body, and an
     * optional pinned footer (`footer` snippet) holding the primary action.
     */
    let { title, subline, footer, children } = $props();
</script>

<aside class="dock">
    <header class="dock__head">
        <img class="dock__logo" src={logo} alt="" draggable="false" />
        <div class="dock__identity">
            <strong class="dock__eyebrow">SandboxRP</strong>
            <h1 class="dock__title">{title}</h1>
            {#if subline}<div class="dock__subline">{subline}</div>{/if}
        </div>
    </header>

    <div class="dock__body">{@render children?.()}</div>

    {#if footer}
        <div class="dock__foot">{@render footer()}</div>
    {/if}
</aside>

<style>
    .dock {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        width: 720px;
        display: flex;
        flex-direction: column;
        border-left: 1px solid var(--au-border);
        isolation: isolate;
    }
    /* #181a1d at 96%: solid enough to read, and the scene still frames it. */
    .dock::before {
        content: '';
        position: absolute;
        inset: 0;
        z-index: -1;
        background: var(--au-bg);
        opacity: 0.96;
    }
    .dock__head {
        display: flex;
        align-items: center;
        gap: 20px;
        margin: 0 32px;
        padding: 36px 0 20px;
        border-bottom: 4px solid var(--au-ink);
    }
    .dock__logo {
        height: 48px;
        width: auto;
        flex-shrink: 0;
    }
    .dock__identity {
        min-width: 0;
    }
    .dock__eyebrow {
        display: block;
        font-size: var(--au-fs-xs);
        font-weight: 800;
    }
    .dock__title {
        margin: 2px 0 0;
        font-size: var(--au-fs-lg);
        font-weight: 700;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .dock__subline {
        margin-top: 2px;
        color: var(--au-muted);
        font-size: var(--au-fs-xs);
    }
    .dock__body {
        flex: 1;
        min-height: 0;
        overflow: auto;
        padding: 24px 32px 32px;
    }
    .dock__foot {
        margin: 0 32px;
        padding: 20px 0 32px;
        border-top: 1px solid var(--au-border);
    }
</style>
