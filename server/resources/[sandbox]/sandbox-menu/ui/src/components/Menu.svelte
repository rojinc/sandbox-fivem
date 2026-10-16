<script>
    import { Button, Icon, RichText, onKey } from '@sandbox/ui-kit';
    import { view } from '../state/menu.svelte.js';
    import { closeMenu, goBack } from '../lib/actions.js';
    import { KEYS, handleKey, handleKeyUp } from '../lib/keys.js';
    import MenuRow from './MenuRow.svelte';

    /** The menu panel: docked at the left middle, title, rows, and the selected row's description. */
    const menu = $derived(view.current);
    const items = $derived(menu?.items ?? []);
    const description = $derived(items[view.cursor]?.options?.description);

    let width = $state(1920);
    let height = $state(1080);
    // Chrome is sized in px for 1080p and scaled up on bigger screens (never down, so text stays 16px or more).
    const zoom = $derived(Math.min(2, Math.max(1, Math.min(width / 1920, height / 1080))));
    const maxHeight = $derived(Math.min(820, Math.floor((height - 96) / zoom)));

    let listEl = $state();

    // Keep the selected row, and an open editor, in view.
    $effect(() => {
        const i = view.cursor;
        void view.editing?.id;
        void items.length;
        listEl?.querySelector(`[data-index="${i}"]`)?.scrollIntoView({ block: 'nearest' });
    });

    onKey(KEYS, handleKey);

    $effect(() => {
        window.addEventListener('keyup', handleKeyUp);
        return () => window.removeEventListener('keyup', handleKeyUp);
    });
</script>

<svelte:window bind:innerWidth={width} bind:innerHeight={height} />

{#if view.shown && menu}
    <div class="dock" style="padding-left:{Math.round(48 * zoom)}px">
        <section class="panel" style="zoom:{zoom};max-height:{maxHeight}px" aria-labelledby="menu-title">
            <header class="head">
                <div class="head__text">
                    <h1 class="head__title" id="menu-title">{menu.label || 'Menu'}</h1>
                    {#if menu.subtitle}<p class="head__subtitle">{menu.subtitle}</p>{/if}
                </div>
                <button type="button" class="head__close" aria-label="Close menu" onclick={closeMenu}><Icon icon="x" stroke={2.25} /></button>
            </header>

            <div class="list" role="menu" aria-labelledby="menu-title" bind:this={listEl}>
                {#each items as item, i (`${i}:${item.id}`)}
                    <MenuRow {item} index={i} selected={i === view.cursor} />
                {:else}
                    <div class="empty">
                        <p>This menu has no options.</p>
                        {#if view.history.length}
                            <Button size="sm" variant="secondary" onclick={goBack}>Go back</Button>
                        {:else}
                            <Button size="sm" variant="secondary" onclick={closeMenu}>Close menu</Button>
                        {/if}
                    </div>
                {/each}
            </div>

            {#if description}
                <div class="desc" aria-live="polite"><RichText text={description} tag="p" /></div>
            {/if}
        </section>
    </div>
{/if}

<style>
    .dock {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        pointer-events: none;
    }
    .panel {
        pointer-events: auto;
        display: flex;
        flex-direction: column;
        width: 420px;
        background: var(--au-bg);
        color: var(--au-text);
        border: 2px solid var(--au-ink);
        overflow: hidden;
    }
    .head {
        display: flex;
        align-items: flex-start;
        gap: var(--au-s2);
        padding: var(--au-s4) var(--au-s2) var(--au-s3) var(--au-s5);
        border-bottom: 4px solid var(--au-ink);
        flex-shrink: 0;
    }
    .head__text {
        flex: 1;
        min-width: 0;
        padding-top: 6px;
    }
    .head__title {
        margin: 0;
        font-size: var(--au-fs-md);
        font-weight: 700;
        line-height: 1.25;
        letter-spacing: 0;
        overflow-wrap: anywhere;
    }
    .head__subtitle {
        margin: var(--au-s1) 0 0;
        font-size: var(--au-fs-xs);
        color: var(--au-muted);
    }
    .head__close {
        flex-shrink: 0;
        width: 44px;
        height: 44px;
        padding: 0;
        border: 0;
        background: transparent;
        color: var(--au-text);
        display: grid;
        place-items: center;
        font-size: 24px;
        cursor: pointer;
    }
    .head__close:hover {
        background: var(--au-bg-alt);
    }
    .head__close:focus-visible {
        outline: 3px solid transparent;
        background: var(--au-focus);
        color: var(--au-on-focus);
    }
    .list {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding: var(--au-s2) 0;
        scroll-padding-block: var(--au-s3);
    }
    .empty {
        padding: var(--au-s4) var(--au-s5);
        font-size: var(--au-fs-xs);
        color: var(--au-muted);
    }
    .empty p {
        margin: 0 0 var(--au-s3);
    }
    .desc {
        flex-shrink: 0;
        padding: var(--au-s3) var(--au-s5) var(--au-s4);
        border-top: 1px solid var(--au-border);
        font-size: var(--au-fs-xs);
        color: var(--au-muted);
    }
    .desc :global(p) {
        margin: 0;
    }
</style>
