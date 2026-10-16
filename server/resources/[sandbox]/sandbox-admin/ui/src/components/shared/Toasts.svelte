<script>
    import { Toast } from '@sandbox/ui-kit';
    import { toasts, dismiss } from '../../state/toasts.svelte.js';
</script>

<div class="toasts" role="status" aria-live="polite">
    {#each toasts.items as t (t.id)}
        <button type="button" class="toast" onclick={() => dismiss(t.id)} aria-label="Dismiss message">
            <Toast type={t.type} message={t.message} />
        </button>
    {/each}
</div>

<style>
    .toasts {
        position: absolute;
        right: var(--au-s6);
        bottom: var(--au-s6);
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: var(--au-s2);
        z-index: 50;
        pointer-events: none;
    }
    .toast {
        pointer-events: auto;
        padding: 0;
        border: 0;
        background: none;
        text-align: left;
        cursor: pointer;
    }
</style>
