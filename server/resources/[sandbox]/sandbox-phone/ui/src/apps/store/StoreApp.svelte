<script>
    import { Button, Icon, Tabs, TextInput } from '@sandbox/ui-kit';
    import AppPage from '../../components/common/AppPage.svelte';
    import { data } from '../../state/data.svelte.js';
    import { store } from '../../state/store.svelte.js';
    import { myApps, appIcon } from '../../lib/apps.js';
    import { onColor, tileColor } from '../../lib/color.js';
    import { install, uninstall } from '../../lib/appActions.js';

    /** App Store: apps you can install, and installed apps you can remove. */
    let { app } = $props();

    let tab = $state('get');
    let term = $state('');

    const apps = $derived(myApps());
    const installed = $derived(data.player?.Apps?.installed ?? []);
    const match = (a) => !term.trim() || String(a.label).toLowerCase().includes(term.trim().toLowerCase());
    const byLabel = (a, b) => String(a.label).localeCompare(String(b.label));
    const available = $derived(
        Object.values(apps)
            .filter((a) => !a.hidden && a.store !== false && !installed.includes(a.name))
            .filter(match)
            .sort(byLabel),
    );
    const removable = $derived(
        installed
            .map((n) => apps[n])
            .filter((a) => a && a.canUninstall)
            .filter(match)
            .sort(byLabel),
    );
    const list = $derived(tab === 'get' ? available : removable);
</script>

<AppPage title={app?.label ?? 'App Store'}>
    <div class="top">
        <Tabs
            items={[
                { id: 'get', label: 'Get apps' },
                { id: 'installed', label: 'Installed' },
            ]}
            bind:active={tab}
            label="App Store sections"
        />
        <label class="top__label" for="store-q">Search apps</label>
        <TextInput id="store-q" type="search" bind:value={term} />
    </div>
    {#if list.length}
        <ul class="ph-list">
            {#each list as a (a.name)}
                {@const busy = store.busy[a.name]}
                <li class="row">
                    <span class="sq" style="background:{tileColor(a.color)};color:{onColor(a.color)}"><Icon icon={appIcon(a)} size={20} /></span>
                    <span class="row__main">
                        <span class="row__title">{a.storeLabel ?? a.label}</span>
                        {#if busy}<span class="row__sub">{busy === 'installing' ? 'Installing' : 'Removing'}</span>{/if}
                    </span>
                    {#if tab === 'get'}
                        <Button size="sm" variant="secondary" loading={busy === 'installing'} disabled={Boolean(busy)} onclick={() => install(a.name, a.label)}>Install</Button>
                    {:else}
                        <Button size="sm" variant="secondary" loading={busy === 'removing'} disabled={Boolean(busy)} onclick={() => uninstall(a.name, a.label)}>Uninstall</Button>
                    {/if}
                </li>
            {/each}
        </ul>
    {:else if term.trim()}
        <p class="ph-note">No app matches "{term}".</p>
    {:else}
        <p class="ph-note">{tab === 'get' ? 'You have every app the store offers you.' : 'None of your apps can be removed.'}</p>
    {/if}
</AppPage>

<style>
    .top {
        padding: 0 var(--au-s4) var(--au-s3);
        border-bottom: 1px solid var(--au-border);
    }
    .top__label {
        display: block;
        margin: var(--au-s3) 0 var(--au-s1);
        font-weight: 700;
    }
    .row {
        display: flex;
        align-items: center;
        gap: var(--au-s3);
        min-height: 56px;
        padding: var(--au-s2) var(--au-s4);
    }
    .sq {
        width: 36px;
        height: 36px;
        display: grid;
        place-items: center;
        flex-shrink: 0;
    }
    .row__main {
        flex: 1;
        min-width: 0;
    }
    .row__title {
        display: block;
        font-weight: 700;
    }
    .row__sub {
        display: block;
        color: var(--au-muted);
    }
</style>
