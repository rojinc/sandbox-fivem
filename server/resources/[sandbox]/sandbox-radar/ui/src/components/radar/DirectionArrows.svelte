<script>
    import { Icon } from '@sandbox/ui-kit';

    /**
     * Target direction lamps inside the target window. Lua sends 'up' (travelling
     * away, same heading as the patrol car), 'down' (closing, opposite heading) or
     * false (crossing / unknown): no arrow is lit then.
     */
    let { direction = false } = $props();

    const title = $derived(direction === 'up' ? 'Travelling away' : direction === 'down' ? 'Closing' : 'No direction');
</script>

<span class="arrows" role="img" aria-label={title} {title}>
    <span class="arrow" class:arrow--on={direction === 'up'}><Icon icon="caret-up" /></span>
    <span class="arrow" class:arrow--on={direction === 'down'}><Icon icon="caret-down" /></span>
</span>

<style>
    .arrows {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        flex-shrink: 0;
    }
    .arrow {
        display: grid;
        place-items: center;
        width: 16px;
        height: 16px;
        font-size: 18px;
        line-height: 1;
        color: var(--au-error-bg);
        transition: color var(--au-fast) var(--au-ease);
    }
    /* Solid lamp: fill the caret outline. */
    .arrow :global(.au-icon) {
        fill: currentColor;
    }
    .arrow--on {
        color: var(--hud-red);
    }
</style>
