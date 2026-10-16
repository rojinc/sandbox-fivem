<script>
    import { fade } from 'svelte/transition';
    import { fetchNui } from '@sandbox/ui-kit';
    import { ui } from '../../state/ui.svelte.js';

    /**
     * Timed action bar, drawn straight on the world (no panel). Runs from
     * START_PROGRESS for `duration` ms, then tells Lua (Progress:Finish).
     * Cancel/fail from Lua or finish from here linger briefly, then hide.
     */
    const LINGER_MS = 1200;
    const progress = $derived(ui.progress);
    let elapsed = $state(0);
    let reported = 0;

    $effect(() => {
        if (!progress.showing || progress.state !== 'running') return undefined;
        const start = progress.startTime;
        let raf = 0;
        const tick = () => {
            elapsed = Date.now() - start;
            if (progress.duration > 0 && elapsed >= progress.duration) {
                if (reported !== start) {
                    reported = start;
                    ui.progress.state = 'finished';
                    fetchNui('Progress:Finish');
                }
                return;
            }
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    });

    $effect(() => {
        if (!progress.showing || progress.state === 'running') return undefined;
        const t = setTimeout(() => (ui.progress.showing = false), LINGER_MS);
        return () => clearTimeout(t);
    });

    const settled = $derived(progress.state !== 'running');
    const pct = $derived(progress.duration > 0 ? Math.min(100, (elapsed / progress.duration) * 100) : 0);
    const tone = $derived(progress.state === 'finished' ? 'var(--hud-green)' : settled ? 'var(--hud-red)' : '#fff');
    const text = $derived(
        progress.state === 'finished' ? 'Done' : progress.state === 'failed' ? 'Failed' : progress.state === 'cancelled' ? 'Cancelled' : progress.label || 'Working',
    );
    const seconds = $derived(progress.duration > 0 ? `${Math.max(0, Math.ceil((progress.duration - elapsed) / 1000))}s` : '');
</script>

{#if progress.showing}
    <div class="wrap">
        <div class="bar au-overworld" transition:fade={{ duration: 160 }} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin="0" aria-valuemax="100" aria-label={text}>
            <div class="bar__meta">
                <span class="bar__label au-truncate" style={settled ? `color:${tone}` : ''}>{text}</span>
                {#if !settled}<span class="bar__time au-mono">{seconds}</span>{/if}
            </div>
            <div class="bar__track">
                <div class="bar__fill" style="width:{settled ? 100 : pct}%;background:{tone};transition:{settled ? 'width 200ms var(--au-ease), background 200ms' : 'none'}"></div>
            </div>
        </div>
    </div>
{/if}

<style>
    .wrap {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 15vh;
        display: flex;
        justify-content: center;
    }
    .bar {
        width: 340px;
    }
    .bar__meta {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 12px;
        margin-bottom: 7px;
    }
    .bar__label {
        font-size: 16px;
        font-weight: 700;
    }
    .bar__time {
        font-size: 16px;
        color: rgba(255, 255, 255, 0.75);
        flex-shrink: 0;
    }
    .bar__track {
        height: 6px;
        background: rgba(0, 0, 0, 0.45);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
        overflow: hidden;
    }
    .bar__fill {
        height: 100%;
    }
</style>
