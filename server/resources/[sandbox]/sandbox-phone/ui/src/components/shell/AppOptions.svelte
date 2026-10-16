<script>
    import { Button } from '@sandbox/ui-kit';
    import Sheet from '../common/Sheet.svelte';
    import { data } from '../../state/data.svelte.js';
    import { openApp } from '../../state/router.svelte.js';
    import { changePlacement, moveOnHome, uninstall, MAX_DOCK } from '../../lib/appActions.js';

    /** Actions for one app: open, place on the home screen or dock, reorder, uninstall. */
    let { app = $bindable(null) } = $props();

    const home = $derived(data.player?.Apps?.home ?? []);
    const dock = $derived(data.player?.Apps?.dock ?? []);
    const onHome = $derived(app ? home.includes(app.name) : false);
    const inDock = $derived(app ? dock.includes(app.name) : false);
    const pos = $derived(app ? home.indexOf(app.name) : -1);

    function close() {
        app = null;
    }
    function run(fn) {
        const a = app;
        close();
        fn(a);
    }
</script>

<Sheet open={Boolean(app)} title={app?.label} onclose={close}>
    <div class="opts">
        <Button onclick={() => run((a) => openApp(a.name))}>Open {app?.label}</Button>
        {#if inDock}
            <Button variant="secondary" onclick={() => run((a) => changePlacement('remove', 'Dock', a.name))}>Remove from dock</Button>
        {:else}
            <Button variant="secondary" disabled={dock.length >= MAX_DOCK} onclick={() => run((a) => changePlacement('add', 'Dock', a.name))}>Add to dock</Button>
        {/if}
        {#if onHome}
            <Button variant="secondary" onclick={() => run((a) => changePlacement('remove', 'Home', a.name))}>Remove from home screen</Button>
            <div class="opts__pair">
                <Button variant="secondary" disabled={pos <= 0} onclick={() => run((a) => moveOnHome(a.name, -1))}>Move earlier</Button>
                <Button variant="secondary" disabled={pos < 0 || pos >= home.length - 1} onclick={() => run((a) => moveOnHome(a.name, 1))}>Move later</Button>
            </div>
        {:else}
            <Button variant="secondary" onclick={() => run((a) => changePlacement('add', 'Home', a.name))}>Add to home screen</Button>
        {/if}
        {#if app?.canUninstall}
            <Button variant="danger" onclick={() => run((a) => uninstall(a.name, a.label))}>Uninstall {app?.label}</Button>
        {/if}
        {#if !inDock && dock.length >= MAX_DOCK}
            <p class="opts__hint">The dock is full. Remove an app from it to add this one.</p>
        {/if}
    </div>
</Sheet>

<style>
    .opts {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: var(--au-s3);
        padding-bottom: var(--au-s3);
    }
    .opts__pair {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--au-s3);
    }
    .opts__hint {
        margin: 0;
        color: var(--au-muted);
    }
</style>
