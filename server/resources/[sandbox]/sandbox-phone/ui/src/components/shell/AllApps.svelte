<script>
    import { Icon, Button } from '@sandbox/ui-kit';
    import AppPage from '../common/AppPage.svelte';
    import AppOptions from './AppOptions.svelte';
    import { data } from '../../state/data.svelte.js';
    import { openApp } from '../../state/router.svelte.js';
    import { setUnread } from '../../state/phone.svelte.js';
    import { myApps, appIcon } from '../../lib/apps.js';
    import { onColor, tileColor } from '../../lib/color.js';

    /** Every installed app in name order, each with its options. */
    const apps = $derived(myApps());
    const list = $derived(
        (data.player?.Apps?.installed ?? [])
            .map((n) => apps[n])
            .filter(Boolean)
            .sort((a, b) => String(a.label).localeCompare(String(b.label))),
    );
    const home = $derived(data.player?.Apps?.home ?? []);
    let options = $state(null);
</script>

<AppPage title="All apps">
    <ul class="ph-list">
        {#each list as app (app.name)}
            <li class="row">
                <button
                    type="button"
                    class="ph-row"
                    onclick={() => {
                        setUnread(app.name, 0);
                        openApp(app.name);
                    }}
                >
                    <span class="sq" style="background:{tileColor(app.color)};color:{onColor(app.color)}"><Icon icon={appIcon(app)} size={20} /></span>
                    <span class="ph-row__main">
                        <span class="ph-row__title">{app.label}</span>
                        <span class="ph-row__sub">{home.includes(app.name) ? 'On home screen' : 'Not on home screen'}</span>
                    </span>
                </button>
                <Button variant="tertiary" size="sm" onclick={() => (options = app)}>Options</Button>
            </li>
        {:else}
            <li class="ph-note">No apps are installed. Open App Store to install some.</li>
        {/each}
    </ul>
</AppPage>

<AppOptions bind:app={options} />

<style>
    .row {
        display: flex;
        align-items: center;
        padding-right: var(--au-s3);
    }
    .sq {
        width: 36px;
        height: 36px;
        display: grid;
        place-items: center;
        flex-shrink: 0;
    }
</style>
