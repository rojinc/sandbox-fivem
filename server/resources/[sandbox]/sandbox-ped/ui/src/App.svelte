<script>
    import { onKey } from '@sandbox/ui-kit/nui';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import { app, wantNaked, syncNaked } from './state/app.svelte.js';
    import { MODES } from './data/sections.js';
    import { throttled } from './lib/throttle.js';
    import Editor from './components/Editor.svelte';
    import Dialogs from './components/Dialogs.svelte';

    /**
     * Lua opens the editor (SET_STATE + APP_SHOW) and owns focus; the editor
     * hides itself once Save succeeds or Cancel is confirmed.
     * Laid out in px for 1920x1080; larger screens zoom by the same ratio.
     */
    let zoom = $state(1);
    let height = $state(1080);
    $effect(() => {
        const fit = () => {
            const ratio = Math.min(window.innerWidth / 1920, window.innerHeight / 1080) || 1;
            zoom = Math.max(1, Math.round(ratio * 1000) / 1000);
            height = window.innerHeight / zoom;
        };
        fit();
        window.addEventListener('resize', fit);
        return () => window.removeEventListener('resize', fit);
    });

    // The undress preview follows the player's choice and the open section.
    $effect(() => {
        syncNaked(wantNaked());
    });

    // Mouse wheel over the game zooms the camera; over the editor it scrolls.
    $effect(() => {
        if (!app.visible) return undefined;
        const onWheel = (e) => {
            if (app.dialog || (e.target instanceof Element && e.target.closest('.ped-panel'))) return;
            fetchNui('Zoom', { zoom: e.deltaY / 2000 });
        };
        window.addEventListener('wheel', onWheel, { passive: true });
        return () => window.removeEventListener('wheel', onWheel);
    });

    // Q / E turn the ped, R toggles the idle pose (as the old UI did).
    const turn = throttled((cb) => fetchNui(cb), 50);
    const editing = () => app.visible && !app.dialog;
    onKey(['q', 'Q'], () => {
        if (!editing()) return false;
        turn.push('RotateLeft');
    });
    onKey(['e', 'E'], () => {
        if (!editing()) return false;
        turn.push('RotateRight');
    });
    onKey(['r', 'R'], (e) => {
        if (!editing() || e.repeat) return false;
        fetchNui('Animation');
    });
    // Escape asks to discard changes; the creator has no way out but Save.
    onKey('Escape', () => {
        if (!app.visible || app.dialog || !MODES[app.mode]?.canCancel) return false;
        app.dialog = 'cancel';
    });
</script>

{#if app.visible && MODES[app.mode]}
    <div class="ped-root" style:zoom>
        <Editor {height} />
        <Dialogs />
    </div>
{/if}
