<script>
    import { Button, TextInput } from '@sandbox/ui-kit';
    import Frame from '../Frame.svelte';
    import { game, control } from '../../state/game.svelte.js';
    import { Phases, useRaf, useTimeout } from '../../lib/runes.svelte.js';
    import { clamp, countdownOf, pick, randInt, range, shuffle, toNumber } from '../../lib/random.js';
    import { startTick, stopTick } from '../../lib/sounds.js';

    /**
     * Captcha: tiles show their number for `timer` ms, the numbers shrink away
     * over 2 s, then each tile turns into a shape / colour / text puzzle.
     * Answer `difficulty2` questions about numbered tiles within `limit` ms.
     */
    const STAGES = 3;
    const SHRINK_MS = 2000;
    const TILE = 136;

    const SHAPES = ['square', 'triangle', 'rectangle', 'circle'];
    const COLORABLE = ['background', 'colortext', 'shapetext', 'number', 'shape'];
    // Puzzle content: the player names these colours, so they stay true to their names.
    const COLORS = {
        black: '#000000',
        white: '#FFFFFF',
        blue: '#2195ee',
        red: '#7b0100',
        yellow: '#fceb3d',
        orange: '#fd9802',
        green: '#4cae4f',
        purple: '#9926ac',
    };
    const COLOR_NAMES = Object.keys(COLORS);

    const QUESTIONS = {
        'background color': (p) => p.colorNames.background,
        'color text color': (p) => p.colorNames.colortext,
        'shape text color': (p) => p.colorNames.shapetext,
        'number color': (p) => p.colorNames.number,
        'shape color': (p) => p.colorNames.shape,
        'color text': (p) => p.text[0],
        'shape text': (p) => p.text[1],
        shape: (p) => p.shape,
    };
    const QUESTION_LABEL = {
        'background color': 'background colour',
        'color text color': 'colour of the colour word',
        'shape text color': 'colour of the shape word',
        'number color': 'number colour',
        'shape color': 'shape colour',
        'color text': 'colour word',
        'shape text': 'shape word',
        shape: 'shape',
    };

    function randomPiece(index) {
        const shape = pick(SHAPES);
        const number = randInt(1, 9);
        const text = [pick(COLOR_NAMES), pick(SHAPES)];
        const colorNames = {};
        for (const k of COLORABLE) colorNames[k] = pick(COLOR_NAMES);
        while ([colorNames.colortext, colorNames.shapetext].includes(colorNames.background)) colorNames.background = pick(COLOR_NAMES);
        while ([colorNames.background, colorNames.colortext, colorNames.shapetext, colorNames.number].includes(colorNames.shape))
            colorNames.shape = pick(COLOR_NAMES);
        const colors = {};
        for (const k of COLORABLE) colors[k] = COLORS[colorNames[k]];
        return { index, shape, number, text, colorNames, colors };
    }

    function generateQA(numAnswers, pieces) {
        const questions = [];
        const answers = [];
        const positions = shuffle(pieces.map((p) => p.index)).slice(0, numAnswers);
        const kinds = shuffle(Object.keys(QUESTIONS)).slice(0, numAnswers);
        for (let i = 0; i < numAnswers; i += 1) {
            const piece = pieces.find((p) => p.index === positions[i]);
            questions.push({ question: kinds[i], position: positions[i] });
            answers.push(String(QUESTIONS[kinds[i]](piece)));
        }
        return { questions, answer: answers.join(' ') };
    }

    const { params, succeed, fail } = control();
    const previewMs = Math.max(0, toNumber(params.timer, 5000));
    const limit = toNumber(params.limit, 30000);
    const tiles = clamp(Math.floor(toNumber(params.difficulty, 4)), 1, 8);
    const numAnswers = clamp(Math.floor(toNumber(params.difficulty2, 2)), 1, Math.min(8, tiles));

    const pieces = shuffle(range(tiles, 1)).map((i) => randomPiece(i));
    const { questions, answer } = generateQA(numAnswers, pieces);

    const phases = new Phases({ stages: STAGES, countdown: countdownOf(params) });
    let step = $state('preview');
    let time = $state(0);
    let value = $state('');
    let submitted = $state(false);
    const over = $derived(game.result !== null);
    const inputId = 'captcha-answer';

    useTimeout(
        () => (step = 'shrink'),
        () => (phases.playing && step === 'preview' ? previewMs : null),
    );
    useTimeout(
        () => (step = 'answer'),
        () => (phases.playing && step === 'shrink' ? SHRINK_MS : null),
    );

    $effect(() => {
        if (step !== 'answer' || over) return undefined;
        startTick();
        document.getElementById(inputId)?.focus();
        return () => stopTick();
    });

    useRaf(
        (t) => {
            time = t;
            if (limit && t > limit) fail();
        },
        () => phases.playing && step === 'answer' && !over && !submitted,
    );

    function onsubmit(e) {
        e.preventDefault();
        if (!phases.playing || step !== 'answer' || over || submitted) return;
        submitted = true;
        stopTick();
        const given = value.trim().toLowerCase().replace(/\s+/g, ' ');
        if (given === answer.toLowerCase()) succeed(false);
        else fail();
    }

    const width = Math.max(560, tiles * TILE + (tiles - 1) * 12 + 34);
</script>

<Frame
    title="Visual verification"
    status={step === 'answer' ? 'Answer the question' : 'Remember the numbers'}
    {width}
    left={limit > 0 ? limit - (step === 'answer' ? time : 0) : null}
    total={limit}
    running={step === 'answer'}
    {phases}
    stageIcon="eye"
    successText="Verification complete"
    failText="Verification failed"
>
    <div class="cp-tiles">
        {#each pieces as p (p.index)}
            {@const revealed = step === 'answer'}
            <div class="cp-tile" style:background={revealed ? p.colors.background : undefined}>
                {#if revealed}
                    <svg viewBox="0 0 150 150" width={TILE - 28} height={TILE - 28} aria-hidden="true">
                        {#if p.shape === 'square'}
                            <rect fill={p.colors.shape} stroke="#000" stroke-width="1" width="150" height="150" />
                        {:else if p.shape === 'triangle'}
                            <polygon fill={p.colors.shape} stroke="#000" stroke-width="1" points="0 150 75 0 150 150 0 150" />
                        {:else if p.shape === 'rectangle'}
                            <rect y="30" fill={p.colors.shape} stroke="#000" stroke-width="1" width="150" height="90" />
                        {:else}
                            <circle fill={p.colors.shape} stroke="#000" stroke-width="1" cx="75" cy="75" r="75" />
                        {/if}
                        <text class="cp-word" fill={p.colors.colortext} x="50%" y="25%">{p.text[0].toUpperCase()}</text>
                        <text class="cp-word" fill={p.colors.shapetext} x="50%" y="70%">{p.text[1].toUpperCase()}</text>
                        <text class="cp-number" fill={p.colors.number} x="50%" y="50%">{p.number}</text>
                    </svg>
                {:else}
                    <span class="cp-index au-mono" class:is-shrinking={step === 'shrink'}>{p.index}</span>
                {/if}
            </div>
        {/each}
    </div>

    <div class="cp-answer">
        {#if step === 'answer'}
            <p class="cp-question">
                Enter the
                {#each questions as q, i (i)}
                    <strong>{QUESTION_LABEL[q.question] ?? q.question}</strong> of tile <span class="cp-pos au-mono">{q.position}</span>{i < questions.length - 1
                        ? ', then the '
                        : ''}
                {/each}
            </p>
            <form class="cp-form" {onsubmit}>
                <TextInput
                    id={inputId}
                    bind:value
                    placeholder={numAnswers > 1 ? 'Answers in order, separated by spaces' : 'Answer'}
                    disabled={over || submitted}
                    autocomplete="off"
                    spellcheck="false"
                />
                <Button type="submit" disabled={over || submitted}>Submit</Button>
            </form>
        {/if}
    </div>
</Frame>

<style>
    .cp-tiles {
        display: flex;
        justify-content: center;
        gap: var(--au-s3);
    }

    .cp-tile {
        display: grid;
        place-items: center;
        width: 136px;
        height: 136px;
        border-radius: var(--au-radius);
        border: 1px solid var(--au-border);
        background: var(--au-bg-alt);
        overflow: hidden;
    }

    .cp-index {
        font-size: var(--au-fs-xxxl);
        font-weight: 500;
        line-height: 1;
        color: var(--au-text);
        transform: scale(1);
    }

    .cp-index.is-shrinking {
        transform: scale(0);
        transition: transform 2000ms ease-in;
    }

    .cp-word,
    .cp-number {
        stroke: #000;
        stroke-width: 0.35;
        font-weight: 700;
        dominant-baseline: middle;
        text-anchor: middle;
    }

    .cp-word {
        font-family: var(--au-font);
        font-size: 24px;
    }

    .cp-number {
        font-family: var(--au-font-mono);
        font-size: 55px;
    }

    .cp-answer {
        min-height: 112px;
        margin-top: var(--au-s4);
    }

    .cp-question {
        max-width: none;
        margin: 0 0 var(--au-s3);
        font-size: var(--au-fs-xs);
        color: var(--au-muted);
        text-align: center;
    }

    .cp-question strong {
        font-weight: 500;
        color: var(--au-text);
    }

    .cp-pos {
        font-weight: 500;
        color: var(--au-action);
    }

    .cp-form {
        display: flex;
        gap: var(--au-s2);
        max-width: 480px;
        margin: 0 auto;
    }
</style>
