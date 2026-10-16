<script>
    /**
     * A bare progress line with an optional label and value above it. No
     * panel: place it straight on the page or the world (`overworld` adds a
     * text shadow for that). size: sm | md | lg.
     */
    let { value = 0, max = 100, label, showValue = false, tone = 'action', color, size = 'md', indeterminate = false, overworld = false, class: className = '' } = $props();

    const pct = $derived(Math.max(0, Math.min(100, (Number(value) / (Number(max) || 1)) * 100)));
    const TONES = { action: 'var(--au-action)', success: 'var(--au-success)', warning: 'var(--au-warning)', error: 'var(--au-error)', info: 'var(--au-info)', white: '#fff' };
</script>

<div class="au-progress au-progress--{size} {className}" class:au-overworld={overworld} role="progressbar" aria-valuemin="0" aria-valuemax={max} aria-valuenow={indeterminate ? undefined : value} aria-label={label}>
    {#if label || showValue}
        <div class="au-progress__meta">
            {#if label}<span class="au-progress__label">{label}</span>{/if}
            {#if showValue}<span class="au-progress__value au-mono">{Math.round(pct)}%</span>{/if}
        </div>
    {/if}
    <div class="au-progress__track">
        <div class="au-progress__fill" class:is-indeterminate={indeterminate} style="width:{indeterminate ? 35 : pct}%;background:{color ?? TONES[tone] ?? TONES.action}"></div>
    </div>
</div>

<style>
    .au-progress__meta {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: var(--au-s3);
        margin-bottom: 6px;
        font-size: var(--au-fs-xs);
    }
    .au-progress__label {
        font-weight: 700;
    }
    .au-progress__value {
        color: var(--au-muted);
        font-variant-numeric: tabular-nums;
    }
    .au-overworld .au-progress__value {
        color: rgba(255, 255, 255, 0.8);
    }
    .au-progress__track {
        height: 6px;
        background: rgba(255, 255, 255, 0.12);
        overflow: hidden;
    }
    .au-progress--sm .au-progress__track {
        height: 4px;
    }
    .au-progress--lg .au-progress__track {
        height: 8px;
    }
    .au-progress__fill {
        height: 100%;
        transition: width var(--au-normal) var(--au-ease);
    }
    .au-progress__fill.is-indeterminate {
        animation: au-progress-slide 1.2s var(--au-ease) infinite;
    }
    @keyframes au-progress-slide {
        from {
            transform: translateX(-100%);
        }
        to {
            transform: translateX(300%);
        }
    }
</style>
