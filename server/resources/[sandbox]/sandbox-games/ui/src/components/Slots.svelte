<script>
    /** Code readout: one slot per expected digit; `mask` shows a dot instead of the digit. */
    let { length = 0, values = [], mask = false } = $props();
    const slots = $derived(Math.max(length, values.length));
</script>

<div class="gm-slots" aria-live="polite">
    {#each { length: slots } as _, i (i)}
        <span class="gm-slot au-mono" class:is-filled={values[i] !== undefined}>
            {#if values[i] !== undefined}
                {#if mask}<span class="gm-slot__dot"></span>{:else}{values[i]}{/if}
            {/if}
        </span>
    {/each}
</div>

<style>
    .gm-slots {
        display: flex;
        gap: var(--au-s2);
    }

    .gm-slot {
        display: grid;
        place-items: center;
        flex: 1;
        height: 52px;
        border: 2px solid var(--au-border);
        background: var(--au-bg-sunk);
        font-size: var(--au-fs-lg);
        font-weight: 700;
        color: var(--au-text);
    }

    .gm-slot.is-filled {
        border-color: var(--au-ink);
    }

    .gm-slot__dot {
        width: 12px;
        height: 12px;
        background: var(--au-text);
    }
</style>
