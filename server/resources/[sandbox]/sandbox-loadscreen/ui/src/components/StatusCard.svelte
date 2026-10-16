<script>
    import { ProgressBar, Tag } from '@sandbox/ui-kit';
    import { loading } from '../state/loading.svelte.js';
    import { handover } from '../state/handover.svelte.js';
    import Checklist from './Checklist.svelte';

    const pct = $derived(Math.round(loading.fraction * 100));
    const welcome = $derived(handover.name ? `Welcome back, ${handover.name}` : 'Welcome to Los Santos');
    const detail = $derived(loading.detail ?? 'waiting for the game');
    const batch = $derived(loading.order && loading.order.count > 0 ? loading.order : null);
</script>

<section class="card au-light" aria-label="Loading status">
    <p class="card__welcome">
        <span>{welcome}</span>
        {#if handover.priority > 0}<Tag tone="warning" solid>Priority {handover.priority}</Tag>{/if}
    </p>

    <h2 class="card__headline">{loading.headline}</h2>

    {#if handover.priority > 0 && handover.priorityMessage}
        <p class="card__priority">{handover.priorityMessage}</p>
    {/if}

    <div class="card__meta">
        <span class="card__meta-label">{loading.finished ? 'Loaded, waiting for the server' : 'Loaded'}</span>
        <span class="card__pct au-mono">{pct}%</span>
    </div>
    <ProgressBar size="lg" value={pct} tone={loading.finished ? 'success' : 'action'} />

    <Checklist />

    <p class="card__detail au-mono">
        <span class="card__detail-text au-truncate">{detail}</span>
        {#if batch}<span class="card__detail-count">{batch.invoked} / {batch.count}</span>{/if}
    </p>
</section>

<style>
    .card {
        width: 560px;
        padding: 24px;
        border: 1px solid var(--au-border);
        border-radius: var(--au-radius);
        background: var(--au-bg);
        color: var(--au-text);
        box-shadow: var(--au-shadow-1);
    }
    .card__welcome {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0 0 4px;
        color: var(--au-muted);
        font-size: var(--au-fs-xs);
    }
    .card__headline {
        margin: 0 0 16px;
        font-size: var(--au-fs-lg);
    }
    .card__priority {
        margin: -8px 0 16px;
        font-size: var(--au-fs-xs);
        color: var(--au-muted);
    }
    .card__meta {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 4px;
    }
    .card__meta-label {
        font-weight: 700;
    }
    .card__pct {
        font-size: var(--au-fs-md);
        font-weight: 700;
    }
    .card :global(.au-progress) {
        margin-bottom: 20px;
    }
    .card__detail {
        display: flex;
        align-items: baseline;
        gap: 16px;
        margin: 12px 0 0;
        max-width: none;
        font-size: var(--au-fs-xs);
        color: var(--au-muted);
    }
    .card__detail-text {
        min-width: 0;
        flex: 1;
    }
    .card__detail-count {
        flex-shrink: 0;
        color: var(--au-hint);
    }
</style>
