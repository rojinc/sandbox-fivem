<script>
    import NotificationToast from './NotificationToast.svelte';
    import { notify, needsAnswer, hideNotification } from '../../state/notify.svelte.js';
    import { notificationApp } from '../../lib/apps.js';
    import { openApp } from '../../state/windows.svelte.js';

    /**
     * Notifications while the laptop is open: bottom right of the screen above
     * the taskbar, newest first, at most 4. Requests that need an answer open as a dialog instead.
     */
    const shown = $derived(
        notify.list
            .filter((n) => !needsAnswer(n))
            .map((n) => ({ n, app: notificationApp(n) }))
            .filter((x) => x.app)
            .slice(0, 4),
    );

    function open(n, app) {
        if (app.name) openApp(app.name);
        if (Number(n.duration) !== -1) hideNotification(n._id);
    }
</script>

{#if shown.length}
    <div class="stack" aria-live="polite">
        {#each shown as { n, app } (n._id)}
            <NotificationToast {n} {app} onopen={n.action?.view !== undefined && app.name ? () => open(n, app) : null} />
        {/each}
    </div>
{/if}

<style>
    .stack {
        position: absolute;
        bottom: 64px;
        right: 32px;
        z-index: 20;
        display: flex;
        flex-direction: column;
        gap: var(--au-s2);
    }
</style>
