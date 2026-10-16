<script>
    import { onKey } from '@sandbox/ui-kit/nui';
    import Frame from '../Frame.svelte';
    import { game, control } from '../../state/game.svelte.js';
    import { useRaf } from '../../lib/runes.svelte.js';
    import { pick, randInt, toNumber } from '../../lib/random.js';
    import { KEYMAP, bothCases } from '../../lib/keys.js';

    /**
     * Round skill check: the needle sweeps the ring at `rate` degrees per 10 ms;
     * press the key in the centre while the needle is inside the window
     * (difficulty / 10 rad long, starting at a random 2.0..4.0 rad). Any other
     * key of E Q R 1 2 3 4 fails, and so does a full turn.
     */
    const SIZE = 184;
    const R = 76;
    const C = 2 * Math.PI * R;
    const NEEDLE_RAD = 0.1;

    const { params, succeed, fail } = control();
    const rate = Math.max(0.01, toNumber(params.rate, 1));
    const difficulty = Math.max(2, toNumber(params.difficulty, 2));
    const key = params.randomKey ? pick(['1', '2', '3']) : 'e';
    const start = randInt(20, 40) / 10;
    const end = start + difficulty / 10;
    const startDeg = (start * 180) / Math.PI;
    const lenDeg = ((end - start) * 180) / Math.PI;
    const fullTurnMs = (360 / rate) * 10;

    let deg = $state(0);
    let raw = 0;
    let pressed = false;
    const over = $derived(game.result !== null);
    const won = $derived(game.result === 'success' || game.result === 'perfect');

    useRaf(
        (t) => {
            const d = (t / 10) * rate;
            raw = d;
            deg = Math.min(360, d);
            if (d + rate > 360) {
                pressed = true;
                fail();
            }
        },
        () => !over,
    );

    onKey(bothCases(key), (e) => {
        if (over) return false;
        if (e.repeat || pressed) return true;
        pressed = true;
        if (raw >= startDeg && raw <= startDeg + lenDeg + 5) succeed(false);
        else fail();
        return true;
    });

    onKey(KEYMAP.filter((k) => k !== key).flatMap(bothCases), (e) => {
        if (over) return false;
        if (e.repeat || pressed) return true;
        pressed = true;
        fail();
        return true;
    });

    const needleDeg = (NEEDLE_RAD * 180) / Math.PI;
</script>

<Frame title="Skill check" width={232} left={fullTurnMs * (1 - deg / 360)} total={fullTurnMs} cover={false} failText="Missed">
    <div class="rs" class:is-ok={won} class:is-bad={over && !won}>
        <svg width={SIZE} height={SIZE} viewBox="0 0 {SIZE} {SIZE}" aria-hidden="true">
            <circle class="rs-track" cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke-width="12" />
            <circle
                class="rs-window"
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={R}
                fill="none"
                stroke-width="12"
                stroke-dasharray="{(C * lenDeg) / 360} {C}"
                transform="rotate({startDeg - 90} {SIZE / 2} {SIZE / 2})"
            />
            <circle
                class="rs-needle"
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={R}
                fill="none"
                stroke-width="24"
                stroke-dasharray="{R * NEEDLE_RAD} {C}"
                transform="rotate({deg - 90 - needleDeg} {SIZE / 2} {SIZE / 2})"
            />
        </svg>
        <span class="rs-key au-mono">{key.toUpperCase()}</span>
    </div>
</Frame>

<style>
    .rs {
        position: relative;
        width: 184px;
        height: 184px;
        margin: 0 auto;
    }

    .rs-track {
        stroke: var(--au-bg-alt-shade);
    }

    .rs-window {
        stroke: var(--au-action);
        transition: stroke var(--au-fast) var(--au-ease);
    }

    .rs-needle {
        stroke: var(--au-text);
    }

    .rs-key {
        position: absolute;
        left: 50%;
        top: 50%;
        display: grid;
        place-items: center;
        width: 64px;
        height: 64px;
        margin: -32px 0 0 -32px;
        border-radius: var(--au-radius);
        border: 1px solid var(--au-border-strong);
        background: var(--au-bg-alt);
        font-size: var(--au-fs-xl);
        font-weight: 500;
        color: var(--au-text);
        transition:
            background var(--au-fast) var(--au-ease),
            color var(--au-fast) var(--au-ease),
            border-color var(--au-fast) var(--au-ease);
    }

    .is-ok .rs-window {
        stroke: var(--au-success);
    }

    .is-ok .rs-key {
        background: var(--au-success-bg);
        border-color: var(--au-success-bg);
        color: var(--au-success);
    }

    .is-bad .rs-window {
        stroke: var(--au-error);
    }

    .is-bad .rs-key {
        background: var(--au-error-bg);
        border-color: var(--au-error-bg);
        color: var(--au-error);
    }
</style>
