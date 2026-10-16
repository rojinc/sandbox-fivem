<script>
    import { Icon } from '@sandbox/ui-kit';
    import { faCaretUp, faCaretDown } from '@fortawesome/free-solid-svg-icons';

    /**
     * Target direction lamps. Lua sends 'up' (travelling away, same heading as the
     * patrol car), 'down' (closing, opposite heading) or false (crossing / unknown).
     */
    let { direction = false } = $props();

    const title = $derived(direction === 'up' ? 'Travelling away' : direction === 'down' ? 'Closing' : 'No direction');
</script>

<span class="arrows" role="img" aria-label={title} {title}>
    <span class="arrow" class:arrow--on={direction === 'up'}><Icon icon={faCaretUp} /></span>
    <span class="arrow" class:arrow--on={direction === 'down'}><Icon icon={faCaretDown} /></span>
</span>

<style>
    .arrows {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        flex-shrink: 0;
    }
    .arrow {
        display: grid;
        place-items: center;
        width: 16px;
        height: 14px;
        font-size: 16px;
        line-height: 1;
        color: var(--au-muted);
        opacity: 0.35;
        transition:
            color var(--au-fast) var(--au-ease),
            opacity var(--au-fast) var(--au-ease);
    }
    .arrow--on {
        color: var(--au-action);
        opacity: 1;
    }
</style>
