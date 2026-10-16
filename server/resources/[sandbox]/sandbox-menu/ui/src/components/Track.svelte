<script>
    /**
     * A square ink track for a number between min and max: the fill shows the
     * value, a press or drag sets it. `onchange(raw)` gets the unsnapped value,
     * `oncommit()` runs when the pointer is released. `active` draws the focus ring.
     */
    let { value, min = 0, max = 100, disabled = false, active = false, label, onchange, oncommit } = $props();

    let el = $state();
    let dragging = false;

    const pct = $derived(max > min ? Math.min(100, Math.max(0, ((Number(value) - min) / (max - min)) * 100)) : 0);

    function valueAt(e) {
        const r = el.getBoundingClientRect();
        const ratio = r.width ? (e.clientX - r.left) / r.width : 0;
        return min + Math.min(1, Math.max(0, ratio)) * (max - min);
    }

    function down(e) {
        if (disabled || e.button !== 0) return;
        e.preventDefault();
        dragging = true;
        el.setPointerCapture?.(e.pointerId);
        onchange?.(valueAt(e));
    }

    function move(e) {
        if (dragging) onchange?.(valueAt(e));
    }

    function up(e) {
        if (!dragging) return;
        dragging = false;
        el.releasePointerCapture?.(e.pointerId);
        oncommit?.();
    }
</script>

<!-- The menu keyboard handler (lib/keys.js) steps the value. -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
    bind:this={el}
    class="track"
    class:is-active={active}
    class:is-disabled={disabled}
    role="slider"
    tabindex="-1"
    aria-label={label}
    aria-valuemin={min}
    aria-valuemax={max}
    aria-valuenow={Number(value)}
    aria-disabled={disabled || undefined}
    onpointerdown={down}
    onpointermove={move}
    onpointerup={up}
    onpointercancel={up}
    onclick={(e) => e.stopPropagation()}
>
    <div class="track__fill" style="width:{pct}%"></div>
</div>

<style>
    .track {
        position: relative;
        height: 16px;
        border: 2px solid var(--au-ink);
        background: var(--au-input-bg);
        cursor: pointer;
        touch-action: none;
    }
    .track.is-active {
        outline: 3px solid var(--au-focus);
        outline-offset: 0;
    }
    .track.is-disabled {
        border-color: var(--au-border);
        cursor: not-allowed;
    }
    .track__fill {
        position: absolute;
        inset: 0 auto 0 0;
        background: var(--au-ink);
    }
    .track.is-disabled .track__fill {
        background: var(--au-muted);
    }
</style>
