<script>
    import { Spinner } from '@sandbox/ui-kit';
    import { app } from '../state/app.svelte.js';

    /** Full-screen wait while Lua or the server is working (LOADING_SHOW / LOADING_HIDE). */
    const message = $derived(app.loadingMessage ?? 'Loading');
</script>

{#if app.loading}
    <div class="loading" role="status" aria-live="polite" aria-busy="true">
        <Spinner size={40} label={message} />
        <div class="loading__title">{message}</div>
        <div class="loading__sub">This only takes a moment.</div>
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
        gap: 4px;
        animation: au-fade-in var(--au-normal) var(--au-ease);
    }
    /* The page behind stays faintly visible so the wait reads as "working on this". */
    .loading::before {
        content: '';
        position: absolute;
        inset: 0;
        z-index: -1;
        background: var(--au-bg);
        opacity: 0.92;
    }
    .loading :global(.au-spinner) {
        margin-bottom: 16px;
    }
    .loading__title {
        font-size: var(--au-fs-md);
        font-weight: 500;
    }
    .loading__sub {
        color: var(--au-muted);
        font-size: var(--au-fs-xs);
    }
</style>
