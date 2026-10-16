<script>
    import { onKey } from '@sandbox/ui-kit/nui';
    import Frame from '../Frame.svelte';
    import { game, control } from '../../state/game.svelte.js';
    import { useRaf } from '../../lib/runes.svelte.js';
    import { toNumber } from '../../lib/random.js';

    /**
     * Skillbar: the bar fills over `timer` ms; press E while it is inside a
     * window of `difficulty` % that starts at a random 35..35+difficulty %.
     * Running out of bar fails.
     */
    const { params, succeed, fail } = control();
    const timer = Math.max(100, toNumber(params.timer, 3000));
    const difficulty = Math.max(1, toNumber(params.difficulty, 10));
    const chance = Math.floor(Math.random() * difficulty) + 35;
    const zoneWidth = Math.min(difficulty, 100 - chance);

    let pct = $state(0);
    let elapsed = $state(0);
    let pressed = false;
    const over = $derived(game.result !== null);
    const won = $derived(game.result === 'success' || game.result === 'perfect');

    useRaf(
        (t) => {
            if (t > timer) {
                pressed = true;
                fail();
                return;
            }
            elapsed = t;
            pct = Math.min(100, (t / timer) * 100);
        },
        () => !over,
    );

    onKey(['e', 'E'], (e) => {
        if (over) return false;
        if (e.repeat || pressed) return true;
        pressed = true;
        const p = Math.ceil(pct);
        if (p >= chance && p <= chance + difficulty) succeed(false);
        else fail();
        return true;
    });
</script>

<Frame title="Skill check" width={480} left={timer - elapsed} total={timer} cover={false} failText="Missed">
    <div class="sb-track" class:is-ok={won} class:is-bad={over && !won}>
        <div class="sb-fill" style:width="{pct}%"></div>
        <div class="sb-zone" style:left="{chance}%" style:width="{zoneWidth}%">
            <span class="sb-key au-mono">E</span>
        </div>
        <div class="sb-cursor" style:left="{pct}%"></div>
    </div>
</Frame>

<style>
    .sb-track {
        position: relative;
        height: 40px;
        border-radius: var(--au-radius);
        background: var(--au-bg-sunk);
        border: 1px solid var(--au-border);
        overflow: hidden;
    }

    .sb-fill {
        position: absolute;
        inset: 0 auto 0 0;
        background: var(--au-bg-alt);
    }

    .sb-zone {
        position: absolute;
        top: 0;
        bottom: 0;
        display: grid;
        place-items: center;
        background: var(--au-action-soft);
        transition: background var(--au-fast) var(--au-ease);
    }

    .sb-key {
        font-size: var(--au-fs-sm);
        font-weight: 500;
        color: var(--au-action);
    }

    .sb-cursor {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 2px;
        margin-left: -1px;
        background: var(--au-text);
    }

    .is-ok .sb-zone {
        background: var(--au-success-bg);
    }

    .is-ok .sb-key {
        color: var(--au-success);
    }

    .is-ok .sb-cursor {
        background: var(--au-success);
    }

    .is-bad .sb-cursor {
        background: var(--au-error);
    }
</style>
