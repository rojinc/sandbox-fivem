<script>
    import Frame from '../Frame.svelte';
    import Readout from '../Readout.svelte';
    import { game, control } from '../../state/game.svelte.js';
    import { Phases, useRaf, useTimeout } from '../../lib/runes.svelte.js';
    import { countdownOf, range, shuffle, toNumber } from '../../lib/random.js';
    import { play } from '../../lib/sounds.js';

    /**
     * Scrambler: `difficulty` numbers in a scrambled 4-column grid; press them
     * in order 1, 2, 3... The layout reshuffles every `timer` ms. `total`
     * wrong presses are tolerated, the next one fails. `limit` ms overall.
     * No wrong press is a perfect result.
     */
    const { params, succeed, fail } = control();
    const numbers = Math.max(1, Math.floor(toNumber(params.difficulty, 8)));
    const strikesAllowed = Math.max(0, Math.floor(toNumber(params.total, 0)));
    const change = toNumber(params.timer, 0);
    const limit = toNumber(params.limit, 0);

    const phases = new Phases({ countdown: countdownOf(params) });
    let layout = $state(shuffle(range(numbers, 1)));
    let entered = $state(0);
    let strikes = $state(0);
    let submitting = $state(false);
    let time = $state(0);
    let sinceShuffle = 0;
    const over = $derived(game.result !== null);
    const done = $derived(entered >= numbers);

    // After every reshuffle (and once at the start) the reshuffle clock waits a second.
    useTimeout(
        () => (submitting = true),
        () => (!submitting ? 1000 : null),
    );

    useRaf(
        (_, dt) => {
            time += dt;
            if (limit && time > limit) {
                fail();
                return;
            }
            if (submitting && change > 0) {
                sinceShuffle += dt;
                if (sinceShuffle > change) {
                    sinceShuffle = 0;
                    submitting = false;
                    layout = shuffle(range(numbers, 1));
                }
            }
        },
        () => phases.playing && !over && !done,
    );

    function press(d) {
        if (!phases.playing || over || done) return;
        if (change > 0 && sinceShuffle >= change) return;
        if (d === entered + 1) {
            play('beep');
            entered += 1;
            if (entered >= numbers) succeed(strikes === 0);
        } else if (strikes >= strikesAllowed) {
            fail();
        } else {
            play('negative');
            strikes += 1;
        }
    }

    const cols = Math.min(4, numbers);
</script>

<Frame title="Scrambler" width={cols * 64 + (cols - 1) * 8 + 34} left={limit > 0 ? limit - time : null} total={limit} {phases}>
    {#snippet meta()}
        <Readout label="Mistakes left" value={strikesAllowed - strikes} tone={strikes >= strikesAllowed ? 'error' : undefined} />
    {/snippet}
    <div class="sr-grid" style:grid-template-columns="repeat({cols}, 64px)">
        {#each layout as d (d)}
            <button
                type="button"
                class="gm-key"
                class:is-done={d <= entered}
                disabled={!phases.playing || over || d <= entered}
                onmousedown={(e) => e.preventDefault()}
                onclick={() => press(d)}>{d}</button
            >
        {/each}
    </div>
</Frame>

<style>
    .sr-grid {
        display: grid;
        gap: var(--au-s2);
        justify-content: center;
    }

    .sr-grid :global(.gm-key) {
        height: 56px;
    }
</style>
