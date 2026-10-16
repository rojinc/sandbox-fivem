<script>
    import { onKey } from '@sandbox/ui-kit/nui';
    import Frame from '../Frame.svelte';
    import { game, control } from '../../state/game.svelte.js';
    import { Phases, useInterval } from '../../lib/runes.svelte.js';
    import { clamp, countdownOf, pick, toNumber } from '../../lib/random.js';
    import { KEYMAP, bothCases } from '../../lib/keys.js';

    /**
     * Scanner: a lit bar bounces across `total` bars, one step every `timer`
     * ms. Press the key while it is within `difficulty` bars of the target;
     * exactly on the target is a perfect result. `limit` ms of sweeping fails.
     */
    const { params, succeed, fail, hasPerfect } = control();
    const total = Math.max(2, Math.floor(toNumber(params.total, 20)));
    const difficulty = Math.max(0, Math.floor(toNumber(params.difficulty, 0)));
    const step = Math.max(10, toNumber(params.timer, 100));
    const limit = toNumber(params.limit, 0);

    const min = difficulty === 0 ? 1 : 1 + difficulty;
    const max = total - difficulty;
    const span = max - min + 1 - difficulty;
    const chance = span > 0 ? Math.floor(Math.random() * span) + min : clamp(Math.round(total / 2), 1, total);
    const key = params.randomKey ? pick(KEYMAP) : 'e';
    const r = Math.max(1, Math.ceil(Math.random() * (total - 1)));

    const phases = new Phases({ countdown: countdownOf(params) });
    let current = $state(r);
    let dir = r === total - 1 ? -1 : 1;
    let time = $state(0);
    let pressed = false;
    const over = $derived(game.result !== null);
    const won = $derived(game.result === 'success' || game.result === 'perfect');

    useInterval(
        () => {
            if (over || pressed) return;
            if (limit && time > limit) {
                pressed = true;
                fail();
                return;
            }
            const next = current + dir;
            if (next >= total) dir = -1;
            else if (next <= 1) dir = 1;
            current = next;
            time += step;
        },
        () => (phases.playing && !over ? step : null),
    );

    onKey(bothCases(key), (e) => {
        if (over || !phases.playing) return false;
        if (e.repeat || pressed) return true;
        pressed = true;
        if (current >= chance - difficulty && current <= chance + difficulty) succeed(current === chance);
        else fail();
        return true;
    });

    const bars = Array.from({ length: total }, (_, k) => k + 1);
</script>

<Frame title="Scanner" width={720} left={limit > 0 ? limit - time : null} total={limit} {phases} failText="Missed">
    <div class="sc-bars" class:is-ok={won} class:is-bad={over && !won}>
        {#each bars as i (i)}
            {@const zone = i >= chance - difficulty && i <= chance + difficulty}
            <div class="sc-bar" class:is-zone={zone} class:is-target={i === chance && (hasPerfect || difficulty === 0)} class:is-lit={current === i}>
                {#if i === chance}<span class="sc-key au-mono">{key.toUpperCase()}</span>{/if}
            </div>
        {/each}
    </div>
</Frame>

<style>
    .sc-bars {
        display: flex;
        gap: var(--au-s1);
        height: 112px;
    }

    .sc-bar {
        flex: 1;
        display: grid;
        place-items: center;
        border-radius: var(--au-radius);
        border: 1px solid transparent;
        background: var(--au-bg-alt);
    }

    .sc-bar.is-zone {
        background: var(--au-action-soft);
    }

    .sc-bar.is-target {
        border-color: var(--au-action);
    }

    .sc-bar.is-lit {
        background: var(--au-text);
        border-color: var(--au-text);
    }

    .sc-key {
        font-size: var(--au-fs-sm);
        font-weight: 500;
        color: var(--au-action);
    }

    .sc-bar.is-lit .sc-key {
        color: var(--au-action-contrast);
    }

    .is-ok .sc-bar.is-lit {
        background: var(--au-success);
        border-color: var(--au-success);
    }

    .is-bad .sc-bar.is-lit {
        background: var(--au-error);
        border-color: var(--au-error);
    }
</style>
