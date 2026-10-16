<script>
    import { fly } from 'svelte/transition';
    import { Icon, RichText, fetchNui, onKey } from '@sandbox/ui-kit';
    import { ui } from '../../state/ui.svelte.js';

    /** Right-hand list menu with submenus (client/list.lua). */
    const list = $derived(ui.list);
    const menu = $derived(list.active ? list.menus[list.active] : null);
    const items = $derived((Array.isArray(menu?.items) ? menu.items : Object.values(menu?.items ?? {})).filter(Boolean));
    let cursor = $state(0);

    $effect(() => {
        void list.active;
        void list.showing;
        cursor = 0;
    });

    const close = () => fetchNui('ListMenu:Close');
    function back() {
        fetchNui('ListMenu:Back');
        ui.list.active = ui.list.stack.length ? ui.list.stack[ui.list.stack.length - 1] : 'main';
        ui.list.stack = ui.list.stack.slice(0, -1);
    }
    function select(item) {
        if (!item || item.disabled) return;
        if (item.submenu) {
            fetchNui('ListMenu:SubMenu', { submenu: item.submenu });
            if (ui.list.menus[item.submenu] && item.submenu !== ui.list.active) {
                ui.list.stack = [...ui.list.stack, ui.list.active];
                ui.list.active = item.submenu;
            }
        } else if (item.event) {
            fetchNui('ListMenu:Clicked', { event: item.event, data: item.data });
        }
    }
    const action = (item, event) => fetchNui('ListMenu:Clicked', { event, data: item.data });

    onKey('Escape', () => (list.showing ? close() : false));
    onKey('Backspace', () => (list.showing && list.stack.length ? back() : false));
    onKey(['ArrowDown', 'ArrowUp'], (e) => {
        if (!list.showing || !items.length) return false;
        cursor = e.key === 'ArrowDown' ? (cursor + 1) % items.length : (cursor - 1 + items.length) % items.length;
        return true;
    });
    onKey('Enter', () => (list.showing ? select(items[cursor]) : false));
</script>

{#if list.showing && menu}
    <div class="menu hud-ui" transition:fly={{ x: 40, duration: 200 }} role="menu" aria-label={menu.label ?? 'Menu'}>
        <div class="menu__head">
            {#if list.stack.length}
                <button type="button" class="menu__iconbtn" aria-label="Back" onclick={back}><Icon icon="arrow-left" /></button>
            {/if}
            <div class="menu__title au-truncate">{menu.label ?? 'Menu'}</div>
            {#if menu.headerAction?.event}
                <button
                    type="button"
                    class="menu__iconbtn"
                    aria-label={menu.headerAction.label ?? 'Action'}
                    title={menu.headerAction.label}
                    onclick={() => fetchNui('ListMenu:Clicked', { event: menu.headerAction.event, data: menu.headerAction.data })}
                >
                    <Icon icon={menu.headerAction.icon ?? 'ellipsis'} />
                </button>
            {/if}
            <button type="button" class="menu__iconbtn" aria-label="Close" onclick={close}><Icon icon="xmark" /></button>
        </div>
        <div class="menu__list">
            {#each items as item, i (`${list.active}-${i}`)}
                {@const clickable = !item.actions && (item.event || item.submenu)}
                <div
                    class="row"
                    class:is-selected={i === cursor}
                    class:is-disabled={item.disabled}
                    class:is-clickable={clickable && !item.disabled}
                    role="menuitem"
                    tabindex="-1"
                    aria-disabled={item.disabled || undefined}
                    onmouseenter={() => (cursor = i)}
                    onclick={() => clickable && select(item)}
                    onkeydown={(e) => e.key === 'Enter' && clickable && select(item)}
                >
                    <div class="row__text">
                        <div class="row__label au-truncate">{item.label}</div>
                        {#if item.description}<div class="row__desc"><RichText text={item.description} tag="div" /></div>{/if}
                    </div>
                    {#if item.submenu}<span class="row__chev"><Icon icon="chevron-right" /></span>{/if}
                    {#if Array.isArray(item.actions)}
                        <div class="row__actions">
                            {#each item.actions as a, j (j)}
                                <button
                                    type="button"
                                    class="row__action"
                                    aria-label={a.label ?? a.event}
                                    title={a.label}
                                    onclick={(e) => {
                                        e.stopPropagation();
                                        action(item, a.event);
                                    }}
                                >
                                    <Icon icon={a.icon ?? 'circle-dot'} />
                                </button>
                            {/each}
                        </div>
                    {/if}
                </div>
            {/each}
            {#if !items.length}<div class="menu__empty">Nothing here</div>{/if}
        </div>
    </div>
{/if}

<style>
    .menu {
        position: absolute;
        right: 12vw;
        top: 18vh;
        width: 380px;
        max-height: 64vh;
        display: flex;
        flex-direction: column;
        background: var(--au-bg);
        color: var(--au-text);
        border: 1px solid var(--au-border);
        border-radius: var(--au-radius-lg);
        box-shadow: var(--au-shadow-2);
        overflow: hidden;
    }
    .menu__head {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 12px 10px 10px 16px;
        border-bottom: 1px solid var(--au-border);
    }
    .menu__title {
        flex: 1;
        font-size: 16px;
        font-weight: 500;
    }
    .menu__iconbtn {
        width: 32px;
        height: 32px;
        border: 0;
        border-radius: var(--au-radius);
        background: transparent;
        color: var(--au-muted);
        display: grid;
        place-items: center;
        cursor: pointer;
        font-size: 17px;
    }
    .menu__iconbtn:hover {
        background: var(--au-bg-alt);
    }
    .menu__list {
        overflow-y: auto;
        padding: 6px;
    }
    .row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 10px;
        min-height: 44px;
        border-radius: var(--au-radius);
        transition: background var(--au-fast) var(--au-ease);
    }
    .row.is-clickable {
        cursor: pointer;
    }
    .row.is-selected {
        background: var(--au-bg-alt);
    }
    .row.is-disabled {
        opacity: 0.45;
    }
    .row__text {
        flex: 1;
        min-width: 0;
    }
    .row__label {
        font-size: 14px;
        font-weight: 500;
    }
    .row__desc {
        font-size: 13px;
        color: var(--au-muted);
        line-height: 1.35;
        margin-top: 1px;
    }
    .row__chev {
        color: var(--au-muted);
        font-size: 15px;
        display: flex;
    }
    .row__actions {
        display: flex;
        gap: 4px;
    }
    .row__action {
        width: 32px;
        height: 32px;
        border: 1px solid var(--au-border-strong);
        border-radius: var(--au-radius);
        background: transparent;
        color: var(--au-text);
        display: grid;
        place-items: center;
        cursor: pointer;
        font-size: 16px;
    }
    .row__action:hover {
        background: var(--au-bg-alt-shade);
        color: var(--au-action);
    }
    .menu__empty {
        padding: 24px;
        text-align: center;
        color: var(--au-muted);
        font-size: 14px;
    }
</style>
