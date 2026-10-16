<script>
    import { onKey } from '@sandbox/ui-kit/nui';
    import Frame from '../Frame.svelte';
    import { game, control } from '../../state/game.svelte.js';
    import { Phases, useInterval, useRaf } from '../../lib/runes.svelte.js';
    import { clamp, countdownOf, pick, randBelow, range, toNumber } from '../../lib/random.js';
    import { CHARSETS, RANDOM_CHARSETS } from '../../lib/charsets.js';

    /**
     * Pattern: a `size` x 10 grid of `difficulty2`-character cells hides a run
     * of `difficulty` consecutive cells (shown above the grid). Move the
     * cursor with W A S D or the arrows and confirm with Space or Enter within
     * `limit` ms. The grid scrolls one cell every 1.5 s.
     */
    const STAGES = 1;
    const COLS = 10;
    const SHIFT_MS = 1500;
    const CELL_W = 52;
    const GAP = 4;

    const { params, succeed, fail, timeUp } = control();
    const size = clamp(Math.floor(toNumber(params.size, 4)), 1, 10);
    const n = size * COLS;
    const difficulty = clamp(Math.floor(toNumber(params.difficulty, 4)), 1, n);
    const perCell = clamp(Math.floor(toNumber(params.difficulty2, 2)), 1, 4);
    const limit = toNumber(params.limit, 0);

    const charset = CHARSETS[params.total] ?? CHARSETS[pick(RANDOM_CHARSETS)];
    const start = randBelow(n);
    const initial = range(n).map((i) => ({
        id: i,
        text: range(perCell)
            .map(() => charset.charAt(randBelow(charset.length)))
            .join(''),
        isAnswer: (i - start + n) % n < difficulty,
    }));
    const answer = range(difficulty).map((k) => initial[(start + k) % n].text);

    const phases = new Phases({ stages: STAGES, countdown: countdownOf(params) });
    let cells = $state(initial);
    let selected = $state(randBelow(n));
    let time = $state(0);
    let submitted = $state(false);
    const over = $derived(game.result !== null);
    const live = $derived(phases.playing && !over && !submitted);

    useInterval(
        () => (cells = cells.map((_, i, a) => a[(i + 1) % a.length])),
        () => (!submitted && !over ? SHIFT_MS : null),
    );

    useRaf(
        (t) => {
            time = t;
            if (limit && t > limit) timeUp();
        },
        () => phases.playing && !over && !submitted,
    );

    function move(v) {
        if (!live) return false;
        selected = (selected + v + n) % n;
        return true;
    }

    onKey(['w', 'W', 'ArrowUp'], () => move(-COLS));
    onKey(['s', 'S', 'ArrowDown'], () => move(COLS));
    onKey(['a', 'A', 'ArrowLeft'], () => move(-1));
    onKey(['d', 'D', 'ArrowRight'], () => move(1));
    onKey([' ', 'Enter'], (e) => {
        if (!live) return false;
        if (e.repeat) return true;
        submitted = true;
        const ok = range(difficulty).every((k) => cells[(selected + k) % n].isAnswer);
        if (ok) succeed(false);
        else fail({}, 'Wrong cells selected');
        return true;
    });

    const inCursor = (i) => (i - selected + n) % n < difficulty;
    const width = COLS * CELL_W + (COLS - 1) * GAP + 34;
</script>

<Frame
    title="Pattern"
    status="Find this sequence in the grid"
    {width}
    left={limit > 0 ? limit - time : null}
    total={limit}
    {phases}
    stageTexts={['Manual input required']}
>
    <div class="pt-target">
        {#each answer as t, i (i)}
            <span class="pt-chip au-mono">{t}</span>
        {/each}
    </div>
    <div class="pt-grid" style:grid-template-columns="repeat({COLS}, {CELL_W}px)" style:gap="{GAP}px">
        {#each cells as c, i (c.id)}
            <span class="pt-cell au-mono" class:is-cursor={inCursor(i)}>{c.text}</span>
        {/each}
    </div>
</Frame>

<style>
    .pt-target {
        display: flex;
        gap: var(--au-s2);
        padding-bottom: var(--au-s4);
        margin-bottom: var(--au-s4);
        border-bottom: 1px solid var(--au-border);
    }

    .pt-chip {
        display: grid;
        place-items: center;
        min-width: 52px;
        height: 44px;
        padding: 0 var(--au-s2);
        border: 2px solid var(--au-ink);
        font-size: var(--au-fs-md);
        font-weight: 700;
        color: var(--au-text);
    }

    .pt-grid {
        display: grid;
        justify-content: center;
    }

    .pt-cell {
        display: grid;
        place-items: center;
        height: 40px;
        border: 2px solid transparent;
        background: var(--au-bg-shade);
        font-size: var(--au-fs-xs);
        color: var(--au-muted);
    }

    .pt-cell.is-cursor {
        background: var(--au-bg-alt-shade);
        border-color: var(--au-ink);
        color: var(--au-text);
        font-weight: 700;
    }
</style>
