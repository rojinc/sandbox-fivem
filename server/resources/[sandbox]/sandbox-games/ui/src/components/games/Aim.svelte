<script>
    import Frame from '../Frame.svelte';
        import { game, control } from '../../state/game.svelte.js';
    import { Phases, useRaf } from '../../lib/runes.svelte.js';
    import { clamp, countdownOf, toNumber } from '../../lib/random.js';
    import { legPos, newLeg } from '../../lib/motion.js';
    import { play } from '../../lib/sounds.js';

    /**
     * Aim: a target appears every `timer` ms (the first after timer / 4) and
     * grows one px every `difficulty` ms; once it has grown `maxSize` px it
     * counts as a miss. Clicking the empty field is a miss too. After `limit`
     * ms the accuracy must reach `accuracy` %; 100 % is perfect.
     */
    const STAGES = 3;
    const FIELD_W = 1120;
    const FIELD_H = 600;
    const INSET = 75;
    const BOUNDS = { w: FIELD_W - INSET * 2, h: FIELD_H - INSET * 2 };

    const { params, succeed, fail } = control();
    const limit = Math.max(100, toNumber(params.limit, 15000));
    const spawnEvery = Math.max(50, toNumber(params.timer, 1000));
    const startSize = Math.max(6, toNumber(params.startSize ?? params.size, 30));
    const maxSize = Math.max(1, toNumber(params.maxSize, 75));
    const growthRate = Math.max(1, toNumber(params.difficulty, 15));
    const required = clamp(toNumber(params.accuracy, 50), 0, 100);
    const moving = Boolean(params.isMoving);

    const phases = new Phases({ stages: STAGES, countdown: countdownOf(params) });
    let targets = $state([]);
    let hits = $state(0);
    let misses = $state(0);
    let time = $state(0);
    let nextSpawn = spawnEvery / 4;
    let nextId = 1;
    const over = $derived(game.result !== null);
    const accuracy = $derived(hits + misses > 0 ? Math.floor((hits / (hits + misses)) * 100) : 0);

    useRaf(
        (t) => {
            if (t > limit) {
                if (accuracy >= required) succeed(accuracy === 100);
                else fail();
                return;
            }
            time = t;
            const list = targets.slice();
            if (t >= nextSpawn) {
                nextSpawn += spawnEvery;
                const x = Math.random() * Math.max(1, BOUNDS.w - startSize);
                const y = Math.random() * Math.max(1, BOUNDS.h - startSize);
                list.push({ id: nextId++, x, y, born: t, grow: 0, leg: moving ? newLeg({ x, y }, BOUNDS, [25, 50], t) : null });
            }
            const alive = [];
            for (const target of list) {
                const grow = Math.min(maxSize, Math.floor((t - target.born) / growthRate));
                if (grow >= maxSize) {
                    misses += 1;
                    play('negative');
                    continue;
                }
                let { x, y, leg } = target;
                if (leg) {
                    const p = legPos(leg, t);
                    x = p.x;
                    y = p.y;
                    if (p.done) leg = newLeg({ x, y }, BOUNDS, [25, 50], t);
                }
                alive.push({ ...target, x, y, leg, grow });
            }
            targets = alive;
        },
        () => phases.playing && !over,
    );

    function hit(e, id) {
        e.stopPropagation();
        e.preventDefault();
        if (!phases.playing || over) return;
        targets = targets.filter((t) => t.id !== id);
        hits += 1;
        play('beep');
    }

    function miss(e) {
        e.preventDefault();
        if (!phases.playing || over) return;
        misses += 1;
    }
</script>

<Frame
    title="Target verification"
    status="Click each target before it disappears"
    left={limit - time}
    total={limit}
    {phases}
    flush
    successText="Verification complete"
    failText="Verification failed"
    caption="{accuracy}% accuracy, {required}% needed"
>
    {#snippet facts()}
        {accuracy}% accuracy, {required}% needed
    {/snippet}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="am-field" class:is-live={phases.playing && !over} style:width="{FIELD_W}px" style:height="{FIELD_H}px" onmousedown={miss}>
        {#each targets as t (t.id)}
            {@const size = startSize + t.grow}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
                class="am-target"
                class:is-late={t.grow / maxSize > 0.7}
                style:left="{INSET + t.x}px"
                style:top="{INSET + t.y}px"
                style:width="{size}px"
                style:height="{size}px"
                onmousedown={(e) => hit(e, t.id)}
            >
                <span class="am-dot" style:width="{Math.max(4, size * 0.22)}px" style:height="{Math.max(4, size * 0.22)}px"></span>
            </div>
        {/each}
    </div>
</Frame>

<style>
    .am-field {
        position: relative;
        max-width: 100%;
        overflow: hidden;
        background: var(--au-bg-sunk);
    }

    .am-field.is-live {
        cursor: crosshair;
    }

    .am-target {
        position: absolute;
        display: grid;
        place-items: center;
        border-radius: 50%;
        border: 2px solid var(--au-action);
        background: var(--au-action-soft);
        cursor: crosshair;
    }

    .am-dot {
        border-radius: 50%;
        background: var(--au-action);
    }

    .am-target.is-late {
        border-color: var(--au-error);
        background: var(--au-error-bg);
    }

    .am-target.is-late .am-dot {
        background: var(--au-error);
    }
</style>
