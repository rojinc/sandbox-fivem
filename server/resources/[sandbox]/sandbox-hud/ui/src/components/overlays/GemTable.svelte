<script>
    import { fade } from 'svelte/transition';
    import { ui } from '../../state/ui.svelte.js';

    /** Cinematic letterbox shown while appraising a gem (Hud.GemTable:Open quality). */
    const g = $derived(ui.gemTable);
</script>

{#if g.showing}
    <div class="letterbox" transition:fade={{ duration: 200 }}>
        <div class="bar bar--top"><span class="title">SAGMA Gem Table</span></div>
        <div class="bar bar--bottom">
            <span class="label">Appraised quality</span>
            <span class="value au-mono">{g.info ?? '--'}%</span>
        </div>
    </div>
{/if}

<style>
    .letterbox {
        position: absolute;
        inset: 0;
    }
    .bar {
        position: absolute;
        left: 0;
        right: 0;
        height: 140px;
        background: #000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        color: #fff;
    }
    .bar--top {
        top: 0;
    }
    .bar--bottom {
        bottom: 0;
    }
    .title {
        font-size: 28px;
        font-weight: 700;
        letter-spacing: 0.04em;
    }
    .label {
        font-size: 12px;
        color: var(--au-dark-muted);
        text-transform: uppercase;
        letter-spacing: 0.08em;
    }
    .value {
        font-size: 34px;
        font-weight: 700;
        color: var(--au-dark-action);
    }
</style>
