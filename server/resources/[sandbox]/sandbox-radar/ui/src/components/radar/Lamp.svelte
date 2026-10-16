<script>
    /**
     * An indicator lamp printed on the faceplate: a small dot and a word. Lit, it
     * takes its tone; unlit, both stay dark like an unpowered LED.
     * tone: green | amber | red | white | muted. `dot={false}` lights the word only.
     */
    let { on = false, tone = 'green', dot = true, children } = $props();
</script>

<span class="lamp lamp--{tone}" class:lamp--on={on} aria-hidden={on ? undefined : 'true'}>
    {#if dot}<span class="lamp__dot"></span>{/if}
    <span class="lamp__word">{@render children?.()}</span>
</span>

<style>
    .lamp {
        --lit: var(--hud-green);
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 700;
        line-height: 16px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        white-space: nowrap;
        color: var(--au-bg-alt-shade);
        transition: color var(--au-fast) var(--au-ease);
    }
    .lamp--amber {
        --lit: var(--au-warning);
    }
    .lamp--red {
        --lit: var(--hud-red);
    }
    .lamp--white {
        --lit: var(--hud-white);
    }
    .lamp--muted {
        --lit: var(--au-muted);
    }
    .lamp__dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
    }
    .lamp--on {
        color: var(--lit);
    }
</style>
