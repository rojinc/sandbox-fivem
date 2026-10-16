<script>
    import { Icon } from '@sandbox/ui-kit';
    import { onKey } from '@sandbox/ui-kit/nui';
    import Frame from '../Frame.svelte';
    import Slots from '../Slots.svelte';
    import { game, control } from '../../state/game.svelte.js';
    import { Phases, useRaf } from '../../lib/runes.svelte.js';
    import { toNumber } from '../../lib/random.js';
    import { play } from '../../lib/sounds.js';

    /**
     * Keypad: type the code (`total`, also `data.code`) and confirm. The
     * entered digits go back to Lua as `entered`. Keyboard: 0-9, Backspace, Enter.
     */
    const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    const { params, succeed, fail, timeUp } = control();
    const code = String(params.total ?? params.data?.code ?? '');
    const digits = code
        .split('')
        .filter(Boolean)
        .map((c) => Number(c));
    const maxLen = Math.max(1, Math.floor(toNumber(params.difficulty, 0)) || digits.length || 1);
    const limit = toNumber(params.limit, 0);
    const mask = Boolean(params.mask);

    const phases = new Phases({ countdown: params.countdown ? toNumber(params.countdown, 5) : -1 });
    let entered = $state([]);
    let time = $state(0);
    const over = $derived(game.result !== null);
    const live = $derived(phases.playing && !over);

    useRaf(
        (t) => {
            time = t;
            if (t > limit) timeUp();
        },
        () => phases.playing && limit > 0 && !over,
    );

    function press(d) {
        if (!live || entered.length >= maxLen) return;
        play('beep');
        entered = [...entered, d];
    }

    function back() {
        if (!live || entered.length === 0) return;
        play('back');
        entered = entered.slice(0, -1);
    }

    function submit() {
        if (!live || entered.length < digits.length) return;
        play('confirm');
        const str = entered.join('');
        const ok = entered.length === digits.length && entered.every((d, i) => d === digits[i]);
        if (ok) succeed(false, { entered: str });
        else fail({ entered: str }, 'Wrong code');
    }

    onKey(DIGITS, (e) => {
        if (!live) return false;
        if (!e.repeat) press(Number(e.key));
        return true;
    });
    onKey('Backspace', () => {
        if (!live) return false;
        back();
        return true;
    });
    onKey('Enter', (e) => {
        if (!live) return false;
        if (!e.repeat) submit();
        return true;
    });

    const noop = (e) => e.preventDefault();
</script>

<Frame
    title="Keypad"
    status="Enter the access code"
    width={300}
    left={limit > 0 ? limit - time : null}
    total={limit}
    {phases}
    successText="Access granted"
    failText="Access denied"
>
    <Slots length={digits.length} values={entered} {mask} />
    <div class="kp-pad">
        {#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as d (d)}
            <button type="button" class="gm-key" disabled={!live || entered.length >= maxLen} onmousedown={noop} onclick={() => press(d)}>{d}</button>
        {/each}
        <button type="button" class="gm-key kp-back" aria-label="Delete" disabled={!live || entered.length === 0} onmousedown={noop} onclick={back}>
            <Icon icon="arrow-left" />
        </button>
        <button type="button" class="gm-key" disabled={!live || entered.length >= maxLen} onmousedown={noop} onclick={() => press(0)}>0</button>
        <button
            type="button"
            class="gm-key kp-ok"
            class:is-ready={live && entered.length >= digits.length}
            aria-label="Confirm"
            disabled={!live || entered.length < digits.length}
            onmousedown={noop}
            onclick={submit}
        >
            <Icon icon="check" stroke={2.25} />
        </button>
    </div>
</Frame>

<style>
    .kp-pad {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--au-s2);
        margin-top: var(--au-s4);
    }

    .kp-back:disabled,
    .kp-ok:disabled {
        color: var(--au-muted);
    }

    .kp-ok.is-ready {
        background: var(--au-ink);
        box-shadow: 0 3px 0 var(--au-bar);
        color: var(--au-on-ink);
    }

    .kp-ok.is-ready:hover {
        background: var(--au-muted);
    }
</style>
