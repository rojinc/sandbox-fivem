<script>
    import { Icon } from '@sandbox/ui-kit';
    import { tileInk, isVeryDark } from '../../lib/apps.js';

    /** One app on the desktop: a flat square tile in the app colour with the name under it. */
    let { app, onopen } = $props();

    const ink = $derived(tileInk(app.color));
    const unread = $derived(Number(app.unread) || 0);
</script>

<button type="button" class="launcher" onclick={onopen}>
    <span class="launcher__tile launcher__tile--{ink}" class:launcher__tile--edge={isVeryDark(app.color)} style="background:{app.color}">
        <Icon icon={app.icon} size={36} stroke={1.75} />
        {#if unread > 0}<span class="launcher__badge au-mono">{unread > 99 ? '99+' : unread}<span class="au-hidden"> unread</span></span>{/if}
    </span>
    <span class="launcher__label au-overworld">{app.label}</span>
</button>

<style>
    .launcher {
        width: 104px;
        padding: 8px 4px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        border: 0;
        background: transparent;
        color: inherit;
        cursor: pointer;
    }
    .launcher__tile {
        position: relative;
        width: 64px;
        height: 64px;
        display: grid;
        place-items: center;
    }
    .launcher__tile--light {
        color: var(--au-text);
    }
    .launcher__tile--dark {
        color: var(--au-on-focus);
    }
    .launcher__tile--edge {
        box-shadow: inset 0 0 0 1px var(--au-border);
    }
    .launcher__badge {
        position: absolute;
        top: -8px;
        right: -10px;
        min-width: 24px;
        padding: 0 6px;
        background: var(--au-error);
        color: var(--au-on-focus);
        font-size: var(--au-fs-xxs);
        font-weight: 700;
        line-height: 24px;
        text-align: center;
    }
    .launcher__label {
        max-width: 100%;
        font-size: var(--au-fs-xs);
        font-weight: 500;
        line-height: 1.25;
        text-align: center;
        overflow-wrap: anywhere;
    }
    .launcher:hover .launcher__label {
        text-decoration: underline;
        text-decoration-thickness: 3px;
        text-underline-offset: 0.2em;
    }
    .launcher:focus-visible {
        outline: none;
    }
    .launcher:focus-visible .launcher__tile {
        outline: 3px solid var(--au-focus);
        outline-offset: 2px;
    }
    .launcher:focus-visible .launcher__label {
        background: var(--au-focus);
        color: var(--au-on-focus);
        text-shadow: none;
    }
</style>
