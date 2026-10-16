<script>
    import { Button, Field, Icon, TextInput } from '@sandbox/ui-kit';
    import Frame from '../Frame.svelte';
        import { game, control } from '../../state/game.svelte.js';
    import { Phases, useInterval, useRaf, useTimeout } from '../../lib/runes.svelte.js';
    import { clamp, countdownOf, pick, shuffle, toNumber } from '../../lib/random.js';
    import { play, startTick, stopTick } from '../../lib/sounds.js';

    /**
     * Icons: a grid of `difficulty` coloured icons reshuffles once a second for
     * `timer` seconds and stays `delay` ms; then one icon at a time is shown
     * without colour and the player types the colour it had. `difficulty2`
     * correct answers within `limit` ms succeed; a wrong answer fails.
     */
    const STAGES = 3;

    const ICONS = [
        'atom', 'terminal-2', 'code', 'sitemap', 'cpu', 'tool', 'shield', 'network', 'box', 'brain', 'bug', 'barcode',
        'keyboard', 'device-laptop', 'satellite', 'device-floppy', 'robot', 'fingerprint', 'wifi', 'radio', 'plug', 'bolt',
        'antenna', 'cloud', 'lock', 'key', 'qrcode', 'radar', 'rocket', 'globe', 'device-mobile', 'device-cctv', 'virus', 'spy',
    ];

    // Puzzle content: the player names these colours, so they stay true to their names.
    const COLOR_OPTIONS = [
        { color: '#ff4040', answer: ['red'] },
        { color: '#39d353', answer: ['green'] },
        { color: '#3b9dff', answer: ['blue'] },
        { color: '#b35cff', answer: ['purple'] },
        { color: '#ff8c1a', answer: ['orange'] },
        { color: '#ffe234', answer: ['yellow'] },
        { color: '#f6f7f9', answer: ['white'] },
        { color: '#30e6f2', answer: ['cyan'] },
        { color: '#9aa3b2', answer: ['grey', 'gray'] },
        { color: '#ff69b4', answer: ['pink'] },
        { color: '#00ff8a', answer: ['mint'] },
    ];
    const COLOR_HINT = 'Use red, green, blue, purple, orange, yellow, white, cyan, grey, pink or mint.';

    const { params, succeed, fail, timeUp } = control();
    const shuffles = Math.max(0, Math.floor(toNumber(params.timer, 5)));
    const limit = toNumber(params.limit, 7500);
    const delay = Math.max(0, toNumber(params.delay, 1500));
    const iconCount = clamp(Math.floor(toNumber(params.difficulty, 8)), 1, ICONS.length);
    const needed = clamp(Math.floor(toNumber(params.difficulty2, 4)), 1, iconCount);

    const genIcons = () =>
        shuffle(ICONS)
            .slice(0, iconCount)
            .map((icon) => ({ icon, color: pick(COLOR_OPTIONS), solved: false }));

    const phases = new Phases({ stages: STAGES, countdown: countdownOf(params) });
    let icons = $state(genIcons());
    let shuffleCount = $state(0);
    let input = $state(false);
    let selected = $state(null);
    let correct = $state(0);
    let value = $state('');
    let time = $state(0);
    const over = $derived(game.result !== null);
    const inputId = 'icons-answer';

    useInterval(
        () => {
            icons = genIcons();
            play('beep');
            shuffleCount += 1;
        },
        () => (phases.playing && shuffleCount < shuffles && !over ? 1000 : null),
    );

    useTimeout(
        () => {
            input = true;
            selected = pick(icons.filter((i) => !i.solved));
        },
        () => (phases.playing && shuffleCount >= shuffles && !input && !over ? delay : null),
    );

    $effect(() => {
        if (!input || over) return undefined;
        startTick();
        document.getElementById(inputId)?.focus();
        return () => stopTick();
    });

    useRaf(
        (t) => {
            time = t;
            if (limit && t > limit) timeUp();
        },
        () => phases.playing && input && !over && correct < needed,
    );

    function onsubmit(e) {
        e.preventDefault();
        if (!input || over || !selected) return;
        const given = value.trim().toLowerCase();
        if (!given) return;
        if (selected.color.answer.includes(given)) {
            const next = icons.map((i) => (i.icon === selected.icon ? { ...i, solved: true } : i));
            const c = correct + 1;
            icons = next;
            correct = c;
            value = '';
            if (c >= needed) succeed(false);
            else {
                play('positive');
                selected = pick(next.filter((i) => !i.solved));
                document.getElementById(inputId)?.focus();
            }
        } else {
            fail({}, `That icon was ${selected.color.answer[0]}`);
        }
    }
</script>

<Frame
    title="Icon decryption"
    status={input ? 'Name the colour this icon had' : shuffleCount < shuffles ? 'Remember the colour of each icon' : 'Final layout'}
    width={520}
    left={limit > 0 ? limit - (input ? time : 0) : null}
    total={limit}
    running={input}
    {phases}
    successText="Verification complete"
    failText="Verification failed"
>
    {#snippet facts()}
        {#if input}{correct} of {needed} named{/if}
    {/snippet}
    <div class="ic-body">
        {#if !input}
            <div class="ic-grid">
                {#each icons as it, i (`${shuffleCount}-${i}`)}
                    <div class="ic-tile" style:color={it.color.color}>
                        <Icon icon={it.icon} size={32} stroke={2} />
                    </div>
                {/each}
            </div>
        {:else}
            <div class="ic-ask">
                <div class="ic-subject">
                    {#if selected}<Icon icon={selected.icon} size={80} stroke={1.5} />{/if}
                </div>
                <form {onsubmit}>
                    <Field id={inputId} label="Colour of this icon" hint={COLOR_HINT}>
                        <div class="ic-row">
                            <TextInput id={inputId} bind:value disabled={over} autocomplete="off" spellcheck="false" />
                            <Button type="submit" disabled={over}>Check colour</Button>
                        </div>
                    </Field>
                </form>
            </div>
        {/if}
    </div>
</Frame>

<style>
    .ic-body {
        min-height: 328px;
    }

    .ic-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--au-s2);
    }

    .ic-tile {
        display: grid;
        place-items: center;
        height: 72px;
        background: var(--au-bg-sunk);
        border: 2px solid var(--au-border);
    }

    .ic-ask {
        display: flex;
        flex-direction: column;
        gap: var(--au-s4);
    }

    .ic-subject {
        display: grid;
        place-items: center;
        height: 136px;
        background: var(--au-bg-sunk);
        border: 2px solid var(--au-border);
        color: var(--au-text);
    }

    .ic-ask :global(.au-field) {
        margin: 0;
    }

    .ic-row {
        display: flex;
        align-items: flex-start;
        gap: var(--au-s2);
    }

    .ic-row :global(.au-input) {
        flex: 1;
    }
</style>
