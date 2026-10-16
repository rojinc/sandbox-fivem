<script>
    import NotificationToast from './NotificationToast.svelte';
    import { notify } from '../../state/notify.svelte.js';
    import { notificationApp } from '../../lib/apps.js';
    import { zoom } from '../../state/env.svelte.js';

    /**
     * Notifications while the laptop is closed: bottom right of the game
     * screen, newest first, at most 5. They cannot be clicked (the game has
     * focus); requests are answered once the laptop is open.
     */
    const shown = $derived(
        notify.list
            .map((n) => ({ n, app: notificationApp(n) }))
            .filter((x) => x.app)
            .slice(0, 5),
    );
    const k = $derived(zoom());
</script>

{#if shown.length}
    <div class="corner" style="transform:scale({k})" aria-live="polite">
        {#each shown as { n, app } (n._id)}
            <NotificationToast {n} {app} />
        {/each}
    </div>
{/if}

<style>
    .corner {
        position: fixed;
        right: 24px;
        bottom: 24px;
        z-index: 20;
        display: flex;
        flex-direction: column;
        gap: var(--au-s2);
        transform-origin: 100% 100%;
        pointer-events: none;
    }
</style>
