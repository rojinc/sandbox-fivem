<script>
    import { Icon } from '@sandbox/ui-kit';
    import { componentFor } from '../../lib/registry.js';
    import { closeApp, minimizeApp, openApp } from '../../state/windows.svelte.js';
    import { laptop } from '../../state/laptop.svelte.js';

    /**
     * A square app window: title bar with the app name in bold, minimise and
     * close, a 4px ink rule, then the app. Windows sit right of the app
     * column so the launchers stay reachable. They stay mounted while
     * minimised or behind another window, so an app keeps its place.
     */
    let { app, win, focused = false } = $props();

    const Body = $derived(componentFor(app.name));
    const active = $derived(focused && !win.minimized && laptop.visible);
</script>

<section
    class="window"
    class:window--hidden={win.minimized}
    class:window--focused={focused}
    aria-label={app.label}
    aria-hidden={win.minimized || !focused}
    onpointerdown={() => {
        if (!focused) openApp(app.name);
    }}
>
    <header class="window__bar">
        <h2 class="window__title">{app.label}</h2>
        <button type="button" class="window__control" aria-label="Minimise {app.label}" onclick={() => minimizeApp(app.name)}><Icon icon="minus" stroke={2} /></button>
        <button type="button" class="window__control" aria-label="Close {app.label}" onclick={() => closeApp(app.name)}><Icon icon="x" stroke={2} /></button>
    </header>
    <div class="window__body">
        <Body {app} request={win.request} {active} />
    </div>
</section>

<style>
    .window {
        position: absolute;
        left: 136px;
        top: 16px;
        right: 16px;
        bottom: 16px;
        z-index: 1;
        display: flex;
        flex-direction: column;
        background: var(--au-bg);
        color: var(--au-text);
        border: 1px solid var(--au-border);
        font-size: var(--au-fs-xs);
    }
    .window--focused {
        z-index: 2;
    }
    .window--hidden {
        visibility: hidden;
    }
    .window__bar {
        display: flex;
        align-items: center;
        gap: var(--au-s1);
        height: 52px;
        padding: 0 var(--au-s2) 0 var(--au-s6);
        background: var(--au-bg-shade);
        border-bottom: 4px solid var(--au-ink);
        flex-shrink: 0;
    }
    .window__title {
        flex: 1;
        min-width: 0;
        margin: 0;
        font-size: var(--au-fs-sm);
        font-weight: 700;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .window__control {
        width: 44px;
        height: 44px;
        display: grid;
        place-items: center;
        border: 0;
        background: transparent;
        color: var(--au-text);
        font-size: 20px;
        cursor: pointer;
    }
    .window__control:hover {
        background: var(--au-bg-alt-shade);
    }
    .window__control:focus-visible {
        outline: 3px solid transparent;
        background: var(--au-focus);
        color: var(--au-on-focus);
    }
    .window__body {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
    }
</style>
