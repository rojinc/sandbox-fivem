<script>
    import frameUrl from '../assets/radio_frame.webp';
    import { PARTS, place, placeMasked, half, frameSize } from '../lib/frame.js';
    import { radio } from '../state/radio.svelte.js';
    import { volume, clicks, togglePower } from '../lib/actions.js';
    import Screen from './Screen.svelte';

    /**
     * The handset (client/main.lua OpenRadio): the display sits behind the cut-out of the
     * frame image and the physical parts are hotspots over the picture. Tall knob: volume,
     * short knob: click sound, bottom pill: power. Each knob turns with the mouse wheel;
     * clicking its left half turns it down, the right half up.
     */
    const WHEEL_GAP = 90; // ms between wheel notches, so a trackpad flick is not twenty requests
    let lastWheel = 0;
    function turn(e, fn) {
        const now = performance.now();
        if (!e.deltaY || now - lastWheel < WHEEL_GAP) return;
        lastWheel = now;
        fn(e.deltaY < 0 ? 1 : -1);
    }

    // Clicking a part keeps the caret in the frequency entry, so typing digits still works.
    const keepFocus = (e) => e.preventDefault();
</script>

{#snippet knob(part, label, onturn, live)}
    <div class="knob" class:is-live={live} role="group" aria-label={label.group} onwheel={(e) => turn(e, onturn)}>
        {#each [-1, 1] as dir (dir)}
            <button
                type="button"
                class="knob__half"
                style={placeMasked(half(part, dir))}
                title={dir > 0 ? label.up : label.down}
                aria-label={dir > 0 ? label.up : label.down}
                onmousedown={keepFocus}
                onclick={() => onturn(dir)}
            ></button>
        {/each}
    </div>
{/snippet}

<section class="handset" style="{frameSize};--frame-url:url({frameUrl})" aria-label={radio.typeName}>
    <div class="handset__screen" style={place(PARTS.screen)}>
        <Screen />
    </div>

    <img class="handset__frame" src={frameUrl} alt="" draggable="false" />

    {@render knob(PARTS.clickKnob, { group: 'Click sound', down: 'Click sound quieter', up: 'Click sound louder' }, clicks, true)}
    {@render knob(PARTS.volumeKnob, { group: 'Volume', down: 'Volume down', up: 'Volume up' }, volume, radio.power)}

    <button
        type="button"
        class="powerkey"
        style={place(PARTS.powerKey)}
        title={radio.power ? 'Power off' : 'Power on'}
        aria-label="Power"
        aria-pressed={radio.power}
        onmousedown={keepFocus}
        onclick={togglePower}
    ></button>
</section>

<style>
    .handset {
        position: relative;
        pointer-events: none;
    }
    .handset__screen {
        position: absolute;
        pointer-events: auto;
    }
    /* The picture sits over the display; clicks pass through it to the screen and the hotspots. */
    .handset__frame {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        user-select: none;
    }

    /* Hotspots over the knobs and the power key: invisible until hovered. */
    .knob {
        display: contents;
    }
    .knob__half,
    .powerkey {
        position: absolute;
        margin: 0;
        padding: 0;
        background: transparent;
        border: 0;
        cursor: pointer;
        pointer-events: auto;
    }
    .knob__half::before,
    .powerkey::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: #fff;
        opacity: 0;
        transition: opacity var(--au-fast) var(--au-ease);
    }
    /* Lit through the frame's own alpha, so only the metal of the knob brightens. */
    .knob__half::before {
        -webkit-mask: var(--frame-url) no-repeat var(--mask-x) var(--mask-y) / var(--frame-w) var(--frame-h);
        mask: var(--frame-url) no-repeat var(--mask-x) var(--mask-y) / var(--frame-w) var(--frame-h);
    }
    .knob.is-live .knob__half:hover::before,
    .powerkey:hover::before {
        opacity: 0.16;
    }
    .knob.is-live .knob__half:active::before,
    .powerkey:active::before {
        opacity: 0.28;
    }
    .knob:not(.is-live) .knob__half {
        cursor: default;
    }
    .powerkey {
        border-radius: 999px;
    }
    .knob__half:focus-visible,
    .powerkey:focus-visible {
        outline: 2px solid var(--au-focus);
        outline-offset: 0;
    }
</style>
