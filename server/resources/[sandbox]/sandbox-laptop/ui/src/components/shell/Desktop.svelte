<script>
    import AppWindow from './AppWindow.svelte';
    import Launcher from './Launcher.svelte';
    import { data } from '../../state/data.svelte.js';
    import { windows, openApp, topWindow } from '../../state/windows.svelte.js';
    import { desktopApps, appDef } from '../../lib/apps.js';
    import { wallpaperUrl, DEFAULT_WALLPAPER } from '../../lib/wallpapers.js';

    const apps = $derived(desktopApps());
    const wanted = $derived(wallpaperUrl(data.player?.LaptopSettings?.wallpaper));
    let failed = $state(null);
    const src = $derived(failed === wanted ? wallpaperUrl(DEFAULT_WALLPAPER) : wanted);
    const top = $derived(topWindow());
</script>

<div class="desktop">
    <img class="wallpaper" {src} alt="" draggable="false" onerror={() => (failed = wanted)} />

    <nav class="launchers" aria-label="Apps">
        {#each apps as app (app.name)}
            <Launcher {app} onopen={() => openApp(app.name)} />
        {:else}
            {#if data.player}
                <p class="launchers__empty au-overworld">No apps installed</p>
            {/if}
        {/each}
    </nav>

    {#each windows.list as win (win.app)}
        {@const def = appDef(win.app)}
        {#if def}
            <AppWindow app={def} {win} focused={top?.app === win.app} />
        {/if}
    {/each}
</div>

<style>
    .desktop {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 48px;
        overflow: hidden;
    }
    .wallpaper {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        max-width: none;
        object-fit: cover;
        user-select: none;
        pointer-events: none;
    }
    .launchers {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 128px;
        padding: 16px 12px;
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        align-content: flex-start;
        gap: 8px;
    }
    .launchers__empty {
        margin: 0;
        font-size: var(--au-fs-xs);
    }
</style>
