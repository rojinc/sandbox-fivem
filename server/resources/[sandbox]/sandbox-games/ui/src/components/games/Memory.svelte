<script>
    import Frame from '../Frame.svelte';
    import Readout from '../Readout.svelte';
    import { game, control } from '../../state/game.svelte.js';
    import { Phases, useRaf } from '../../lib/runes.svelte.js';
    import { clamp, countdownOf, range, shuffle, toNumber } from '../../lib/random.js';
    import { play } from '../../lib/sounds.js';

    /**
     * Memory: `difficulty` tiles of a rows x cols grid light up for `timer` ms;
     * then click them all within `limit` ms. `errors` wrong tiles fail. No
     * wrong tile is a perfect result.
     */
    const { params, succeed, fail } = control();
    const cols = clamp(Math.floor(toNumber(params.cols, 3)), 1, 12);
    const rows = clamp(Math.floor(toNumber(params.rows, 3)), 1, 12);
    const total = cols * rows;
    const active = clamp(Math.floor(toNumber(params.difficulty, 3)), 1, total);
    const errors = Math.max(1, Math.floor(toNumber(params.errors, 1)));
    const preview = toNumber(params.timer, 0);
    const limit = toNumber(params.limit, 0);

    const targets = new Set(shuffle(range(total, 1)).slice(0, active));
    const phases = new Phases({ countdown: countdownOf(params) });
    let previewing = $state(true);
    let clicked = $state([]);
    let time = $state(0);
    let previewTime = 0;
    const over = $derived(game.result !== null);

    const strikes = $derived(clicked.filter((c) => !targets.has(c)).length);
    const found = $derived(clicked.filter((c) => targets.has(c)).length);
    const done = $derived(found >= active || strikes >= errors);

    useRaf(
        (_, dt) => {
            if (previewing) {
                previewTime += dt;
                if (previewTime > preview) previewing = false;
                return;
            }
            time += dt;
            if (limit && time > limit) fail();
        },
        () => phases.playing && !over && !done,
    );

    function click(cell) {
        if (!phases.playing || previewing || over || done || clicked.includes(cell)) return;
        play('beep');
        clicked = [...clicked, cell];
        const s = clicked.filter((c) => !targets.has(c)).length;
        const f = clicked.length - s;
        if (f >= active || s >= errors) {
            if (f >= active && s < errors) succeed(s === 0);
            else fail();
        }
    }

    const size = clamp(Math.floor(320 / Math.max(cols, rows)), 32, 56);
    const gap = 6;
    const clickable = $derived(phases.playing && !previewing && !over && !done);
    const cells = range(total, 1);
</script>

<Frame
    title="Memory"
    status={previewing ? 'Remember the tiles' : 'Select the tiles'}
    width={Math.max(280, cols * size + (cols - 1) * gap + 34)}
    left={limit > 0 ? limit - time : null}
    total={limit}
    running={!previewing}
    {phases}
>
    {#snippet meta()}
        {#if !previewing}<Readout label="Mistakes left" value={Math.max(0, errors - 1 - strikes)} />{/if}
    {/snippet}
    <div class="mm-grid" class:is-live={clickable} style:grid-template-columns="repeat({cols}, {size}px)" style:grid-auto-rows="{size}px" style:gap="{gap}px">
        {#each cells as i (i)}
            {@const picked = clicked.includes(i)}
            <button
                type="button"
                class="mm-cell"
                class:is-show={phases.playing && previewing && targets.has(i)}
                class:is-hit={picked && targets.has(i)}
                class:is-wrong={picked && !targets.has(i)}
                class:is-missed={over && !picked && targets.has(i)}
                disabled={!clickable || picked}
                aria-label="Tile {i}"
                onmousedown={(e) => {
                    e.preventDefault();
                    click(i);
                }}
            ></button>
        {/each}
    </div>
</Frame>

<style>
    .mm-grid {
        display: grid;
        justify-content: center;
    }

    .mm-cell {
        appearance: none;
        padding: 0;
        border: 1px solid var(--au-border);
        border-radius: var(--au-radius);
        background: var(--au-bg-alt);
        cursor: default;
        transition:
            background var(--au-fast) var(--au-ease),
            border-color var(--au-fast) var(--au-ease);
    }

    .is-live .mm-cell:not(:disabled) {
        cursor: pointer;
    }

    .is-live .mm-cell:not(:disabled):hover {
        background: var(--au-bg-alt-shade);
        border-color: var(--au-border-strong);
    }

    .mm-cell.is-show {
        background: var(--au-action);
        border-color: var(--au-action);
    }

    .mm-cell.is-hit {
        background: var(--au-success);
        border-color: var(--au-success);
    }

    .mm-cell.is-wrong {
        background: var(--au-error);
        border-color: var(--au-error);
    }

    .mm-cell.is-missed {
        background: var(--au-action-soft);
        border-color: var(--au-action);
    }
</style>
