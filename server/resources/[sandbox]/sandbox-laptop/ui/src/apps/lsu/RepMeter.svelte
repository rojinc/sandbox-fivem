<script>
    import { ProgressBar } from '@sandbox/ui-kit';
    import { formatNumber } from '../../lib/format.js';

    /**
     * One reputation: current rank, progress to the next rank, and the points.
     * rep = { id, label, value, current { level, label, value }, next { level, label, value } }
     * `prefix` names the rank ("Class C" for boosting, "Rank 3" uses the label as is).
     */
    let { rep, prefix = '' } = $props();

    const value = $derived(Number(rep?.value) || 0);
    const from = $derived(Number(rep?.current?.value) || 0);
    const to = $derived(Number(rep?.next?.value) || 0);
    const maxed = $derived(!rep?.next?.label || rep?.next?.label === 'Done!' || to <= from);
    const pct = $derived(maxed ? 100 : Math.max(0, Math.min(100, ((value - from) / (to - from)) * 100)));
    const rank = $derived(rep?.current?.label ? `${prefix}${rep.current.label}` : 'No rank yet');
</script>

<div class="meter">
    <div class="meter__rank">{rank}</div>
    <ProgressBar value={pct} max={100} color="var(--au-ink)" label="{rep?.label ?? 'Reputation'} progress" />
    <div class="meter__text au-muted">
        {#if maxed}
            {formatNumber(value)} points. This is the top rank.
        {:else}
            {formatNumber(value)} of {formatNumber(to)} points for {prefix}{rep.next.label}.
        {/if}
    </div>
</div>

<style>
    .meter__rank {
        font-weight: 700;
        font-size: var(--au-fs-sm);
        margin-bottom: var(--au-s2);
    }
    .meter :global(.au-progress__meta) {
        display: none;
    }
    .meter__text {
        margin-top: var(--au-s2);
        font-variant-numeric: tabular-nums;
    }
</style>
