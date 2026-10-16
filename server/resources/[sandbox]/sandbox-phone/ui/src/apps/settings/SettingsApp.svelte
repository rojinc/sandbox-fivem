<script>
    import SettingsHome from './SettingsHome.svelte';
    import Profile from './Profile.svelte';
    import AppNotifications from './AppNotifications.svelte';
    import Sounds from './Sounds.svelte';
    import Wallpaper from './Wallpaper.svelte';

    /** Settings: root list, profile, per-app notifications, sounds, wallpaper. Paths match the old app. */
    let { app, segs = [] } = $props();
</script>

{#if segs[0] === 'profile'}
    <Profile />
{:else if segs[0] === 'app_notifs'}
    <AppNotifications />
{:else if segs[0] === 'sounds'}
    <Sounds />
{:else if segs[0] === 'wallpaper'}
    <Wallpaper />
{:else}
    <SettingsHome {app} />
{/if}
