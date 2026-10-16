<script>
    /** One setting: label (and an optional muted note) on the left, its control on the right. */
    let { label, note, id, children } = $props();
</script>

<div class="ped-row">
    <div class="ped-row__text">
        {#if id}<label class="ped-row__label" for={id}>{label}</label>{:else}<span class="ped-row__label">{label}</span>{/if}
        {#if note}<span class="ped-row__note">{note}</span>{/if}
    </div>
    <div class="ped-row__control">{@render children?.()}</div>
</div>

<style>
    .ped-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: center;
        gap: var(--au-s3);
        min-height: 48px;
    }
    .ped-row__text {
        min-width: 0;
        display: flex;
        flex-direction: column;
    }
    .ped-row__label {
        font-size: var(--au-fs-xs);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .ped-row__note {
        color: var(--au-muted);
        font-size: var(--au-fs-xs);
        line-height: 1.3;
    }
    .ped-row__control {
        display: flex;
        justify-content: flex-end;
    }
</style>
