<script>
    import Desktop from './Desktop.svelte';
    import Taskbar from './Taskbar.svelte';
    import ScreenNotifications from './ScreenNotifications.svelte';
    import AnswerDialog from './AnswerDialog.svelte';
    import Alerts from './Alerts.svelte';
    import { laptop } from '../../state/laptop.svelte.js';
    import { env, zoom } from '../../state/env.svelte.js';

    /**
     * The laptop as a physical device: the lid with its bezel and camera, the
     * screen inside it, and the front edge of the base below. Laid out at
     * 1580x916 for a 1920x1080 screen and zoomed by min(vw/1920, vh/1080).
     * The screen is the containing block for dialogs, so kit Modals cover the
     * screen and not the whole game.
     */
    const W = 1580;
    const H = 916;

    const k = $derived(zoom());
    const left = $derived(Math.round((env.vw - W * k) / 2));
    const top = $derived(Math.round((env.vh - H * k) / 2));
</script>

<div class="stage" class:stage--hidden={!laptop.visible} aria-hidden={!laptop.visible}>
    <div class="device" style="left:{left}px;top:{top}px;transform:scale({k})">
        <div class="lid">
            <span class="camera" aria-hidden="true"></span>
            <div class="screen">
                <Desktop />
                <Taskbar />
                <ScreenNotifications />
                <Alerts />
                <AnswerDialog />
            </div>
        </div>
        <div class="base" aria-hidden="true"><span class="groove"></span></div>
    </div>
</div>

<style>
    .stage {
        position: fixed;
        inset: 0;
        z-index: 10;
        transition:
            opacity 160ms var(--au-ease),
            visibility 0s linear 0s;
    }
    .stage--hidden {
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transition:
            opacity 160ms var(--au-ease),
            visibility 0s linear 160ms;
    }
    .device {
        position: absolute;
        width: 1580px;
        height: 916px;
        transform-origin: 0 0;
    }
    .lid {
        position: absolute;
        left: 40px;
        top: 0;
        width: 1500px;
        height: 900px;
        padding: 30px 20px 30px;
        background: var(--au-bg-sunk);
        border: 1px solid var(--au-border);
        border-radius: 14px 14px 4px 4px;
    }
    .camera {
        position: absolute;
        left: 50%;
        top: 12px;
        width: 7px;
        height: 7px;
        margin-left: -3px;
        border-radius: 50%;
        background: var(--au-bg-alt-shade);
    }
    .screen {
        position: relative;
        width: 1458px;
        height: 838px;
        overflow: hidden;
        background: var(--au-bg);
        /* containing block for position: fixed (kit Modal) */
        transform: translateZ(0);
    }
    .base {
        position: absolute;
        left: 0;
        top: 899px;
        width: 1580px;
        height: 17px;
        background: var(--au-bg-alt-shade);
        border: 1px solid var(--au-border);
        border-radius: 2px 2px 18px 18px;
    }
    .groove {
        position: absolute;
        left: 50%;
        top: -1px;
        width: 180px;
        height: 7px;
        margin-left: -90px;
        background: var(--au-bg-alt);
        border-radius: 0 0 8px 8px;
    }
</style>
