<script>
    import Header from './Header.svelte';
    import MainNav from './MainNav.svelte';
    import Footer from './Footer.svelte';

    /**
     * Full-screen app frame: identity header, top-level nav, optional aside,
     * scrolling main column, optional quiet footer.
     */
    let {
        eyebrow,
        title,
        subline,
        brand,
        actions,
        nav,
        navItems,
        navActive,
        onnav,
        navRight,
        aside,
        asideWidth = '232px',
        footer,
        padded = true,
        class: className = '',
        style = '',
        children,
    } = $props();
</script>

<div class="au-shell {className}" {style}>
    {#if title || brand || actions || eyebrow}
        <Header {eyebrow} {title} {subline} {brand} {actions} compact />
    {/if}
    {#if navItems}
        <MainNav items={navItems} active={navActive} onselect={onnav} right={navRight} />
    {:else if nav}
        {@render nav()}
    {/if}
    <div class="au-shell__body">
        {#if aside}<aside class="au-shell__aside" style="width:{asideWidth}">{@render aside()}</aside>{/if}
        <main class="au-shell__main" class:au-shell__main--padded={padded}>{@render children?.()}</main>
    </div>
    {#if footer}<Footer>{@render footer()}</Footer>{/if}
</div>

<style>
    .au-shell {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        background: var(--au-bg);
        color: var(--au-text);
        border: 1px solid var(--au-border);
        overflow: hidden;
    }
    .au-shell__body {
        flex: 1;
        display: flex;
        min-height: 0;
    }
    .au-shell__aside {
        flex-shrink: 0;
        border-right: 1px solid var(--au-border);
        overflow: auto;
        padding: var(--au-s4) 0;
    }
    .au-shell__main {
        flex: 1;
        min-width: 0;
        overflow: auto;
    }
    .au-shell__main--padded {
        padding: var(--au-s6);
    }
</style>
