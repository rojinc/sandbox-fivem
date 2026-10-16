<script>
    import Frame from '../Frame.svelte';
        import Alley from './KeymasterAlley.svelte';
    import { game, control } from '../../state/game.svelte.js';
    import { Phases, useRaf } from '../../lib/runes.svelte.js';
    import { asList, clamp, countdownOf, pick, range, shuffle, toNumber } from '../../lib/random.js';
    import { KEYSETS } from '../../lib/keys.js';

    /**
     * Keymaster: keys fall down `difficulty` alleys, each fall taking a random
     * `timer` [min, max] ms; press the alley's key as its cap reaches the
     * bottom zone. More than `chances` misses fails; lasting `limit` ms succeeds.
     */
    const STAGES = 3;
    const ALLEY_W = 112;
    const GAP = 12;

    const { params, succeed, fail } = control();
    const alleys = clamp(Math.floor(toNumber(params.difficulty, 3)), 1, 4);
    const chances = Math.max(0, Math.floor(toNumber(params.chances, 5)));
    const limit = Math.max(100, toNumber(params.limit, 40000));
    const timer = asList(params.timer);
    const fallRange =
        timer.length >= 2 ? [toNumber(timer[0], 2000), toNumber(timer[1], 4000)] : [toNumber(params.timer, 3000), toNumber(params.timer, 3000)];

    const keys = params.randomKey === false ? KEYSETS[1] : pick(KEYSETS);
    const order = params.shuffled ? shuffle(range(alleys)) : range(alleys);

    const phases = new Phases({ stages: STAGES, countdown: countdownOf(params) });
    let misses = $state(0);
    let time = $state(0);
    const over = $derived(game.result !== null);
    const active = $derived(phases.playing && !over);

    useRaf(
        (t) => {
            time = t;
            if (t > limit) succeed(false);
        },
        () => phases.playing && !over,
    );

    function onMiss() {
        misses += 1;
        if (phases.playing && misses > chances) fail({}, 'Too many missed keys');
    }

    const width = Math.max(400, alleys * ALLEY_W + (alleys - 1) * GAP + 36);
    const mistakesLeft = (n) => (n <= 0 ? 'No mistakes left' : n === 1 ? 'One mistake left' : `${n} mistakes left`);
</script>

<Frame
    title="Keymaster"
    status="Press each key as it lands"
    {width}
    left={limit - time}
    total={limit}
    {phases}
    successText="Verification complete"
    failText="Verification failed"
>
    {#snippet facts()}
        {mistakesLeft(chances - misses)}
    {/snippet}
    <div class="km-alleys" style:gap="{GAP}px">
        {#each order as keyIndex, i (keyIndex)}
            <Alley keyChar={keys[keyIndex]} first={keyIndex === 1 && i === 0} {fallRange} {active} {onMiss} />
        {/each}
    </div>
</Frame>

<style>
    .km-alleys {
        display: flex;
        justify-content: center;
        height: 440px;
    }
</style>
