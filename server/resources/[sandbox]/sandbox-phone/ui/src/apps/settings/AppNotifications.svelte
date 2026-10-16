<script>
    import { Checkbox, PageAlert } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import AppPage from '../../components/common/AppPage.svelte';
    import { data, updateSetting } from '../../state/data.svelte.js';
    import { myApps } from '../../lib/apps.js';

    /** One switch per installed app. A muted app is stored as appNotifications[app] = true. */
    const s = $derived(data.player?.PhoneSettings ?? {});
    const apps = $derived(myApps());
    const list = $derived(
        (data.player?.Apps?.installed ?? [])
            .map((n) => apps[n])
            .filter(Boolean)
            .sort((a, b) => String(a.label).localeCompare(String(b.label))),
    );

    function toggle(name, on) {
        const muted = { ...(s.appNotifications ?? {}) };
        if (on) delete muted[name];
        else muted[name] = true;
        updateSetting('appNotifications', muted, fetchNui);
    }
</script>

<AppPage title="Notifications by app">
    {#if !s.notifications}
        <div class="ph-pad">
            <PageAlert type="warning" title="Notifications are off">Turn on Show notifications in Settings to choose them app by app.</PageAlert>
        </div>
    {/if}
    <ul class="ph-list">
        {#each list as app (app.name)}
            <li class="row">
                <Checkbox
                    checked={!s.appNotifications?.[app.name]}
                    disabled={!s.notifications}
                    label="{app.label} notifications"
                    onchange={(e) => toggle(app.name, e.currentTarget.checked)}
                />
            </li>
        {/each}
    </ul>
</AppPage>

<style>
    .row {
        padding: var(--au-s2) var(--au-s4);
    }
</style>
