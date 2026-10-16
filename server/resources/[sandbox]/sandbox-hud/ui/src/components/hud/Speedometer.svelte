<script>
    /**
     * 240 degree RPM arc with gear ticks and the speed in the middle,
     * drawn in a 100x100 viewBox so it scales with the HUD root font-size.
     */
    let { speed = 0, rpm = 0, gears = 0, gear = '', unit = 'MPH', ignition = true, showRPM = true, showGears = true } = $props();

    const R = 40;
    const polar = (r, deg) => {
        const rad = ((deg - 90) * Math.PI) / 180;
        return [r * Math.cos(rad), r * Math.sin(rad)];
    };
    function arc(r, start, end) {
        const [sx, sy] = polar(r, start);
        const [ex, ey] = polar(r, end);
        const large = end - start <= 180 ? 0 : 1;
        return `M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`;
    }
    const track = arc(R, -120, 120);
    const trackLength = (240 / 360) * 2 * Math.PI * R;
    const pct = $derived(ignition && showRPM ? Math.max(0, Math.min(1, Number(rpm) || 0)) : 0);
    const rpmColor = $derived(pct >= 0.9 ? 'var(--hud-red)' : pct >= 0.8 ? 'var(--hud-orange)' : 'var(--hud-green)');
    const ticks = $derived.by(() => {
        const n = Math.max(0, Math.min(10, Math.floor(Number(gears) || 0)));
        if (!showGears || n < 2) return [];
        return Array.from({ length: n }, (_, i) => {
            const angle = -120 + (i * 240) / (n - 1);
            const [ix, iy] = polar(R - 3, angle);
            const [ox, oy] = polar(R + 2, angle);
            const [tx, ty] = polar(R - 9, angle);
            return { i, line: `M ${ix} ${iy} L ${ox} ${oy}`, tx, ty, label: i + 1 };
        });
    });
</script>

<div class="speedo">
    <svg viewBox="-50 -50 100 100" class="speedo__svg hud-shadow" aria-hidden="true">
        <path d={track} fill="none" stroke="rgba(0, 0, 0, 0.4)" stroke-width="4" stroke-linecap="round" />
        <path
            d={track}
            fill="none"
            stroke={rpmColor}
            stroke-width="4"
            stroke-linecap="round"
            style="stroke-dasharray:{trackLength} {trackLength};stroke-dashoffset:{trackLength * (1 - pct)};transition:stroke-dashoffset 120ms linear, stroke 200ms"
        />
        {#each ticks as t (t.i)}
            <path d={t.line} stroke="#dee2e6" stroke-width="1.6" stroke-linecap="round" />
            <text x={t.tx} y={t.ty} text-anchor="middle" dominant-baseline="middle" fill="#ffffff" font-size="5" font-weight="700" font-family="Roboto, sans-serif">{t.label}</text>
        {/each}
    </svg>
    <div class="speedo__center">
        {#if showGears}<div class="speedo__gear hud-text">{gear}</div>{/if}
        <div class="speedo__speed hud-text" class:is-off={!ignition}>{Math.max(0, Math.round(Number(speed) || 0))}</div>
        <div class="speedo__unit hud-text">{unit}</div>
    </div>
</div>

<style>
    .speedo {
        position: relative;
        width: 13em;
        height: 13em;
    }
    .speedo__svg {
        width: 100%;
        height: 100%;
    }
    .speedo__center {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.1em;
    }
    .speedo__gear {
        font-size: 1em;
        min-height: 1.2em;
        color: #cfd3d8;
    }
    .speedo__speed {
        font-size: 2.4em;
        line-height: 1;
    }
    .speedo__speed.is-off {
        color: #9aa0a6;
    }
    .speedo__unit {
        font-size: 0.85em;
        color: #cfd3d8;
        text-transform: uppercase;
        letter-spacing: 0.04em;
    }
</style>
