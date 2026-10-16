<script>
    import { Tag } from '@sandbox/ui-kit';

    /**
     * Plate reader line under a readout: the plate in mono, the vehicle class grade
     * and a Flagged tag when the record carries `flag` (true or a reason string).
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

<div class="plate" class:plate--empty={!has} title={reason}>
    <span class="plate__text au-truncate" class:au-mono={has}>{text}</span>
    {#if flagged}
        <Tag tone="error" solid>Flagged</Tag>
    {:else if has && grade}
        <span title="Vehicle class {grade}"><Tag>Class {grade}</Tag></span>
    {/if}
</div>

<style>
    .plate {
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 24px;
        min-width: 0;
        font-size: 14px;
    }
    .plate__text {
        font-weight: 500;
        letter-spacing: 0.08em;
        min-width: 0;
    }
    .plate--empty .plate__text {
        color: var(--au-muted);
        font-weight: 400;
        letter-spacing: 0;
    }
</style>
