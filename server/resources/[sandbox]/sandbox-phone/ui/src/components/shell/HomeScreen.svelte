<script>
    import AppTile from './AppTile.svelte';
    import AppOptions from './AppOptions.svelte';
    import { data } from '../../state/data.svelte.js';
    import { openApp } from '../../state/router.svelte.js';
    import { setUnread } from '../../state/phone.svelte.js';
    import { myApps } from '../../lib/apps.js';

    /** Home screen: the player's apps as a grid of tiles on the wallpaper, the dock below. */
    const apps = $derived(myApps());
    const homeApps = $derived((data.player?.Apps?.home ?? []).map((n) => apps[n]).filter(Boolean));
    const dockApps = $derived((data.player?.Apps?.dock ?? []).slice(0, 4).map((n) => apps[n]).filter(Boolean));

    let options = $state(null);

    function open(app) {
        setUnread(app.name, 0);
        openApp(app.name);
    }
</script>

<div class="home">
    <div class="home__grid">
        {#each homeApps as app (app.name)}
            <AppTile {app} onopen={open} onoptions={(a) => (options = a)} />
        {:else}
            <p class="home__empty au-overworld">Your home screen is empty. Open All apps to put apps here.</p>
        {/each}
    </div>
    {#if dockApps.length}
        <div class="home__dock">
            {#each dockApps as app (app.name)}
                <AppTile {app} overlay={false} onopen={open} onoptions={(a) => (options = a)} />
            {/each}
        </div>
    {/if}
</div>

<AppOptions bind:app={options} />

<style>
    .home {
        display: flex;
        flex-direction: column;
        height: 100%;
    }
    .home__grid {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        grid-auto-rows: min-content;
        gap: var(--au-s3) var(--au-s2);
        padding: var(--au-s3) var(--au-s3) var(--au-s4);
    }
    .home__empty {
        grid-column: 1 / -1;
        margin: var(--au-s6) var(--au-s2);
        font-size: var(--au-fs-xs);
    }
    .home__dock {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: var(--au-s2);
        padding: var(--au-s3) var(--au-s3) var(--au-s2);
        background: var(--au-bg-shade);
        border-top: 1px solid var(--au-border);
        flex-shrink: 0;
    }
</style>
