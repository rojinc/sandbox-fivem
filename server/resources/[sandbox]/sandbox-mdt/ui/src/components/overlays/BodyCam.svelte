<script>
    import { app } from '../../state/app.svelte.js';
    import { alerts } from '../../state/alerts.svelte.js';

    /** Body camera recording stamp, top right, straight on the game world (no panel). */
    let now = $state(new Date());

    $effect(() => {
        const t = setInterval(() => (now = new Date()), 1000);
        return () => clearInterval(t);
    });

    const p = (n) => String(n).padStart(2, '0');
    const stamp = $derived(`${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())} ${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`);
    const unit = $derived(app.user?.Callsign ? `Unit ${app.user.Callsign}` : app.user?.SID ? `ID ${app.user.SID}` : '');
</script>

<div class="bodycam au-overworld" class:beside-panel={alerts.showing} aria-hidden="true">
    <div class="rec"><span class="dot"></span>Recording</div>
    <div class="au-mono">{stamp}</div>
    {#if unit}<div class="au-mono">AXON BODY 3 {unit}</div>{/if}
</div>

<style>
    .bodycam {
        position: absolute;
        top: 24px;
        right: 32px;
        text-align: right;
        font-size: var(--au-fs-xs);
        line-height: 1.4;
        pointer-events: none !important;
    }
    /* Keep the stamp visible while the alerts panel is docked on the right. */
    .bodycam.beside-panel {
        right: 532px;
    }
    .rec {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-weight: 700;
    }
    .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--hud-red);
        animation: au-pulse 2s ease-in-out infinite;
    }
</style>
