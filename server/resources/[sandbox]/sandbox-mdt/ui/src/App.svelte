<script>
    import { onKey, fetchNui } from '@sandbox/ui-kit';
    import { app } from './state/app.svelte.js';
    import { alerts } from './state/alerts.svelte.js';
    import { overlays } from './state/overlays.svelte.js';
    import Terminal from './components/shell/Terminal.svelte';
    import AlertsPanel from './components/alerts/AlertsPanel.svelte';
    import IdCard from './components/overlays/IdCard.svelte';
    import BodyCam from './components/overlays/BodyCam.svelte';

    /**
     * Everything is laid out on a 1920x1080 design canvas and zoomed to the
     * screen (min of the two ratios), so the terminal keeps its proportions
     * from 1080p to 4K. The stage covers the whole viewport in design pixels,
     * so panels docked to an edge stay on the real edge on ultrawide screens.
     */
    let zoom = $state(1);
    let stageW = $state(1920);
    let stageH = $state(1080);

    $effect(() => {
        const fit = () => {
            zoom = Math.min(window.innerWidth / 1920, window.innerHeight / 1080) || 1;
            stageW = window.innerWidth / zoom;
            stageH = window.innerHeight / zoom;
        };
        fit();
        window.addEventListener('resize', fit);
        return () => window.removeEventListener('resize', fit);
    });

    const dialogOpen = () => Boolean(document.querySelector('.au-modal'));
    const typing = (e) => /^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName ?? '') || e.target?.isContentEditable;

    // Escape closes the terminal (Lua's Close also closes alerts), else the alerts panel. A dialog closes itself first.
    onKey('Escape', () => {
        if (dialogOpen()) return false;
        if (app.visible) {
            fetchNui('Close');
            return true;
        }
        if (alerts.showing) {
            fetchNui('CloseAlerts');
            return true;
        }
        return false;
    });

    // The backquote toggles the alerts panel in Lua; while the panel holds focus the UI closes it.
    onKey('`', (e) => {
        if (!alerts.showing || app.visible || typing(e) || dialogOpen()) return false;
        fetchNui('CloseAlerts');
        return true;
    });
</script>

<div class="stage" style="width:{stageW}px;height:{stageH}px;zoom:{zoom}">
    {#if overlays.bodycam}<BodyCam />{/if}
    <Terminal />
    {#if alerts.showing}<AlertsPanel />{/if}
    {#if overlays.card.showing}<IdCard kind={overlays.card.kind} data={overlays.card.data} />{/if}
</div>

<style>
    .stage {
        position: fixed;
        left: 0;
        top: 0;
        overflow: hidden;
        pointer-events: none;
    }
    .stage > :global(*) {
        pointer-events: auto;
    }
</style>
