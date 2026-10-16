<script>
    import { Spinner } from '@sandbox/ui-kit';
    import { app } from '../state/app.svelte.js';

    /** Full-screen wait while Lua or the server is working (LOADING_SHOW / LOADING_HIDE). */
    const message = $derived(app.loadingMessage ?? 'Loading');
</script>

{#if app.loading}
    <div class="loading" role="status" aria-live="polite" aria-busy="true">
        <div class="loading__panel au-page">
            <Spinner size={48} label={message} />
            <div class="loading__text">
                <h2 class="loading__title">{message}</h2>
                <p class="au-muted">This only takes a moment.</p>
            </div>
        </div>
    </div>
{/if}

<style>
    .loading {
        position: fixed;
        inset: 0;
        z-index: 1100;
        display: grid;
        place-items: center;
        background: rgba(10, 20, 24, 0.55);
        animation: au-fade-in var(--au-normal) var(--au-ease);
    }
    .loading__panel {
        display: flex;
        align-items: center;
        gap: 24px;
        width: 480px;
        padding: 28px 32px;
    }
    .loading__text {
        min-width: 0;
    }
    .loading__title {
        margin-bottom: 4px;
    }
    .loading__text p {
        margin: 0;
    }
</style>
