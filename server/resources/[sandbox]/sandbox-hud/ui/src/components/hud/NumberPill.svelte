<script>
    import { Icon } from '@sandbox/ui-kit';

    /** Icon + value for statuses that are numbers rather than levels (radio frequency). */
    let { icon, value, color = 'var(--hud-white)', label } = $props();
</script>

<div class="pill hud-shadow" aria-label={label} title={label}>
    <span class="pill__icon" style="color:{color}"><Icon {icon} stroke={2.2} /></span>
    <span class="pill__value hud-text">{value}</span>
</div>

<style>
    .pill {
        display: inline-flex;
        align-items: center;
        gap: 0.35em;
        height: 1.5em;
        padding: 0 0.55em;
        border-radius: 0.45em;
        background: rgba(0, 0, 0, 0.35);
        align-self: flex-end;
    }
    .pill__icon {
        font-size: 0.9em;
        display: flex;
    }
    .pill__value {
        font-size: 0.72em;
        font-family: var(--au-font-mono);
    }
</style>
