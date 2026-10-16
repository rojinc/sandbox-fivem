<script>
    import { Checkbox } from '@sandbox/ui-kit';

    /**
     * A titled set of rows. With `toggle`, the title is a checkbox (worn,
     * applied) and the rows only show while it is ticked.
     */
    let { title, toggle = false, checked = false, ontoggle, disabled = false, children } = $props();

    let on = $state(false);
    $effect.pre(() => {
        on = Boolean(checked);
    });
</script>

<section class="ped-group">
    {#if toggle}
        <Checkbox
            label={title}
            class="ped-group__check"
            {disabled}
            bind:checked={on}
            onchange={(e) => ontoggle?.(e.currentTarget.checked)}
        />
        {#if on}<div class="ped-group__body">{@render children?.()}</div>{/if}
    {:else}
        <h3 class="ped-group__title">{title}</h3>
        <div class="ped-group__body">{@render children?.()}</div>
    {/if}
</section>

<style>
    .ped-group {
        margin: 0 0 var(--au-s6);
    }
    .ped-group__title {
        margin: 0 0 var(--au-s1);
        font-size: var(--au-fs-sm);
        font-weight: 700;
    }
    .ped-group :global(.ped-group__check .au-check__label) {
        font-size: var(--au-fs-sm);
        font-weight: 700;
    }
    .ped-group__body {
        margin-top: var(--au-s1);
    }
</style>
