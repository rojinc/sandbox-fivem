<script>
    import { Icon } from '@sandbox/ui-kit';
    import { appIcon } from '../../lib/apps.js';
    import { onColor, tileColor } from '../../lib/color.js';

    /** One app on the home screen: a flat square in the app's colour, its name underneath. */
    let { app, onopen, onoptions, overlay = true, size = 56 } = $props();

    let holdTimer = null;
    let held = false;

    function down(e) {
        if (e.button !== 0) return;
        held = false;
        clearTimeout(holdTimer);
        holdTimer = setTimeout(() => {
            held = true;
            onoptions?.(app);
        }, 700);
    }
    function up() {
        clearTimeout(holdTimer);
    }
    function click() {
        if (held) {
            held = false;
            return;
        }
        onopen?.(app);
    }
</script>

<button
    type="button"
    class="tile"
    title={app.label}
    onclick={click}
    onpointerdown={down}
    onpointerup={up}
    onpointerleave={up}
    oncontextmenu={(e) => {
        e.preventDefault();
        onoptions?.(app);
    }}
    aria-label={app.unread > 0 ? `${app.label}, ${app.unread} unread` : app.label}
>
    <span class="tile__square" style="background:{tileColor(app.color)};color:{onColor(app.color)};width:{size}px;height:{size}px">
        <Icon icon={appIcon(app)} size={Math.round(size * 0.5)} stroke={1.75} />
        {#if app.unread > 0}<span class="tile__badge ph-num">{app.unread > 99 ? '99+' : app.unread}</span>{/if}
    </span>
    <span class="tile__label" class:au-overworld={overlay}>{app.label}</span>
</button>

<style>
    .tile {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--au-s1);
        min-width: 0;
        padding: var(--au-s1) 0;
        border: 0;
        background: transparent;
        color: var(--au-text);
        font: inherit;
        cursor: pointer;
    }
    .tile:focus-visible {
        outline: 3px solid var(--au-focus);
        outline-offset: 0;
    }
    .tile:hover .tile__label {
        text-decoration: underline;
        text-decoration-thickness: 2px;
    }
    .tile__square {
        position: relative;
        display: grid;
        place-items: center;
    }
    .tile__badge {
        position: absolute;
        top: -6px;
        right: -8px;
        min-width: 24px;
        height: 24px;
        padding: 0 4px;
        display: grid;
        place-items: center;
        background: var(--au-ink);
        color: var(--au-on-ink);
        font-size: var(--au-fs-xs);
        font-weight: 700;
        line-height: 1;
    }
    .tile__label {
        max-width: 100%;
        font-size: var(--au-fs-xs);
        line-height: 1.25;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
</style>
