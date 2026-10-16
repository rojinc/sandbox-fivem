<script>
    /** Linear progress. size: sm | md | lg; `tone` picks a system colour, `color` overrides. */
    let { value = 0, max = 100, label, showValue = false, tone = 'action', color, size = 'md', indeterminate = false, class: className = '' } = $props();

    const pct = $derived(Math.max(0, Math.min(100, (Number(value) / (Number(max) || 1)) * 100)));
    const TONES = { action: 'var(--au-action)', success: 'var(--au-success)', warning: 'var(--au-warning)', error: 'var(--au-error)', info: 'var(--au-info)' };
</script>

<div
    class="au-progress au-progress--{size} {className}"
    role="progressbar"
    aria-valuemin="0"
    aria-valuemax={max}
    aria-valuenow={indeterminate ? undefined : value}
    aria-label={label}
>
    {#if label || showValue}
        <div class="au-progress__meta">
            {#if label}<span class="au-progress__label">{label}</span>{/if}
            {#if showValue}<span class="au-progress__value au-mono">{Math.round(pct)}%</span>{/if}
        </div>
    {/if}
    <div class="au-progress__track">
        <div
            class="au-progress__fill"
            class:au-progress__fill--indeterminate={indeterminate}
            style="width:{indeterminate ? 40 : pct}%;background:{color ?? TONES[tone] ?? TONES.action}"
        ></div>
    </div>
</div>

<style>
    .au-progress__meta {
        display: flex;
        justify-content: space-between;
        gap: var(--au-s3);
        font-size: var(--au-fs-xs);
        margin-bottom: var(--au-s1);
    }
    .au-progress__label {
        font-weight: 700;
    }
    .au-progress__track {
        height: 8px;
        background: var(--au-bg-alt-shade);
        border-radius: var(--au-radius);
        overflow: hidden;
    }
    .au-progress--sm .au-progress__track {
        height: 4px;
    }
    .au-progress--lg .au-progress__track {
        height: 16px;
    }
    .au-progress__fill {
        height: 100%;
        border-radius: var(--au-radius);
        transition: width var(--au-normal) var(--au-ease);
    }
    .au-progress__fill--indeterminate {
        animation: au-progress-slide 1.2s var(--au-ease) infinite;
    }
    @keyframes au-progress-slide {
        from {
            transform: translateX(-100%);
        }
        to {
            transform: translateX(250%);
        }
    }
</style>
