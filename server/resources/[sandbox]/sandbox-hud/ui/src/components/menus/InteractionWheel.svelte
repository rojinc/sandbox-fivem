<script>
    import { fade } from 'svelte/transition';
    import { Icon, fetchNui, onKey } from '@sandbox/ui-kit';
    import { ui } from '../../state/ui.svelte.js';

    /** Radial menu opened with F1 (client/interaction.lua). Slices trigger Interaction:Trigger with the item. */
    const SIZE = 520;
    const OUTER = 236;
    const INNER = 92;
    const CENTER = 66;

    const polar = (r, deg) => {
        const rad = ((deg - 90) * Math.PI) / 180;
        return [SIZE / 2 + r * Math.cos(rad), SIZE / 2 + r * Math.sin(rad)];
    };
    function slicePath(start, end) {
        const gap = 1.2;
        const a0 = start + gap;
        const a1 = end - gap;
        const [ox0, oy0] = polar(OUTER, a0);
        const [ox1, oy1] = polar(OUTER, a1);
        const [ix0, iy0] = polar(INNER, a0);
        const [ix1, iy1] = polar(INNER, a1);
        const large = a1 - a0 > 180 ? 1 : 0;
        return `M ${ox0} ${oy0} A ${OUTER} ${OUTER} 0 ${large} 1 ${ox1} ${oy1} L ${ix1} ${iy1} A ${INNER} ${INNER} 0 ${large} 0 ${ix0} ${iy0} Z`;
    }

    const wheel = $derived(ui.interaction);
    let hover = $state(null);
    const n = $derived(Math.max(1, wheel.items.length));
    const step = $derived(360 / n);

    const hide = () => fetchNui('Interaction:Hide');
    const back = () => (wheel.layer === 0 ? hide() : fetchNui('Interaction:Back'));
    const trigger = (item) => fetchNui('Interaction:Trigger', item);

    onKey(['Escape', 'F1'], () => (wheel.show ? hide() : false));
</script>

{#if wheel.show}
    <div class="wheel hud-ui" transition:fade={{ duration: 160 }} role="presentation" onclick={hide}>
        <div class="wheel__disc" style="width:{SIZE}px;height:{SIZE}px" role="menu" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={() => {}}>
            <svg width={SIZE} height={SIZE} viewBox="0 0 {SIZE} {SIZE}" class="wheel__svg">
                <defs>
                    <filter id="wheel-shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#000" flood-opacity="0.5" />
                    </filter>
                </defs>
                {#each wheel.items as item, i (item.id ?? i)}
                    {@const start = -step / 2 + i * step}
                    <path
                        d={slicePath(start, start + step)}
                        class="slice"
                        class:is-active={hover === i}
                        role="menuitem"
                        tabindex="-1"
                        aria-label={item.label}
                        onmouseenter={() => (hover = i)}
                        onmouseleave={() => (hover = null)}
                        onclick={() => trigger(item)}
                        onkeydown={(e) => e.key === 'Enter' && trigger(item)}
                    />
                {/each}
            </svg>
            {#each wheel.items as item, i (`l-${item.id ?? i}`)}
                {@const [x, y] = polar((OUTER + INNER) / 2, i * step)}
                <div class="label" class:is-active={hover === i} style="left:{x}px;top:{y}px">
                    <div class="label__icon"><Icon icon={item.icon ?? 'help'} stroke={1.6} /></div>
                    {#if item.label}<div class="label__text">{item.label}</div>{/if}
                </div>
            {/each}
            <button type="button" class="center" aria-label={wheel.layer === 0 ? 'Close' : 'Back'} style="width:{CENTER * 2}px;height:{CENTER * 2}px" onclick={back}>
                <Icon icon={wheel.layer === 0 ? 'xmark' : 'arrow-left'} />
            </button>
        </div>
    </div>
{/if}

<style>
    .wheel {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        background: rgba(8, 9, 10, 0.35);
    }
    .wheel__disc {
        position: relative;
        outline: none;
    }
    .wheel__svg {
        position: absolute;
        inset: 0;
    }
    .slice {
        fill: rgba(24, 26, 29, 0.94);
        stroke: rgba(255, 255, 255, 0.08);
        stroke-width: 1;
        cursor: pointer;
        filter: url(#wheel-shadow);
        transition:
            fill 120ms,
            stroke 120ms;
        outline: none;
    }
    .slice.is-active {
        fill: rgba(37, 40, 44, 0.97);
        stroke: var(--au-action);
    }
    .label {
        position: absolute;
        width: 118px;
        transform: translate(-50%, -50%);
        text-align: center;
        pointer-events: none;
        color: #fff;
        transition: color 120ms;
    }
    .label.is-active {
        color: var(--au-action);
    }
    .label__icon {
        font-size: 24px;
        line-height: 1;
    }
    .label__text {
        font-size: 13px;
        font-weight: 500;
        margin-top: 6px;
        line-height: 1.2;
    }
    .center {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        border: 1px solid var(--au-border-strong);
        background: var(--au-bg);
        color: var(--au-text);
        font-size: 26px;
        display: grid;
        place-items: center;
        cursor: pointer;
        transition:
            background 160ms var(--au-ease),
            color 160ms;
    }
    .center:hover {
        background: var(--au-bg-alt);
        color: var(--au-action);
    }
</style>
