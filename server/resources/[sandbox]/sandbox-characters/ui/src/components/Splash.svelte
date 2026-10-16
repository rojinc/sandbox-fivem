<script>
    import { Button, onKey } from '@sandbox/ui-kit';
    import { app } from '../state/app.svelte.js';
    import { requestData } from '../lib/flows.js';
    import Page from './common/Page.svelte';

    /**
     * First thing the player sees, and where they return after a logout
     * (APP_RESET). Continue asks Lua for the roster (`GetData`); Lua then
     * drives the rest with LOADING_* / SET_DATA / SET_STATE.
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
    <Page title="Welcome to Los Santos" subline="Connected to SandboxRP">
        <div class="splash">
            <p class="splash__lead">Choose one of your characters, or create a new one, to start playing.</p>
            <Button size="lg" iconRight="arrow-right" onclick={proceed}>Continue</Button>
        </div>
    </Page>
{/if}

<style>
    .splash {
        padding-top: 8px;
    }
    .splash__lead {
        margin: 0 0 24px;
        font-size: var(--au-fs-md);
        color: var(--au-muted);
    }
</style>
