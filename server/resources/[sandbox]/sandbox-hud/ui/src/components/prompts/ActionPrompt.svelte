<script>
    import { fade } from 'svelte/transition';
    import { RichText } from '@sandbox/ui-kit';
    import { ui } from '../../state/ui.svelte.js';

    /** The newest key prompt ("{key}E{/key} Open door"), as text on the world. */
    const action = $derived(ui.actions.length ? ui.actions[ui.actions.length - 1] : null);
</script>

{#if action}
    <div class="wrap">
        {#key action.id}
            <div class="prompt au-overworld" transition:fade={{ duration: 140 }}>
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
        max-width: 560px;
        font-size: 17px;
        font-weight: 500;
        text-align: center;
    }
    .prompt :global(.au-kbd) {
        min-width: 1.7em;
        margin: 0 0.35em 0 0;
        background: rgba(24, 26, 29, 0.9);
        border-color: rgba(255, 255, 255, 0.35);
        color: #fff;
        text-shadow: none;
        font-weight: 700;
    }
</style>
