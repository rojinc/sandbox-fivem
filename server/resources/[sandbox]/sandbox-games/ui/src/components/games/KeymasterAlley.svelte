<script>
    import { untrack } from 'svelte';
    import { onKey } from '@sandbox/ui-kit/nui';
    import { useRaf, useTimeout } from '../../lib/runes.svelte.js';
    import { bothCases } from '../../lib/keys.js';
    import { play } from '../../lib/sounds.js';

    /**
     * One alley: after a random pause a key falls for a random time from
     * `fallRange`; pressing it while its cap is between 76 % and 88 % of the
     * fall is a hit. Pressing outside that window, or letting it reach the
     * bottom, calls onMiss.
     */
    let { keyChar, first = false, fallRange, active, onMiss } = $props();

    const ZONE = [76, 88];
    const KEY = 44;

    let falling = $state(false);
    let speed = 0;
    // The alley's key and whether it opens the game are fixed for its lifetime.
    const char = untrack(() => keyChar);
    let delay = $state((untrack(() => first) ? 100 : 300) * (Math.random() * 3 + 1));
    let pct = $state(0);
    let raw = 0;
    let flash = $state(null); // 'hit' | 'miss' for 250 ms after a press

    function endFall() {
        raw = 0;
        pct = 0;
        falling = false;
        delay = 300 * (Math.random() * 3 + 1);
    }

    useTimeout(
        () => {
            speed = Math.random() * (fallRange[1] - fallRange[0]) + fallRange[0];
            falling = true;
        },
        () => (active && !falling ? delay : null),
    );

    useRaf(
        (t) => {
            const p = (t / Math.max(1, speed)) * 100;
            raw = p;
            pct = Math.min(100, p);
            if (p >= 100) {
                play('negative');
                onMiss();
                endFall();
            }
        },
        () => active && falling,
    );

    onKey(bothCases(char), (e) => {
        if (!active) return false;
        if (e.repeat || !falling) return true;
        if (raw >= ZONE[0] && raw <= ZONE[1]) {
            play('beep');
            flash = 'hit';
        } else {
            play('negative');
            flash = 'miss';
            onMiss();
        }
        endFall();
        return true;
    });

    useTimeout(
        () => (flash = null),
        () => (flash ? 250 : null),
    );

    const label = char.toUpperCase();
</script>

<div class="km-alley">
    <div class="km-zone" style:top="{ZONE[0]}%" style:height="calc({ZONE[1] - ZONE[0]}% + {KEY}px)"></div>
    <div class="km-receptor au-mono" class:is-hit={flash === 'hit'} class:is-miss={flash === 'miss'}>{label}</div>
    {#if falling}
        <div class="km-cap au-mono" style:top="{pct}%">{label}</div>
    {/if}
</div>

<style>
    .km-alley {
        position: relative;
        width: 112px;
        height: 100%;
        overflow: hidden;
        background: var(--au-bg-sunk);
        border: 2px solid var(--au-border);
    }

    .km-zone {
        position: absolute;
        left: 0;
        right: 0;
        background: var(--au-action-soft);
    }

    .km-cap,
    .km-receptor {
        position: absolute;
        left: 50%;
        display: grid;
        place-items: center;
        width: 44px;
        height: 44px;
        margin-left: -22px;
        font-size: var(--au-fs-md);
        font-weight: 700;
    }

    .km-cap {
        background: var(--au-ink);
        color: var(--au-on-ink);
    }

    .km-receptor {
        bottom: 8px;
        border: 2px solid var(--au-action);
        color: var(--au-action);
    }

    .km-receptor.is-hit {
        background: var(--au-success);
        border-color: var(--au-success);
        color: var(--au-on-ink);
    }

    .km-receptor.is-miss {
        background: var(--au-error);
        border-color: var(--au-error);
        color: var(--au-on-ink);
    }
</style>
