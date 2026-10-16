<script>
    import { Toast } from '@sandbox/ui-kit';
    import { notify } from '../../state/notify.svelte.js';

    /** Short feedback after an action ("Team created"), bottom centre of the screen. */
</script>

{#if notify.alerts.length}
    <div class="alerts" aria-live="polite">
        {#each notify.alerts as a (a.id)}
            <Toast type={a.tone} message={a.text} />
        {/each}
    </div>
{/if}

<style>
    .alerts {
        position: absolute;
        left: 50%;
        bottom: 64px;
        z-index: 30;
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--au-s2);
        pointer-events: none;
    }
    .alerts :global(.au-toast) {
        width: auto;
        min-width: 280px;
        max-width: 560px;
    }
</style>
