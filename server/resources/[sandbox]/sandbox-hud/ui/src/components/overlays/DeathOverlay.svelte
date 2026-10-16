<script>
    import { fade } from 'svelte/transition';
    import { Kbd, formatClock } from '@sandbox/ui-kit';
    import { status } from '../../state/status.svelte.js';
    import { ui } from '../../state/ui.svelte.js';
    import { clock } from '../../lib/clock.svelte.js';

    /** Red vignette while dead plus the release/respawn instructions. */
    const MEDICAL_DELAY_MS = 2 * 60 * 1000;
    const d = $derived(ui.death);
    const canRelease = $derived(clock.now >= d.releaseTimer);
    const medicalAt = $derived(d.deathTime + MEDICAL_DELAY_MS);
    const left = (to) => formatClock((to - clock.now) / 1000);
</script>

{#if status.isDead && !ui.blindfolded}
    <div class="vignette" transition:fade={{ duration: 400 }}></div>
{/if}

{#if d.showing && d.type && d.releaseTimer}
    <div class="text">
        {#if d.type === 'knockout'}
            {#if d.releasing}
                <div class="line">Standing up…</div>
            {:else if canRelease}
                <div class="line">Press <Kbd>{d.key}</Kbd> to stand up</div>
            {:else}
                <div class="line">Unconscious. You can stand up in <span class="count au-mono">{left(d.releaseTimer)}</span></div>
            {/if}
        {:else if d.type === 'death'}
            {#if d.releasing}
                <div class="line">Respawning…</div>
            {:else if canRelease}
                <div class="line">Press <Kbd>{d.key}</Kbd> to respawn (${d.medicalPrice})</div>
            {:else}
                <div class="line">Downed. Respawn available in <span class="count au-mono">{left(d.releaseTimer)}</span></div>
            {/if}
            {#if !d.releasing}
                {#if clock.now < medicalAt}
                    <div class="sub">Medical assistance can be called in <span class="count au-mono">{left(medicalAt)}</span></div>
                {:else}
                    <div class="sub"><Kbd>{d.helpKey}</Kbd> Call for medical assistance</div>
                {/if}
            {/if}
        {:else if d.type === 'hospital'}
            {#if d.releasing}
                <div class="line">Getting up…</div>
            {:else if canRelease}
                <div class="line">Press <Kbd>{d.key}</Kbd> to get out of bed</div>
            {:else}
                <div class="line">Being treated <span class="count au-mono">{left(d.releaseTimer)}</span></div>
            {/if}
        {:else if d.type === 'hospital_rp'}
            <div class="line">Press <Kbd>{d.key}</Kbd> to get out of bed</div>
        {/if}
    </div>
{/if}

<style>
    .vignette {
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, rgba(60, 8, 12, 0.15) 0%, rgba(40, 4, 8, 0.6) 100%);
    }
    .text {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 150px;
        text-align: center;
        color: #fff;
        text-shadow: var(--hud-shadow);
    }
    .line {
        font-size: 20px;
        font-weight: 500;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        gap: 6px;
    }
    .sub {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.8);
        margin-top: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
    }
    .count {
        color: var(--au-dark-action);
        font-weight: 700;
    }
</style>
