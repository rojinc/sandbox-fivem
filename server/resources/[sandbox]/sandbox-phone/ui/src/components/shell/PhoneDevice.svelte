<script>
    import Screen from './Screen.svelte';
    import { phone, cancelMove } from '../../state/phone.svelte.js';
    import { data } from '../../state/data.svelte.js';
    import { frameFor } from '../../lib/assets.js';

    /**
     * The handset: the player's frame image at its real 1:2 proportions with the
     * screen behind its glass. Docked bottom right unless the player moved it.
     * Laid out at 384x768 for a 1920x1080 screen and scaled by
     * min(innerWidth / 1920, innerHeight / 1080); "Larger phone" adds 15%.
     * When closed it sinks below the screen edge and rises just far enough to
     * show new notifications.
     */
    const W = 384;
    const H = 768;
    const F = W / 500; // frame images are 500x1000

    let vw = $state(window.innerWidth);
    let vh = $state(window.innerHeight);
    $effect(() => {
        const on = () => {
            vw = window.innerWidth;
            vh = window.innerHeight;
        };
        window.addEventListener('resize', on);
        return () => window.removeEventListener('resize', on);
    });

    const s = $derived(Math.min(vw / 1920, vh / 1080));
    const k = $derived(Math.min(s * (phone.expanded ? 1.15 : 1), (vh - 16) / H));
    const w = $derived(W * k);
    const h = $derived(H * k);
    const margin = $derived(Math.round(24 * s));
    const frame = $derived(frameFor(data.player?.PhoneCase));
    const scr = $derived(frame.screen.map((v) => v * F));

    let popupHeight = $state(0);
    let dragging = $state(false);

    const clampX = (x) => Math.max(0, Math.min(vw - w, x));
    const clampY = (y) => Math.max(0, Math.min(vh - h, y));

    const dock = $derived({ left: vw - w - margin, top: vh - h - margin });
    const box = $derived.by(() => {
        if (!phone.visible) {
            // Closed: docked column, below the edge; peek far enough to show the notifications.
            const peek = popupHeight > 0 ? Math.min(h, (scr[1] + 40 + popupHeight + 12) * k) : 0;
            return { left: dock.left, top: peek > 0 ? vh - peek : vh + 24 };
        }
        if (!phone.position) return dock;
        return { left: clampX(phone.position.x * s), top: clampY(phone.position.y * s) };
    });

    let start = null;
    function down(e) {
        if (!phone.moving || e.button !== 0) return;
        if (e.target.closest('button, a, input, textarea, select')) return;
        start = { x: e.clientX, y: e.clientY, left: box.left, top: box.top };
        dragging = true;
        e.currentTarget.setPointerCapture(e.pointerId);
    }
    function move(e) {
        if (!dragging || !start) return;
        const left = clampX(start.left + e.clientX - start.x);
        const top = clampY(start.top + e.clientY - start.y);
        phone.position = { x: left / s, y: top / s };
    }
    function up() {
        dragging = false;
        start = null;
    }
</script>

<div
    class="device"
    class:device--closed={!phone.visible}
    class:device--dragging={dragging}
    style="left:{box.left}px;top:{box.top}px;width:{w}px;height:{h}px"
    onpointerdown={down}
    onpointermove={move}
    onpointerup={up}
    onpointercancel={up}
    role="presentation"
>
    <div class="device__inner" style="transform:scale({k})">
        <div class="device__screen" style="left:{scr[0] - 1}px;top:{scr[1] - 1}px;width:{scr[2] - scr[0] + 2}px;height:{scr[3] - scr[1] + 2}px">
            <Screen bind:popupHeight onCancelMove={cancelMove} />
        </div>
        <img class="device__frame" src={frame.src} alt="" draggable="false" />
    </div>
</div>

<style>
    .device {
        position: fixed;
        z-index: 10;
        transition:
            top 220ms var(--au-ease),
            left 220ms var(--au-ease);
    }
    .device--dragging {
        transition: none;
    }
    .device--closed {
        pointer-events: none;
    }
    .device__inner {
        position: absolute;
        left: 0;
        top: 0;
        width: 384px;
        height: 768px;
        transform-origin: 0 0;
    }
    .device__screen {
        position: absolute;
        overflow: hidden;
    }
    .device__frame {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        max-width: none;
        pointer-events: none;
        user-select: none;
    }
</style>
