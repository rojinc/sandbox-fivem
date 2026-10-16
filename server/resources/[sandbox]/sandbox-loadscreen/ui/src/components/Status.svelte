<script>
    import { ProgressBar, Tag } from '@sandbox/ui-kit';
    import { loading } from '../state/loading.svelte.js';
    import { handover } from '../state/handover.svelte.js';
    import Steps from './Steps.svelte';

    const pct = $derived(Math.round(loading.fraction * 100));
    const detail = $derived(loading.detail ?? 'waiting for the game');
    const batch = $derived(loading.order && loading.order.count > 0 ? loading.order : null);
    const priority = $derived(handover.priority > 0 ? handover.priority : 0);
    const showWelcome = $derived(Boolean(handover.name) || priority > 0);
</script>

<!-- Loading status, straight on the photo (no panel): text with the over-world shadow. -->
<section class="status au-overworld" aria-label="Loading status">
    {#if showWelcome}
        <div class="status__welcome">
            <p class="status__hello">
                <span>{handover.name ? `Welcome back, ${handover.name}` : 'Welcome back'}</span>
                {#if priority}<Tag tone="warning">Priority {priority}</Tag>{/if}
            </p>
            {#if priority && handover.priorityMessage}
                <p class="status__note">{handover.priorityMessage}</p>
            {/if}
        </div>
    {/if}

    <div class="status__head">
        <h2 class="status__headline" aria-live="polite">{loading.headline}</h2>
        <span class="status__pct au-mono">{pct}%</span>
    </div>

    <p class="status__detail au-mono">
        <span class="status__detail-text au-truncate">{detail}</span>
        {#if batch}<span class="status__count">{batch.invoked} / {batch.count}</span>{/if}
    </p>

    <ProgressBar size="lg" overworld value={pct} tone={loading.finished ? 'success' : 'action'} class="status__bar" />

    <Steps />
</section>

<style>
    .status {
        width: 720px;
        max-width: 100%;
    }
    .status__welcome {
        margin-bottom: 20px;
    }
    .status__hello {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0;
        max-width: none;
        font-size: var(--au-fs-sm);
        font-weight: 500;
    }
    .status__hello :global(.au-tag) {
        text-shadow: none;
    }
    .status__note {
        margin: 4px 0 0;
        max-width: none;
        font-size: var(--au-fs-xs);
        color: var(--au-muted);
    }
    .status__head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 24px;
    }
    .status__headline {
        min-width: 0;
        margin: 0;
        font-size: var(--au-fs-xl);
        font-weight: 700;
        line-height: var(--au-lh-heading);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .status__pct {
        flex-shrink: 0;
        font-size: var(--au-fs-xxxl);
        font-weight: 500;
        line-height: 1;
        letter-spacing: -0.02em;
    }
    .status__detail {
        display: flex;
        align-items: baseline;
        gap: 16px;
        margin: 8px 0 16px;
        max-width: none;
        font-size: var(--au-fs-xs);
        line-height: 20px;
        color: var(--au-muted);
    }
    .status__detail-text {
        min-width: 0;
    }
    .status__count {
        flex-shrink: 0;
        color: var(--au-hint);
    }
    .status :global(.status__bar) {
        margin-bottom: 16px;
    }
</style>
