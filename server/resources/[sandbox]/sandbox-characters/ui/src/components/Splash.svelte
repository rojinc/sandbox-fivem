<script>
    import { Button, onKey } from '@sandbox/ui-kit';
    import { app } from '../state/app.svelte.js';
    import { characters } from '../state/characters.svelte.js';
    import { requestData } from '../lib/flows.js';
    import logo from '../assets/logo.webp';

    /**
     * First thing the player sees, and where they return after a logout
     * (APP_RESET). It sits straight on the world (no panel). Continue asks Lua
     * for the roster (`GetData`) once; Lua then drives the rest with
     * LOADING_* / SET_DATA / SET_STATE.
     */
    let fired = false;

    function proceed() {
        if (fired) return;
        fired = true;
        requestData();
    }

    onKey(['Enter', ' '], (e) => {
        if (e.repeat || app.loading) return false;
        proceed();
    });
</script>

{#if !app.loading}
    <div class="welcome">
        <img class="welcome__logo" src={logo} alt="SandboxRP" draggable="false" />
        <h1 class="welcome__title au-overworld">Enter Los Santos</h1>
        <p class="welcome__line au-overworld">Connected to {characters.serverName}. Continue to choose or create a character.</p>
        <Button size="lg" iconRight="arrow-right" onclick={proceed}>Continue</Button>
    </div>
{/if}

<style>
    .welcome {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
    }
    .welcome__logo {
        height: 96px;
        width: auto;
        margin-bottom: 12px;
    }
    .welcome__title {
        margin: 0;
        font-size: var(--au-fs-xl);
    }
    .welcome__line {
        margin: 0 0 16px;
        max-width: none;
        font-size: var(--au-fs-sm);
    }
</style>
