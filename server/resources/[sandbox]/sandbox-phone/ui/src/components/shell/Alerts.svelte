<script>
    import { Toast } from '@sandbox/ui-kit';
    import { notify } from '../../state/notify.svelte.js';

    /** Short feedback after an action ("Contact saved"), in the kit Toast look, above the bottom bar. */
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
        left: 8px;
        right: 8px;
        bottom: 52px;
        z-index: 35;
        display: flex;
        flex-direction: column;
        gap: var(--au-s2);
        pointer-events: none;
    }
    .alerts :global(.au-toast) {
        width: 100%;
    }
</style>
