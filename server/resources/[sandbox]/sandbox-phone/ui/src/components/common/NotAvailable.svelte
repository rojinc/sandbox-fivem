<script>
    import { Button } from '@sandbox/ui-kit';
    import AppPage from './AppPage.svelte';
    import { home } from '../../state/router.svelte.js';

    /** Placeholder for an app whose screens are not built yet, or (missing) one you cannot open. */
    let { app, missing = false } = $props();
</script>

<AppPage title={missing ? 'App' : (app?.label ?? 'App')}>
    <div class="ph-pad">
        {#if missing}
            <h2 class="na__title">You cannot open this app</h2>
            <p>It is not installed, or you no longer have access to it. Install apps from App Store.</p>
        {:else}
            <h2 class="na__title">{app?.label ?? 'This app'} is not available yet</h2>
            <p>This app has not moved to the new phone yet. Your data in it is safe and will show here once it does.</p>
        {/if}
        <Button variant="secondary" onclick={home}>Go to home screen</Button>
    </div>
</AppPage>

<style>
    .na__title {
        font-size: var(--au-fs-sm);
        margin-bottom: var(--au-s2);
    }
    p {
        font-size: var(--au-fs-xs);
    }
</style>
