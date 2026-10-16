<script>
    import { Button } from '@sandbox/ui-kit';
    import { sound } from '../../state/ped.svelte.js';

    /**
     * Compact stepper: previous / "3 / 12" / next. `index` is the 0-based
     * position in a list of `count` options; `count` null means the game has
     * not reported the range yet. Steps wrap around at both ends.
     * `text` replaces the "n / count" readout (e.g. "Not sold here").
     */
    let { index = 0, count = null, onchange, label, text, disabled = false } = $props();

    const known = $derived(typeof count === 'number' && count > 0);
    const readout = $derived(text ?? (known ? `${index + 1} / ${count}` : '–'));

    function step(dir) {
        if (disabled || !known) return;
        let next = index + dir;
        if (next >= count) next = 0;
        if (next < 0) next = count - 1;
        if (index < 0 || index >= count) next = dir > 0 ? 0 : count - 1;
        if (next === index) return;
        sound('UPDOWN');
        onchange?.(next);
    }
</script>

<div class="ped-stepper" class:is-disabled={disabled || !known}>
    <Button variant="secondary" size="sm" icon="chevron-left" class="ped-stepper__btn" aria-label="Previous {label}" disabled={disabled || !known} onclick={() => step(-1)} />
    <output class="ped-stepper__value" class:au-mono={text === undefined || /^[–\d]/.test(text)} aria-label={label}>{readout}</output>
    <Button variant="secondary" size="sm" icon="chevron-right" class="ped-stepper__btn" aria-label="Next {label}" disabled={disabled || !known} onclick={() => step(1)} />
</div>

<style>
    .ped-stepper {
        display: flex;
        align-items: center;
        gap: var(--au-s1);
        width: 216px;
    }
    .ped-stepper :global(.au-btn.au-btn--sm.ped-stepper__btn) {
        width: 40px;
        padding: 0;
        flex-shrink: 0;
    }
    .ped-stepper__value {
        flex: 1;
        min-width: 0;
        text-align: center;
        font-size: var(--au-fs-xs);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-bottom: 3px;
    }
    .is-disabled .ped-stepper__value {
        color: var(--au-muted);
    }
</style>
