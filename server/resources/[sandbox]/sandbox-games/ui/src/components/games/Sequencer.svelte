<script>
    import Frame from '../Frame.svelte';
    import Slots from '../Slots.svelte';
    import { game, control } from '../../state/game.svelte.js';
    import { Phases, useInterval, useRaf } from '../../lib/runes.svelte.js';
    import { countdownOf, randInt, toNumber } from '../../lib/random.js';
    import { play } from '../../lib/sounds.js';

    /**
     * Sequencer: keys 1..12 light up one after another (`timer` ms each);
     * repeat the sequence within `limit` ms. Correct within the first 25 % of
     * the time is a perfect result.
     */
    const { params, succeed, fail, timeUp } = control();
    const length = Math.max(1, Math.floor(toNumber(params.difficulty, 4)));
    const flash = Math.max(50, toNumber(params.timer, 300));
    const limit = toNumber(params.limit, 0);
    const mask = Boolean(params.mask);

    const sequence = [];
    while (sequence.length < length) {
        const n = randInt(1, 12);
        if (sequence[sequence.length - 1] !== n) sequence.push(n);
    }

    const phases = new Phases({ countdown: countdownOf(params) });
    let flashed = $state(1);
    let submitting = $state(false);
    let entered = $state([]);
    let time = $state(0);
    const over = $derived(game.result !== null);

    useInterval(
        () => {
            if (flashed >= sequence.length) submitting = true;
            else flashed += 1;
        },
        () => (phases.playing && !submitting && !over ? flash : null),
    );

    useRaf(
        (t) => {
            time = t;
            if (limit && t > limit) timeUp();
        },
        () => phases.playing && submitting && !over && entered.length < length,
    );

    function press(d) {
        if (!phases.playing || !submitting || over || entered.length >= length) return;
        play('beep');
        entered = [...entered, d];
        if (entered.length === length) {
            if (entered.every((v, i) => v === sequence[i])) succeed(limit > 0 && (time / limit) * 100 <= 25);
            else fail({}, 'The order did not match');
        }
    }

    const lit = $derived(phases.playing && !submitting ? sequence[flashed - 1] : null);
    const keys = Array.from({ length: 12 }, (_, k) => k + 1);
</script>

<Frame
    title="Sequence"
    status={submitting ? 'Press the keys in the same order' : 'Watch the keys light up'}
    width={320}
    left={limit > 0 ? limit - (submitting ? time : 0) : null}
    total={limit}
    running={submitting}
    {phases}
>
    <Slots {length} values={entered} {mask} />
    <div class="sq-pad">
        {#each keys as d (d)}
            <button
                type="button"
                class="gm-key"
                class:is-lit={lit === d}
                class:is-quiet={!submitting && lit !== d}
                disabled={!submitting || over || entered.length >= length}
                onmousedown={(e) => e.preventDefault()}
                onclick={() => press(d)}>{d}</button
            >
        {/each}
    </div>
</Frame>

<style>
    .sq-pad {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--au-s2);
        margin-top: var(--au-s4);
    }
</style>
