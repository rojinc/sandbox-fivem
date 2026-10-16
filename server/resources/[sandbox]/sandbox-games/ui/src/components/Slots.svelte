<script>
    /** Code readout: one slot per expected digit; `mask` shows a dot instead of the digit. */
    let { length = 0, values = [], mask = false } = $props();
    const slots = $derived(Math.max(length, values.length));
</script>

<div class="gm-slots">
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
        justify-content: center;
        gap: var(--au-s2);
    }

    .gm-slot {
        display: grid;
        place-items: center;
        flex: 1;
        max-width: 44px;
        height: 48px;
        border: 1px solid var(--au-border);
        border-radius: var(--au-radius);
        background: var(--au-bg-sunk);
        font-size: var(--au-fs-lg);
        font-weight: 500;
        color: var(--au-text);
        transition:
            background var(--au-fast) var(--au-ease),
            border-color var(--au-fast) var(--au-ease);
    }

    .gm-slot.is-filled {
        border-color: var(--au-border-strong);
        background: var(--au-bg-alt);
    }

    .gm-slot__dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--au-text);
    }
</style>
