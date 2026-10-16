<script>
    /**
     * Plate reader line under a window: the plate in mono and the vehicle class
     * grade. A flagged record (`flag` true or a reason string) lights the plate red;
     * the reason itself is on the warning line at the bottom of the unit.
     */
    let { plate = null, vehicleClass = null, flag = false } = $props();

    const has = $derived(typeof plate === 'string' && plate.trim().length > 0);
    const text = $derived(has ? plate.trim().toUpperCase() : 'No plate');
    const flagged = $derived(has && Boolean(flag));
    const grade = $derived(
        vehicleClass !== undefined && vehicleClass !== null && vehicleClass !== false && String(vehicleClass).trim() !== ''
            ? String(vehicleClass).toUpperCase()
            : null,
    );
    const reason = $derived(typeof flag === 'string' ? flag : flagged ? 'Flagged plate' : undefined);
</script>

<div class="plate" class:plate--empty={!has} class:plate--flagged={flagged} title={reason}>
    <span class="plate__text au-truncate" class:au-mono={has}>{text}</span>
    {#if flagged}
        <span class="plate__meta plate__meta--flag">Flagged</span>
    {:else if has && grade}
        <span class="plate__meta" title="Vehicle class {grade}">Class {grade}</span>
    {/if}
</div>

<style>
    .plate {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 8px;
        min-width: 0;
        height: 20px;
        padding: 0 2px;
        font-size: 14px;
        line-height: 20px;
    }
    .plate__text {
        min-width: 0;
        font-weight: 500;
        letter-spacing: 0.06em;
        color: var(--au-text);
    }
    .plate--empty .plate__text {
        font-size: 12px;
        font-weight: 400;
        letter-spacing: 0;
        color: var(--au-hint);
    }
    .plate--flagged .plate__text {
        color: var(--au-error);
    }
    .plate__meta {
        flex-shrink: 0;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--au-hint);
    }
    .plate__meta--flag {
        color: var(--au-error);
    }
</style>
