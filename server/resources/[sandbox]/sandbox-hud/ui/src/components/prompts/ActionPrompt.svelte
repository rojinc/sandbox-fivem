<script>
    import { scale } from 'svelte/transition';
    import { Icon, RichText } from '@sandbox/ui-kit';
    import { ui } from '../../state/ui.svelte.js';

    /** The newest key prompt ("{key}E{/key} Open door"), bottom centre. */
    const action = $derived(ui.actions.length ? ui.actions[ui.actions.length - 1] : null);
</script>

{#if action}
    <div class="wrap">
        {#key action.id}
            <div class="prompt" transition:scale={{ duration: 160, start: 0.92 }}>
                <span class="prompt__icon"><Icon icon="circle-info" /></span>
                <RichText text={action.message ?? ''} />
            </div>
        {/key}
    </div>
{/if}

<style>
    .wrap {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 23vh;
        display: flex;
        justify-content: center;
    }
    .prompt {
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 560px;
        padding: 8px 16px 8px 12px;
        border-left: 6px solid var(--au-light-action);
        border-radius: var(--au-radius);
        background: var(--au-light-bg);
        color: var(--au-light-text);
        font-size: 15px;
        font-weight: 500;
        box-shadow: var(--au-shadow-1);
    }
    .prompt__icon {
        color: var(--au-light-action);
        font-size: 14px;
        display: flex;
    }
</style>
