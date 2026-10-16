<script>
    import { AppShell, Button, EmptyState, fetchNui, isEnvBrowser, onEscape } from '@sandbox/ui-kit';
    import { app, adminConsole, hide } from './state/app.svelte.js';
    import { nav, go } from './state/nav.svelte.js';
    import Dashboard from './components/Dashboard.svelte';
    import Players from './components/players/Players.svelte';
    import Self from './components/Self.svelte';
    import Vehicle from './components/vehicle/Vehicle.svelte';
    import Toasts from './components/shared/Toasts.svelte';

    /**
     * The frame is laid out for 1920x1080; larger screens zoom it by the same
     * ratio so 1440p and 4K keep the 1080p proportions.
     */
    let zoom = $state(1);
    $effect(() => {
        const fit = () => {
            const ratio = Math.min(window.innerWidth / 1920, window.innerHeight / 1080) || 1;
            zoom = Math.max(1, Math.round(ratio * 100) / 100);
        };
        fit();
        window.addEventListener('resize', fit);
        return () => window.removeEventListener('resize', fit);
    });

    const admin = $derived(adminConsole());
    const navItems = $derived([
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'players', label: 'Players' },
        { id: 'self', label: 'Self' },
        ...(admin ? [{ id: 'vehicle', label: 'Vehicle' }] : []),
    ]);
    // The Vehicle section belongs to the admin console only.
    const page = $derived(nav.page === 'vehicle' && !admin ? 'dashboard' : nav.page);

    const subline = $derived.by(() => {
        if (!app.user) return 'Waiting for your staff profile';
        const group = app.permissionName || app.permission || 'Staff';
        return `Signed in as ${app.user.Name ?? 'unknown'} (${group}, level ${app.level})`;
    });

    function close() {
        // Lua answers Close by sending APP_HIDE and dropping focus. In a plain browser there is no Lua.
        fetchNui('Close');
        if (isEnvBrowser()) hide();
    }

    // Escape closes through Lua unless a dialog is open: the Modal's own Escape handler takes it then.
    onEscape(() => {
        if (!app.visible) return false;
        if (document.querySelector('.au-modal')) return false;
        close();
        return true;
    });
</script>

{#if app.visible}
    <div class="stage">
        <div class="frame" style:zoom>
            <AppShell eyebrow="Staff" title="Admin console" {subline} navItems={app.user ? navItems : undefined} navActive={page} onnav={(id) => go(id)} padded={false}>
                {#snippet actions()}
                    <Button variant="secondary" icon="x" onclick={close}>Close console</Button>
                {/snippet}

                {#if !app.user}
                    <div class="page">
                        <EmptyState title="Your staff profile has not arrived yet">The server sends it once your character has spawned. Close the console and open it again in a few seconds.</EmptyState>
                    </div>
                {:else if page === 'players'}
                    <Players />
                {:else if page === 'self'}
                    <Self />
                {:else if page === 'vehicle'}
                    <Vehicle />
                {:else}
                    <Dashboard />
                {/if}
            </AppShell>
            <Toasts />
        </div>
    </div>
{/if}
