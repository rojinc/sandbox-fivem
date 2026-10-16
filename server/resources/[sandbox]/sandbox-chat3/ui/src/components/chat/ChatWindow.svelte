<script>
    import { untrack } from 'svelte';
    import { fade } from 'svelte/transition';
    import { screen } from '../../state/screen.svelte.js';
    import { chat } from '../../state/chat.svelte.js';
    import MessageLog from './MessageLog.svelte';
    import InputBar from './InputBar.svelte';

    /**
     * Top-left chat: one dark translucent log panel, which fades out when idle,
     * plus the input strip and command list while Lua has handed us focus.
     */

    /** How long the log lingers after the input closes. */
    const LINGER_MS = 2500;
    /** How long a new line keeps the log visible while the chat is closed. */
    const PREVIEW_MS = 6000;

    let showing = $state(!screen.hidden);
    let previewing = $state(false);
    let log = $state(null);
    let zoom = $state(1);

    // Open: show at once. Closed: linger briefly, then fade.
    $effect(() => {
        if (!screen.hidden) {
            showing = true;
            return undefined;
        }
        const t = setTimeout(() => (showing = false), LINGER_MS);
        return () => clearTimeout(t);
    });

    // A line arriving while closed previews the log for a while.
    $effect(() => {
        const seq = chat.seq;
        if (!seq || !untrack(() => screen.hidden)) return undefined;
        previewing = true;
        const t = setTimeout(() => (previewing = false), PREVIEW_MS);
        return () => clearTimeout(t);
    });

    // Chrome is sized in px for 1080p; scale the column up on larger screens so the log stays readable.
    $effect(() => {
        const apply = () => (zoom = Math.min(2, Math.max(1, window.innerWidth / 1920)));
        apply();
        window.addEventListener('resize', apply);
        return () => window.removeEventListener('resize', apply);
    });

    const visible = $derived(showing || previewing);
</script>

<div class="chat" class:is-interactive={screen.inputting} style="zoom:{zoom}">
    {#if visible}
        <div class="chat__log" in:fade={{ duration: 200 }} out:fade={{ duration: 320 }}>
            <MessageLog bind:this={log} interactive={screen.inputting} />
        </div>
    {/if}
    {#if screen.inputting}
        <InputBar {log} />
    {/if}
</div>

<style>
    .chat {
        position: absolute;
        top: 24px;
        left: 24px;
        width: 560px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        pointer-events: none;
    }
    .chat.is-interactive {
        pointer-events: auto;
    }
    /* --au-bg (#181a1d) at 82 %, so the world shows faintly through the log. */
    .chat__log {
        background: rgba(24, 26, 29, 0.82);
        color: var(--au-text);
        border: 1px solid var(--au-border);
        border-radius: var(--au-radius-lg);
        box-shadow: var(--au-shadow-1);
        overflow: hidden;
    }
</style>
