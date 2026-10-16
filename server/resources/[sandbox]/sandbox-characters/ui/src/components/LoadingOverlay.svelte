<script>
    import { Spinner } from '@sandbox/ui-kit';
    import { app, STATE_CHARACTERS, STATE_SPAWN } from '../state/app.svelte.js';

    /**
     * LOADING_SHOW / LOADING_HIDE. While the docked panel is up the wait
     * covers only the panel, so the scene stays visible. Otherwise (welcome,
     * first load) it is a spinner and text straight on the world.
     */
    const message = $derived(app.loadingMessage ?? 'Loading');
    const docked = $derived(app.state === STATE_CHARACTERS || app.state === STATE_SPAWN);
</script>

{#if app.loading}
    <div class="loading" class:loading--docked={docked} role="status" aria-live="polite" aria-busy="true">
        <Spinner size={40} label={message} />
        <div class="loading__title" class:au-overworld={!docked}>{message}</div>
    </div>
{/if}

<style>
    .loading {
        position: absolute;
        inset: 0;
        z-index: 1100;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
    }
    /* Over the panel only, with the panel's own surface so its content does not show through. */
    .loading--docked {
        left: auto;
        width: 720px;
        isolation: isolate;
    }
    .loading--docked::before {
        content: '';
        position: absolute;
        inset: 0;
        z-index: -1;
        background: var(--au-bg);
        opacity: 0.94;
    }
    /* On the world the arc is ink so it reads on any scene (blue is for links). */
    .loading:not(.loading--docked) :global(.au-spinner) {
        border-top-color: var(--au-ink);
    }
    .loading__title {
        font-size: var(--au-fs-md);
        font-weight: 700;
    }
</style>
