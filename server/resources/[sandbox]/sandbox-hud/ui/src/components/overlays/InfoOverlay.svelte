<script>
    import { fly } from 'svelte/transition';
    import { RichText } from '@sandbox/ui-kit';
    import { ui } from '../../state/ui.svelte.js';

    /** Top-centre information card (InfoOverlay:Show label, description). */
    const o = $derived(ui.infoOverlay);
</script>

{#if o.showing}
    <div class="wrap">
        <div class="card" transition:fly={{ y: -16, duration: 200 }}>
            {#if o.info?.label}<h3 class="card__title">{o.info.label}</h3>{/if}
            {#if o.info?.description}<div class="card__body"><RichText text={o.info.description} tag="div" /></div>{/if}
        </div>
    </div>
{/if}

<style>
    .wrap {
        position: absolute;
        top: 8vh;
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
    }
    .card {
        width: 440px;
        padding: 14px 18px;
        border-left: 6px solid var(--au-light-action);
        border-radius: var(--au-radius);
        background: var(--au-light-bg);
        color: var(--au-light-text);
        box-shadow: var(--au-shadow-1);
    }
    .card__title {
        font-size: 18px;
        margin-bottom: 4px;
    }
    .card__body {
        font-size: 14px;
        color: var(--au-light-muted);
        line-height: 1.5;
    }
</style>
