<script>
    import { Icon, Spinner } from '@sandbox/ui-kit';
    import { game } from '../state/game.svelte.js';
    import { formatLeft } from '../lib/format.js';

    /**
     * The square panel every game lives in: a title row (name and the mono
     * countdown), an optional quiet line (what to do now, plus live facts),
     * then the playfield. Countdown, bypass stages and the result cover the
     * playfield.
     *
     * left / total   ms remaining and the full limit; left = null hides the clock
     * running        false shows the clock muted (its phase has not started)
     * phases         a Phases instance; drives the stage and countdown covers
     * cover          false: no result cover, the title row shows the result instead
     * flush          playfield without padding (aim, tracking)
     * facts          snippet with live facts for the quiet line ("1 mistake left")
     */
    let {
        title,
        status,
        left = null,
        total = 0,
        running = true,
        width,
        phases = null,
        cover = true,
        flush = false,
        stageTexts = STAGE_TEXT,
        successText = 'Success',
        failText = 'Failed',
        caption,
        facts,
        children,
    } = $props();

    const result = $derived(game.result);
    const phase = $derived(phases ? phases.phase : 'play');
    const won = $derived(result === 'success' || result === 'perfect');
    const stageLabel = $derived(phases ? stageTexts[Math.min(phases.stage, stageTexts.length - 1)] : '');
    const reasonText = $derived(game.reason === 'time' ? 'Time ran out' : game.reason === 'cancelled' ? 'Game stopped' : game.reason);
    const stopped = $derived(!won && game.reason === 'cancelled');
    const resultText = $derived(won ? successText : stopped ? 'Game stopped' : failText);
    const resultCaption = $derived(won ? (result === 'perfect' ? 'Perfect run' : caption) : stopped ? null : (reasonText ?? caption));
    // The quiet line stays for the whole game so the panel never changes height between phases.
    const showLine = $derived(Boolean(status || facts));
</script>

<script module>
    export const STAGE_TEXT = ['Attempting security bypass', 'Bypass failed, reconfiguring', 'Manual verification required'];
</script>

<section class="gm-panel" style:width={width ? `${width}px` : undefined}>
    <header class="gm-head">
        <div class="gm-head__row">
            <h1 class="gm-title">{title}</h1>
            {#if result && !cover}
                <span class="gm-result-tag" class:is-ok={won} class:is-bad={!won}>{won ? successText : (reasonText ?? failText)}</span>
            {:else if left !== null}
                <span class="gm-time au-mono" class:is-idle={!running || phase !== 'play'}>{formatLeft(left)}</span>
            {/if}
        </div>
        {#if showLine}
            <div class="gm-head__line">
                {#if status}<span class="gm-status">{status}</span>{/if}
                {#if facts}<span class="gm-facts">{@render facts()}</span>{/if}
            </div>
        {/if}
    </header>
    <div class="gm-body" class:is-flush={flush}>
        {@render children?.()}

        {#if result && cover}
            <div class="gm-cover gm-cover--result">
                <div class="gm-result" class:is-ok={won} class:is-bad={!won}>
                    <Icon icon={won ? 'check' : 'x'} size={40} stroke={2} />
                    <div class="gm-result__text">{resultText}</div>
                    {#if resultCaption}<div class="gm-result__caption">{resultCaption}</div>{/if}
                </div>
            </div>
        {:else if phase === 'stage'}
            <div class="gm-cover">
                <div class="gm-stage-block">
                    {#if phases.stage === 0}
                        <Spinner size={32} label={stageLabel} />
                    {:else if phases.stage === 1 && stageTexts.length > 2}
                        <Icon icon="alert-triangle" size={32} color="var(--au-warning)" />
                    {/if}
                    <div class="gm-stage-block__text" class:is-warning={phases.stage === 1 && stageTexts.length > 2}>{stageLabel}</div>
                </div>
            </div>
        {:else if phase === 'countdown'}
            <div class="gm-cover">
                <div class="gm-count">
                    <div class="gm-count__label">{phases.count > 0 ? 'Starting in' : 'Start now'}</div>
                    <div class="gm-count__value au-mono">{phases.count > 0 ? phases.count : 'Go'}</div>
                </div>
            </div>
        {/if}
    </div>
</section>

<style>
    .gm-panel {
        position: relative;
        max-width: 96vw;
        background: var(--au-bg);
        border: 2px solid var(--au-ink);
        border-radius: 0;
        color: var(--au-text);
        font-size: var(--au-fs-xs);
        overflow: hidden;
    }

    .gm-head {
        padding: var(--au-s3) var(--au-s4);
        border-bottom: 1px solid var(--au-border);
    }

    .gm-head__row {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: var(--au-s4);
        white-space: nowrap;
    }

    .gm-title {
        margin: 0;
        font-size: var(--au-fs-sm);
        font-weight: 700;
        line-height: 1.4;
        letter-spacing: 0;
    }

    .gm-time {
        font-size: var(--au-fs-md);
        font-weight: 700;
        line-height: 1.2;
        color: var(--au-text);
    }

    .gm-time.is-idle {
        color: var(--au-muted);
    }

    .gm-head__line {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        justify-content: space-between;
        column-gap: var(--au-s4);
        margin-top: 2px;
        color: var(--au-muted);
        line-height: 1.4;
    }

    .gm-status,
    .gm-facts {
        white-space: nowrap;
    }

    .gm-facts {
        color: var(--au-text);
        font-variant-numeric: tabular-nums;
    }

    .gm-result-tag {
        padding: 2px var(--au-s2);
        font-weight: 700;
        line-height: 1.4;
    }

    .gm-result-tag.is-ok {
        color: var(--au-success);
        background: var(--au-success-bg);
    }

    .gm-result-tag.is-bad {
        color: var(--au-error);
        background: var(--au-error-bg);
    }

    .gm-body {
        position: relative;
        padding: var(--au-s4);
    }

    .gm-body.is-flush {
        padding: 0;
    }

    .gm-cover {
        position: absolute;
        inset: 0;
        z-index: 5;
        display: grid;
        place-items: center;
        background: var(--au-bg);
    }

    .gm-cover--result {
        background: transparent;
    }

    .gm-cover--result::before {
        content: '';
        position: absolute;
        inset: 0;
        background: var(--au-bg);
        opacity: 0.92;
    }

    .gm-result {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--au-s2);
        padding: 0 var(--au-s4);
        text-align: center;
    }

    .gm-result.is-ok {
        color: var(--au-success);
    }

    .gm-result.is-bad {
        color: var(--au-error);
    }

    .gm-result__text {
        font-size: var(--au-fs-md);
        font-weight: 700;
        line-height: var(--au-lh-heading);
    }

    .gm-result__caption {
        color: var(--au-text);
    }

    .gm-stage-block {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--au-s3);
        padding: 0 var(--au-s4);
        text-align: center;
    }

    .gm-stage-block__text {
        font-size: var(--au-fs-sm);
        font-weight: 700;
    }

    .gm-stage-block__text.is-warning {
        color: var(--au-warning);
    }

    .gm-count {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--au-s1);
    }

    .gm-count__label {
        color: var(--au-muted);
    }

    .gm-count__value {
        font-size: var(--au-fs-xxxl);
        font-weight: 700;
        line-height: 1;
    }
</style>
