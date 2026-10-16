<script>
    import { Icon } from '@sandbox/ui-kit';

    /** Horizontal readout: icon, value, thin bar (health). */
    let { icon, value = 0, max = 100, color = 'var(--hud-white)', low = false } = $props();
    const pct = $derived(Math.max(0, Math.min(100, (Number(value) / (Number(max) || 100)) * 100)));
</script>

<div class="bar" class:is-low={low}>
    <span class="bar__icon hud-shadow" style="color:{Number(value) <= 0 ? 'var(--hud-red)' : 'var(--hud-white)'}"><Icon {icon} filled /></span>
    <span class="bar__value hud-text" style="color:{color}">{Math.round(Number(value) || 0)}</span>
    <span class="bar__track hud-shadow"><span class="bar__fill" style="width:{pct}%;background:{color}"></span></span>
</div>

<style>
    .bar {
        display: flex;
        align-items: center;
        gap: 0.35em;
        width: 100%;
    }
    .bar__icon {
        font-size: 1em;
        line-height: 1;
        display: flex;
    }
    .bar__value {
        width: 1.7em;
        font-size: 0.72em;
        text-align: center;
        line-height: 1;
    }
    .bar__track {
        flex: 1;
        height: 0.5em;
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.35);
        overflow: hidden;
    }
    .bar__fill {
        display: block;
        height: 100%;
        border-radius: 999px;
        transition: width 220ms var(--au-ease);
    }
    .is-low {
        animation: hud-pulse 1s linear infinite;
    }
</style>
