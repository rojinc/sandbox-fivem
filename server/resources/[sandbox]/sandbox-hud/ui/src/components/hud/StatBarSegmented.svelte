<script>
    import { Icon } from '@sandbox/ui-kit';

    /** Four-segment bar (armour), filled left to right. */
    let { icon = 'shield-halved', value = 0, max = 100, color = 'var(--hud-blue)', segments = 4 } = $props();
    const fills = $derived.by(() => {
        const pct = Math.max(0, Math.min(100, (Number(value) / (Number(max) || 100)) * 100));
        const size = 100 / segments;
        return Array.from({ length: segments }, (_, i) => Math.max(0, Math.min(100, ((pct - i * size) / size) * 100)));
    });
</script>

<div class="seg">
    <span class="seg__icon hud-shadow"><Icon {icon} /></span>
    <span class="seg__value hud-text" style="color:{color}">{Math.round(Number(value) || 0)}</span>
    <span class="seg__track hud-shadow">
        {#each fills as fill, i (i)}
            <span class="seg__cell"><span class="seg__fill" style="width:{fill}%;background:{color}"></span></span>
        {/each}
    </span>
</div>

<style>
    .seg {
        display: flex;
        align-items: center;
        gap: 0.35em;
        width: 100%;
    }
    .seg__icon {
        font-size: 1em;
        line-height: 1;
        display: flex;
        color: var(--hud-white);
    }
    .seg__value {
        width: 1.7em;
        font-size: 0.72em;
        text-align: center;
        line-height: 1;
    }
    .seg__track {
        flex: 1;
        display: flex;
        gap: 0.3em;
        height: 0.5em;
    }
    .seg__cell {
        flex: 1;
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.35);
        overflow: hidden;
    }
    .seg__fill {
        display: block;
        height: 100%;
        border-radius: 999px;
        transition: width 220ms var(--au-ease);
    }
</style>
