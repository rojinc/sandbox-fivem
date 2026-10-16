<script>
    import { Icon, Spinner } from '@sandbox/ui-kit';
    import { game } from '../state/game.svelte.js';
    import { formatLeft } from '../lib/format.js';

    /**
     * The panel every game lives in: a title row (name, a muted phase word,
     * optional readouts, the mono countdown) over the playfield. Countdown,
     * bypass stages and the result cover the playfield.
     *
     * left / total   ms remaining and the full limit; left = null hides the clock
     * running        false shows the clock dimmed (its phase has not started)
     * phases         a Phases instance; drives the stage and countdown covers
     * cover          false: no result cover, the title row shows the result instead
     * flush          playfield without padding (aim, tracking)
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
        stageIcon = 'shield-lock',
        stageTexts = STAGE_TEXT,
        successText = 'Success',
        failText = 'Failed',
        caption,
        meta,
        children,
    } = $props();

    const result = $derived(game.result);
    const phase = $derived(phases ? phases.phase : 'play');
    const low = $derived(running && total > 0 && left !== null && left / total <= 0.25);
    const stageLabel = $derived(phases ? stageTexts[Math.min(phases.stage, stageTexts.length - 1)] : '');
    const won = $derived(result === 'success' || result === 'perfect');
</script>

<script module>
    export const STAGE_TEXT = ['Attempting security bypass', 'Bypass failed, reconfiguring', 'Manual verification required'];
</script>

<section class="gm-panel" style:width={width ? `${width}px` : undefined}>
    <header class="gm-head">
        <h1 class="gm-title">{title}</h1>
        {#if status && phase === 'play' && !result}<span class="gm-status">{status}</span>{/if}
        <span class="gm-fill"></span>
        {#if phase === 'play'}{@render meta?.()}{/if}
        {#if result && !cover}
            <span class="gm-result-tag" class:is-ok={won} class:is-bad={!won}>
                <Icon icon={won ? 'check' : 'x'} stroke={2.25} />{won ? successText : failText}
            </span>
        {:else if left !== null}
            <span class="gm-time au-mono" class:is-idle={!running || phase !== 'play'} class:is-low={low && !result}>{formatLeft(left)}</span>
        {/if}
    </header>
    <div class="gm-body" class:is-flush={flush}>
        {@render children?.()}

        {#if result && cover}
            <div class="gm-cover gm-cover--result">
                <div class="gm-result" class:is-ok={won} class:is-bad={!won}>
                    <Icon icon={won ? 'circle-check' : 'circle-x'} size={40} stroke={1.5} />
                    <div class="gm-result__text">{won ? successText : failText}</div>
                    {#if caption}<div class="gm-result__caption">{caption}</div>{/if}
                    {#if result === 'perfect'}<div class="gm-result__caption">Perfect run</div>{/if}
                </div>
            </div>
        {:else if phase === 'stage'}
            <div class="gm-cover">
                {#key phases.stage}
                    <div class="gm-stage-block">
                        {#if phases.stage === 0}
                            <Spinner size={32} label={stageLabel} />
                        {:else if phases.stage === 1 && stageTexts.length > 2}
                            <Icon icon="alert-triangle" size={36} color="var(--au-warning)" />
                        {:else}
                            <Icon icon={stageIcon} size={36} color="var(--au-action)" />
                        {/if}
                        <div class="gm-stage-block__text">{stageLabel}</div>
                    </div>
                {/key}
            </div>
        {:else if phase === 'countdown'}
            <div class="gm-cover">
                {#key phases.count}
                    <div class="gm-count">
                        <div class="gm-count__label">{phases.count > 0 ? 'Starting in' : 'Start'}</div>
                        <div class="gm-count__value au-mono">{phases.count > 0 ? phases.count : 'Go'}</div>
                    </div>
                {/key}
            </div>
        {/if}
    </div>
</section>

<style>
    .gm-panel {
        position: relative;
        max-width: 96vw;
        background: var(--au-bg);
        border: 1px solid var(--au-border);
        border-radius: var(--au-radius-lg);
        box-shadow: var(--au-shadow-2);
        color: var(--au-text);
        overflow: hidden;
    }

    .gm-head {
        display: flex;
        align-items: center;
        gap: var(--au-s3);
        height: 44px;
        padding: 0 var(--au-s4);
        border-bottom: 1px solid var(--au-border);
        white-space: nowrap;
    }

    .gm-title {
        margin: 0;
        font-size: var(--au-fs-xs);
        font-weight: 500;
        line-height: 1;
    }

    .gm-status {
        font-size: var(--au-fs-xs);
        color: var(--au-muted);
        line-height: 1;
    }

    .gm-fill {
        flex: 1;
    }

    .gm-time {
        min-width: 4ch;
        text-align: right;
        font-size: var(--au-fs-sm);
        font-weight: 500;
        line-height: 1;
        color: var(--au-text);
        transition: color var(--au-fast) var(--au-ease);
    }

    .gm-time.is-idle {
        color: var(--au-hint);
    }

    .gm-time.is-low {
        color: var(--au-error);
    }

    .gm-result-tag {
        display: inline-flex;
        align-items: center;
        gap: var(--au-s1);
        height: 24px;
        padding: 0 var(--au-s2);
        border-radius: var(--au-radius);
        font-size: var(--au-fs-xxs);
        font-weight: 500;
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
        animation: au-fade-in var(--au-fast) var(--au-ease);
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
        animation: au-rise-in var(--au-normal) var(--au-ease);
    }

    .gm-result.is-ok {
        color: var(--au-success);
    }

    .gm-result.is-bad {
        color: var(--au-error);
    }

    .gm-result__text {
        font-size: var(--au-fs-md);
        font-weight: 500;
        line-height: var(--au-lh-heading);
    }

    .gm-result__caption {
        margin-top: calc(-1 * var(--au-s1));
        font-size: var(--au-fs-xs);
        color: var(--au-muted);
    }

    .gm-stage-block {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--au-s3);
        padding: 0 var(--au-s4);
        text-align: center;
        animation: au-rise-in var(--au-normal) var(--au-ease);
    }

    .gm-stage-block__text {
        font-size: var(--au-fs-sm);
        color: var(--au-muted);
    }

    .gm-count {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--au-s1);
        animation: au-rise-in var(--au-normal) var(--au-ease);
    }

    .gm-count__label {
        font-size: var(--au-fs-xs);
        color: var(--au-muted);
    }

    .gm-count__value {
        font-size: var(--au-fs-xxxl);
        font-weight: 500;
        line-height: 1;
        color: var(--au-text);
    }
</style>
