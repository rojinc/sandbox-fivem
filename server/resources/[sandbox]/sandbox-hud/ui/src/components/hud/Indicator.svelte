<script>
    import { Icon } from '@sandbox/ui-kit';

    /**
     * Icon with a tiny bar underneath. `value` 0..100 fills the bar; with
     * `state` the bar is full in `color` when on and dim when off; `alert`
     * pulses red (check engine, no seatbelt).
     */
    let { icon, value, state, color = 'var(--hud-green)', alert = false, label, custom } = $props();

    const pct = $derived(state !== undefined ? (state ? 100 : 0) : Math.max(0, Math.min(100, Number(value) || 0)));
    const fill = $derived(alert ? 'var(--hud-red)' : state !== undefined ? color : pct <= 20 ? 'var(--hud-red)' : pct <= 50 ? 'var(--hud-orange)' : color);
</script>

<div class="ind" class:is-alert={alert} aria-label={label} title={label}>
    <span class="ind__icon hud-shadow" style="color:{alert ? 'var(--hud-red)' : 'rgba(255,255,255,0.9)'}">
        {#if custom}{@render custom()}{:else}<Icon {icon} stroke={2} />{/if}
    </span>
    <span class="ind__track hud-shadow"><span class="ind__fill" style="width:{pct}%;background:{fill}"></span></span>
</div>

<style>
    .ind {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.45em;
        width: 2.4em;
    }
    .ind__icon {
        font-size: 1.3em;
        line-height: 1;
        display: flex;
        height: 1.1em;
        align-items: center;
    }
    .ind__track {
        width: 80%;
        height: 0.25em;
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.35);
        overflow: hidden;
    }
    .ind__fill {
        display: block;
        height: 100%;
        border-radius: 999px;
        transition:
            width 200ms var(--au-ease),
            background 200ms;
    }
    .is-alert {
        animation: hud-pulse 1.2s linear infinite;
    }
</style>
