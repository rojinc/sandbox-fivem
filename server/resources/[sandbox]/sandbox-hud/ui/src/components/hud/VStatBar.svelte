<script>
    import { Icon } from '@sandbox/ui-kit';

    /** Vertical status bar with its icon underneath (hunger, thirst, stress, voice). */
    let { icon, value = 0, color = 'var(--hud-white)', low = false, iconColor, label } = $props();
    const pct = $derived(Math.max(0, Math.min(100, Number(value) || 0)));
</script>

<div class="vbar" class:is-low={low} aria-label={label} title={label}>
    <span class="vbar__track hud-shadow"><span class="vbar__fill" style="height:{pct}%;background:{color}"></span></span>
    <span class="vbar__icon hud-shadow" style="color:{iconColor ?? (pct <= 0 ? 'var(--hud-red)' : 'var(--hud-white)')}"><Icon {icon} /></span>
</div>

<style>
    .vbar {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.3em;
        height: 100%;
    }
    .vbar__track {
        flex: 1;
        width: 0.3em;
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.35);
        overflow: hidden;
        position: relative;
    }
    .vbar__fill {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 999px;
        transition: height 220ms var(--au-ease);
    }
    .vbar__icon {
        font-size: 0.8em;
        line-height: 1;
        display: flex;
    }
    .is-low {
        animation: hud-pulse 1s linear infinite;
    }
</style>
