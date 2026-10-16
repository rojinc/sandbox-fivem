<script>
    import { Button } from '@sandbox/ui-kit';
    import AppPage from './AppPage.svelte';
    import { home } from '../../state/router.svelte.js';

    /** Placeholder for an app whose screens are not built on this phone yet. */
    let { app } = $props();
</script>

<AppPage title={app?.label ?? 'App'}>
    <div class="ph-pad">
        <h2 class="na__title">{app?.label ?? 'This app'} is not available yet</h2>
        <p>This app has not moved to the new phone yet. Your data in it is safe and will show here once it does.</p>
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
