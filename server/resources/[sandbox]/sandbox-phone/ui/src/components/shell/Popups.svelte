<script>
    import PhoneNotification from './PhoneNotification.svelte';
    import { notify, sweep, isPersistent } from '../../state/notify.svelte.js';
    import { phone } from '../../state/phone.svelte.js';
    import { parse } from '../../state/router.svelte.js';
    import { myApps } from '../../lib/apps.js';

    /**
     * Notifications at the top of the screen. While the phone is open inside an
     * app, persistent ones (calls, requests) wait for the home screen, as before;
     * the status bar still shows a call.
     */
    let { height = $bindable(0) } = $props();

    const apps = $derived(myApps());
    const onHome = $derived(parse().home);
    const shown = $derived(
        notify.list
            .filter((n) => n.show !== false)
            .map((n) => ({ n, app: n.app && typeof n.app === 'object' ? { ...n.app, name: n.app.name ?? null } : apps[n.app] }))
            .filter(({ app }) => Boolean(app))
            .filter(({ n }) => !(phone.visible && !onHome && isPersistent(n)))
            .sort((a, b) => b.n.received - a.n.received)
            .slice(0, 3),
    );

    $effect(() => {
        const t = setInterval(() => sweep(), 500);
        return () => clearInterval(t);
    });
</script>

<div class="popups" bind:clientHeight={height} aria-live="polite">
    {#each shown as item (item.n.id)}
        <PhoneNotification n={item.n} app={item.app} interactive={phone.visible} />
    {/each}
</div>

<style>
    .popups {
        position: absolute;
        top: 40px;
        left: 8px;
        right: 8px;
        z-index: 30;
        display: flex;
        flex-direction: column;
        gap: var(--au-s2);
        pointer-events: none;
    }
    .popups > :global(*) {
        pointer-events: auto;
    }
</style>
