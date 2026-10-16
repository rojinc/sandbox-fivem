<script>
    import { fade } from 'svelte/transition';
    import { fetchNui } from '@sandbox/ui-kit';
    import { ui } from '../../state/ui.svelte.js';

    /**
     * Timed action bar. Runs from START_PROGRESS for `duration` ms, then tells
     * Lua (Progress:Finish). Cancel/fail from Lua or finish from here linger
     * briefly with a state label before the bar hides itself.
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
    const tone = $derived(progress.state === 'finished' ? 'var(--au-success)' : settled ? 'var(--au-error)' : 'var(--au-light-action)');
    const text = $derived(
        progress.state === 'finished' ? 'Finished' : progress.state === 'failed' ? 'Failed' : progress.state === 'cancelled' ? 'Cancelled' : progress.label || 'Working…',
    );
    const seconds = $derived(progress.duration > 0 ? `${Math.max(0, Math.ceil((progress.duration - elapsed) / 1000))}s` : '');
</script>

{#if progress.showing}
    <div class="wrap">
        <div class="card" transition:fade={{ duration: 160 }} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin="0" aria-valuemax="100" aria-label={text}>
            <div class="card__meta">
                <span class="card__label au-truncate" style={settled ? `color:${tone}` : ''}>{text}</span>
                {#if !settled}<span class="card__time au-mono">{seconds}</span>{/if}
            </div>
            <div class="card__track">
                <div class="card__fill" style="width:{settled ? 100 : pct}%;background:{tone};transition:{settled ? 'width 200ms var(--au-ease), background 200ms' : 'none'}"></div>
            </div>
        </div>
    </div>
{/if}

<style>
    .wrap {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 17vh;
        display: flex;
        justify-content: center;
    }
    .card {
        width: 380px;
        padding: 10px 14px 12px;
        border-radius: var(--au-radius);
        background: var(--au-light-bg);
        color: var(--au-light-text);
        box-shadow: var(--au-shadow-1);
    }
    .card__meta {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 12px;
        margin-bottom: 8px;
    }
    .card__label {
        font-size: 14px;
        font-weight: 700;
    }
    .card__time {
        font-size: 12px;
        color: var(--au-light-muted);
        flex-shrink: 0;
    }
    .card__track {
        height: 8px;
        border-radius: var(--au-radius);
        background: var(--au-light-bg-alt-shade);
        overflow: hidden;
    }
    .card__fill {
        height: 100%;
        border-radius: var(--au-radius);
    }
</style>
