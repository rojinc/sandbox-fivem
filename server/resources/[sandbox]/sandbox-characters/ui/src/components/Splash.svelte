<script>
    import { Button, Kbd, onKey } from '@sandbox/ui-kit';
    import { requestData } from '../lib/flows.js';
    import logo from '../assets/logo.webp';

    /**
     * First thing the player sees, and the screen they return to after a
     * logout (APP_RESET). A key press or click asks Lua for the roster
     * (`GetData`); Lua then drives the rest with LOADING_* / SET_DATA / SET_STATE.
     */
    let fired = false;

    function proceed() {
        if (fired) return;
        fired = true;
        requestData();
    }

    onKey(['Enter', ' '], (e) => {
        if (e.repeat) return false;
        proceed();
    });
</script>

<svelte:window onclick={(e) => e.button === 0 && proceed()} />

<div class="splash">
    <div class="splash__panel au-page">
        <div class="splash__band au-dark">
            <img class="splash__logo" src={logo} alt="SandboxRP" draggable="false" />
        </div>
        <div class="splash__body">
            <h1>Welcome to SandboxRP</h1>
            <p>Choose one of your characters, or create a new one, to enter Los Santos.</p>
            <Button size="lg" onclick={proceed}>Continue</Button>
            <p class="splash__hint au-hint">Press <Kbd>Enter</Kbd> or click anywhere to continue</p>
        </div>
    </div>
</div>

<style>
    .splash {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        cursor: pointer;
    }
    .splash__panel {
        width: 640px;
        animation: au-rise-in var(--au-normal) var(--au-ease);
    }
    .splash__band {
        display: flex;
        justify-content: center;
        padding: 32px 40px;
        background: var(--au-bg);
    }
    .splash__logo {
        height: 96px;
        width: auto;
    }
    .splash__body {
        padding: 32px 40px 28px;
        text-align: center;
    }
    .splash__body p {
        max-width: none;
    }
    .splash__hint {
        margin: 20px 0 0;
    }
</style>
