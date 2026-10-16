<script>
    import { fade } from 'svelte/transition';
    import { Icon, fetchNui, onKey } from '@sandbox/ui-kit';
    import { ui } from '../../state/ui.svelte.js';

    /** Targeting reticle plus context options at screen centre (client/events.lua Targeting:*). */
    const eye = $derived(ui.thirdEye);
    const close = () => fetchNui('targetingAction', false);
    const pick = (b) => fetchNui('targetingAction', { event: b.event, data: b.data });

    onKey(['Escape', 'Backspace'], () => (eye.showing && eye.menuOpen ? close() : false));
</script>

{#if eye.showing}
    <div class="eye" transition:fade={{ duration: 120 }}>
        <div class="eye__reticle hud-shadow" class:has-target={Boolean(eye.icon)}>
            <Icon icon={eye.icon || 'circle'} />
        </div>
        {#if eye.menuOpen && eye.menu.length}
            <div class="eye__menu au-dark hud-ui" transition:fade={{ duration: 120 }} role="menu">
                {#each eye.menu as b, i (i)}
                    <button
                        type="button"
                        class="eye__item"
                        role="menuitem"
                        onclick={(e) => {
                            e.stopPropagation();
                            pick(b);
                        }}
                    >
                        <span class="eye__icon">{#if b.icon}<Icon icon={b.icon} fixedWidth />{/if}</span>
                        <span>{b.text}</span>
                    </button>
                {/each}
            </div>
        {/if}
    </div>
{/if}

<style>
    .eye {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }
    .eye__reticle {
        width: 44px;
        height: 44px;
        display: grid;
        place-items: center;
        color: #fff;
        font-size: 8px;
        transition:
            font-size 160ms var(--au-ease),
            color 160ms;
    }
    .eye__reticle.has-target {
        color: var(--au-dark-action);
        font-size: 26px;
    }
    .eye__menu {
        position: absolute;
        left: 54px;
        top: 0;
        min-width: 200px;
        padding: 4px 0;
        background: var(--au-dark-bg);
        border-radius: var(--au-radius);
        box-shadow: var(--au-shadow-2);
    }
    .eye__item {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 9px 14px;
        border: 0;
        border-left: 4px solid transparent;
        background: transparent;
        color: #fff;
        font: inherit;
        font-size: 14px;
        font-weight: 500;
        text-align: left;
        white-space: nowrap;
        cursor: pointer;
    }
    .eye__item:hover {
        background: var(--au-dark-bg-alt);
        border-left-color: var(--au-dark-action);
    }
    .eye__icon {
        width: 18px;
        color: var(--au-dark-muted);
        font-size: 13px;
    }
</style>
