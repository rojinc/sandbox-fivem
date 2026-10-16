<script>
    import Frame from '../Frame.svelte';
        import { game, control } from '../../state/game.svelte.js';
    import { Phases, useRaf, useTimeout } from '../../lib/runes.svelte.js';
    import { clamp, countdownOf, shuffle, toNumber } from '../../lib/random.js';
    import { legPos, newLeg } from '../../lib/motion.js';
    import { play } from '../../lib/sounds.js';

    /**
     * Tracking: `difficulty` numbered squares drift around; after `delay` ms
     * the numbers disappear. Click the squares in order within `limit` ms; a
     * wrong one fails.
     */
    const STAGES = 3;
    const FIELD_W = 1120;
    const FIELD_H = 600;
    const SIZE = 88;
    const BOUNDS = { w: FIELD_W, h: FIELD_H };
    // Flat token shades, each with the text colour that reads on it.
    const SHADES = [
        ['var(--au-action)', 'var(--au-action-contrast)'],
        ['var(--au-action-hover)', 'var(--au-action-contrast)'],
        ['var(--au-action-soft)', 'var(--au-text)'],
        ['var(--au-text)', 'var(--au-action-contrast)'],
        ['var(--au-muted)', 'var(--au-action-contrast)'],
        ['var(--au-hint)', 'var(--au-action-contrast)'],
        ['var(--au-border-strong)', 'var(--au-text)'],
        ['var(--au-bg-alt-shade)', 'var(--au-text)'],
    ];

    const { params, succeed, fail, timeUp } = control();
    const targetCount = clamp(Math.floor(toNumber(params.difficulty, 5)), 1, 30);
    const delay = Math.max(0, toNumber(params.delay, 2500));
    const limit = Math.max(100, toNumber(params.limit, 20000));

    const phases = new Phases({ stages: STAGES, countdown: countdownOf(params) });
    let targets = $state([]);
    let preview = $state(true);
    let entered = $state(0);
    let time = $state(0);
    const over = $derived(game.result !== null);

    useTimeout(
        () => (preview = false),
        () => (phases.playing && preview ? delay : null),
    );

    useRaf(
        (t, dt) => {
            let list = targets;
            if (list.length === 0) {
                const palette = shuffle(SHADES);
                list = Array.from({ length: targetCount }, (_, i) => {
                    const x = Math.random() * (BOUNDS.w - 150);
                    const y = Math.random() * (BOUNDS.h - 150);
                    return { id: i + 1, x, y, shade: palette[i % palette.length], leg: newLeg({ x, y }, BOUNDS, [10, 40], t) };
                });
            }
            if (!preview) {
                time += dt;
                if (time > limit) {
                    timeUp();
                    return;
                }
            }
            targets = list.map((target) => {
                const p = legPos(target.leg, t);
                return { ...target, x: p.x, y: p.y, leg: p.done ? newLeg({ x: p.x, y: p.y }, BOUNDS, [10, 40], t) : target.leg };
            });
        },
        () => phases.playing && !over && entered < targetCount,
    );

    function click(e, target) {
        e.preventDefault();
        if (preview || !phases.playing || over) return;
        if (target.id === entered + 1) {
            play('beep');
            entered = target.id;
            if (target.id >= targetCount) succeed(false);
        } else {
            fail({}, 'Wrong square');
        }
    }
</script>

<Frame
    title="Tracking"
    status={preview ? 'Remember the order of the squares' : 'Click the squares in order, from 1'}
    left={limit - time}
    total={limit}
    running={!preview}
    {phases}
    flush
    successText="Verification complete"
    failText="Verification failed"
>
    {#snippet facts()}
        {entered} of {targetCount} found
    {/snippet}
    <div class="tr-field" style:width="{FIELD_W}px" style:height="{FIELD_H}px">
        {#each targets as t (t.id)}
            {#if t.id > entered}
                <button
                    type="button"
                    class="tr-target au-mono"
                    class:is-live={!preview}
                    style:left="{t.x}px"
                    style:top="{t.y}px"
                    style:background={t.shade[0]}
                    style:color={t.shade[1]}
                    aria-label="Target"
                    onmousedown={(e) => click(e, t)}>{preview ? t.id : ''}</button
                >
            {/if}
        {/each}
    </div>
</Frame>

<style>
    .tr-field {
        position: relative;
        max-width: 100%;
        overflow: hidden;
        background: var(--au-bg-sunk);
    }

    .tr-target {
        appearance: none;
        position: absolute;
        width: 88px;
        height: 88px;
        padding: 0;
        display: grid;
        place-items: center;
        border-radius: 0;
        border: 2px solid var(--au-border);
        font-size: var(--au-fs-xl);
        font-weight: 500;
        cursor: default;
    }

    .tr-target.is-live {
        cursor: pointer;
    }
</style>
