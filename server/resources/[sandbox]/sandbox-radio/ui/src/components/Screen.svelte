<script>
    import { Icon, uid, clamp } from '@sandbox/ui-kit';
    import { radio } from '../state/radio.svelte.js';
    import { formatFrequency, parseEntry } from '../lib/entry.js';
    import { rangeFor, inRange } from '../lib/ranges.js';
    import { tuneTo, step, stepTarget } from '../lib/actions.js';

    /**
     * The handset's backlit display, drawn behind the cut-out of the frame image.
     * Off: a black screen. On: status row, channel readout (or what a knob just did),
     * the frequency entry and a row of soft keys.
     */
    const inputId = uid('freq');
    const SEGMENTS = Array.from({ length: 10 }, (_, i) => i);
    let entry = $state('');
    let input = $state();

    const range = $derived(rangeFor(radio.type));
    const parsed = $derived(parseEntry(entry));
    const outOfRange = $derived(parsed !== null && !inRange(radio.type, parsed));
    const malformed = $derived(entry.trim() !== '' && parsed === null);
    const busy = $derived(radio.pending !== null);

    const onChannel = $derived(radio.frequency > 0);
    const masked = $derived(onChannel && radio.maskRadio);
    const digits = $derived(masked ? '???.?' : formatFrequency(radio.frequency));
    const name = $derived(!onChannel ? 'No channel' : masked ? 'Channel hidden' : radio.frequencyName || 'Open channel');
    // "B0085 Radio" -> "B0085": the model, as printed on a real handset's status bar.
    const model = $derived(String(radio.typeName || 'Radio').replace(/\s+radio$/i, '') || 'Radio');
    const volume = $derived(Math.round(clamp(radio.volume, 0, 200)));

    // One small word above the channel, in priority order (see CONTRACT.md).
    const state = $derived.by(() => {
        if (radio.pending !== null) return { text: 'Tuning', freq: radio.pending, tone: 'muted' };
        if (radio.notice?.kind === 'refused') return { text: 'Refused', freq: radio.notice.frequency, tone: 'error' };
        if (radio.notice?.kind === 'tuned') return { text: 'Tuned', tone: 'success' };
        if (onChannel) return { text: 'Receiving', tone: 'muted' };
        return { text: 'Standby', tone: 'hint' };
    });

    const canDown = $derived(!busy && stepTarget(-1) !== null);
    const canUp = $derived(!busy && stepTarget(1) !== null);

    // The entry takes the keyboard whenever the screen is lit (on open and on power-on).
    $effect(() => {
        input?.focus({ preventScroll: true });
    });
    $effect(() => {
        if (!radio.power) entry = '';
    });

    function onInput(e) {
        // Digits and one separator only; Lua rounds to one decimal.
        entry = e.currentTarget.value.replace(/[^\d.,]/g, '').slice(0, 7);
        e.currentTarget.value = entry;
    }

    function submit(e) {
        e?.preventDefault();
        if (parsed === null || busy) return;
        tuneTo(parsed);
        entry = '';
    }

    // Soft keys and knobs must not steal the caret from the entry.
    const keepFocus = (e) => e.preventDefault();
</script>

<div class="lcd" class:is-off={!radio.power}>
    {#if radio.power}
        <div class="lcd__status">
            <span class="lcd__model au-truncate">{model}</span>
            <span class="signal" class:is-live={onChannel && !busy} role="img" aria-label={onChannel ? 'On a channel' : 'No channel'}>
                <i></i><i></i><i></i><i></i>
            </span>
            <span class="lcd__vol" aria-label="Volume {volume}%">
                <span class="minibar" aria-hidden="true"><span style:width="{volume / 2}%"></span></span>
                <span class="au-mono">{volume}%</span>
            </span>
        </div>

        <div class="lcd__main" role="status" aria-live="polite">
            {#if radio.osd?.kind === 'volume'}
                <span class="lcd__word">Volume</span>
                <span class="lcd__digits au-mono">{volume}%</span>
                <span class="meter" aria-hidden="true">
                    {#each SEGMENTS as i (i)}
                        <span class:is-lit={i < Math.round(volume / 20)}></span>
                    {/each}
                </span>
            {:else if radio.osd?.kind === 'clicks'}
                <span class="lcd__word">Click sound</span>
                <span class="lcd__big-word">{radio.osd.dir > 0 ? 'Louder' : 'Quieter'}</span>
            {:else}
                <span class="lcd__word is-{state.tone}">
                    {state.text}{#if state.freq !== undefined}&nbsp;<span class="au-mono">{formatFrequency(state.freq)}</span>{/if}
                </span>
                <span class="lcd__digits au-mono" class:is-dim={!onChannel}>{digits}</span>
                <span class="lcd__name au-truncate" class:is-dim={!onChannel}>{name}</span>
            {/if}
        </div>

        <form class="entry" onsubmit={submit} autocomplete="off">
            <div class="entry__head">
                <label for={inputId}>Frequency</label>
                {#if outOfRange}
                    <span class="is-warning" id="{inputId}-msg">Out of range</span>
                {:else if malformed}
                    <span class="is-warning" id="{inputId}-msg">Not a frequency</span>
                {/if}
            </div>
            <input
                bind:this={input}
                id={inputId}
                class="entry__input au-mono"
                type="text"
                inputmode="decimal"
                spellcheck="false"
                maxlength="7"
                placeholder={range ? `${range.min}–${range.max}` : '1–9999'}
                aria-invalid={outOfRange || malformed}
                aria-describedby={outOfRange || malformed ? `${inputId}-msg` : undefined}
                value={entry}
                oninput={onInput}
            />
        </form>

        <div class="softkeys" role="group" aria-label="Channel">
            <button type="button" class="softkey" disabled={!canDown} aria-label="Channel down" title="Channel down" onmousedown={keepFocus} onclick={() => step(-1)}>
                <Icon icon="chevron-down" stroke={2} />Ch
            </button>
            <button type="button" class="softkey" disabled={parsed === null || busy} onmousedown={keepFocus} onclick={submit}>
                {parsed === null ? '' : 'Tune'}
            </button>
            <button type="button" class="softkey" disabled={!canUp} aria-label="Channel up" title="Channel up" onmousedown={keepFocus} onclick={() => step(1)}>
                Ch<Icon icon="chevron-up" stroke={2} />
            </button>
        </div>
    {/if}
</div>

<style>
    /* A dim backlit LCD: one flat dark colour, lit text, nothing decorative. */
    .lcd {
        --lcd-bg: #0f1113;
        --lcd-line: var(--au-border);
        position: relative;
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        background: var(--lcd-bg);
        /* bleed the same flat colour under the frame's soft inner edge */
        box-shadow: 0 0 0 4px var(--lcd-bg);
        color: var(--au-text);
        line-height: 1.25;
        user-select: none;
        transition: background var(--au-normal) var(--au-ease), box-shadow var(--au-normal) var(--au-ease);
    }
    .lcd.is-off {
        --lcd-bg: #08090a;
    }

    /* status row: model, signal, volume */
    .lcd__status {
        display: flex;
        align-items: center;
        gap: var(--au-s2);
        height: 28px;
        padding: 0 var(--au-s3);
        border-bottom: 1px solid var(--lcd-line);
        font-size: var(--au-fs-xxs);
        color: var(--au-muted);
    }
    .lcd__model {
        flex: 1;
        min-width: 0;
        font-weight: 500;
    }
    .signal {
        display: inline-flex;
        align-items: flex-end;
        gap: 1px;
        height: 10px;
    }
    .signal i {
        width: 3px;
        background: var(--au-border-strong);
        border-radius: 1px;
    }
    .signal i:nth-child(1) { height: 4px; }
    .signal i:nth-child(2) { height: 6px; }
    .signal i:nth-child(3) { height: 8px; }
    .signal i:nth-child(4) { height: 10px; }
    .signal.is-live i {
        background: var(--au-text);
    }
    .lcd__vol {
        display: inline-flex;
        align-items: center;
        gap: var(--au-s1);
    }
    .lcd__vol .au-mono {
        min-width: 4ch;
        text-align: right;
        color: var(--au-text);
    }
    .minibar {
        position: relative;
        width: 20px;
        height: 6px;
        border: 1px solid var(--au-border-strong);
        border-radius: 1px;
    }
    .minibar span {
        position: absolute;
        inset: 0 auto 0 0;
        background: var(--au-text);
        transition: width var(--au-fast) var(--au-ease);
    }

    /* channel readout */
    .lcd__main {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: var(--au-s1);
        min-height: 0;
        padding: 0 var(--au-s3);
    }
    .lcd__word {
        font-size: var(--au-fs-xxs);
        line-height: 16px;
        color: var(--au-muted);
        white-space: nowrap;
    }
    .lcd__word.is-hint {
        color: var(--au-hint);
    }
    .lcd__word.is-error {
        color: var(--au-error);
    }
    .lcd__word.is-success {
        color: var(--au-success);
    }
    .lcd__digits {
        font-size: var(--au-fs-xxl);
        font-weight: 500;
        line-height: 48px;
        letter-spacing: -1px;
        white-space: nowrap;
    }
    .lcd__name {
        font-size: var(--au-fs-xs);
        font-weight: 500;
        line-height: 20px;
    }
    .lcd__big-word {
        font-size: var(--au-fs-lg);
        font-weight: 500;
        line-height: 48px;
    }
    .is-dim {
        color: var(--au-hint);
    }
    .meter {
        display: flex;
        gap: 2px;
        height: 8px;
    }
    .meter span {
        flex: 1;
        background: var(--au-bg-alt-shade);
        border-radius: 1px;
    }
    .meter span.is-lit {
        background: var(--au-text);
    }

    /* frequency entry */
    .entry {
        margin: 0;
        padding: 0 var(--au-s3) var(--au-s3);
    }
    .entry__head {
        display: flex;
        justify-content: space-between;
        gap: var(--au-s2);
        margin-bottom: var(--au-s1);
        font-size: var(--au-fs-xxs);
        line-height: 16px;
        color: var(--au-hint);
        white-space: nowrap;
    }
    .entry__head .is-warning {
        color: var(--au-warning);
    }
    .entry__input {
        display: block;
        box-sizing: border-box;
        width: 100%;
        height: 32px;
        margin: 0;
        padding: 0 var(--au-s2);
        font-size: var(--au-fs-sm);
        color: var(--au-text);
        caret-color: var(--au-text);
        background: var(--au-bg-sunk);
        border: 1px solid var(--lcd-line);
        border-radius: var(--au-radius);
        outline: none;
        transition: border-color var(--au-fast) var(--au-ease);
    }
    .entry__input::placeholder {
        color: var(--au-hint);
    }
    .entry__input:focus {
        border-color: var(--au-border-strong);
    }
    .entry__input:focus-visible {
        outline: none;
    }
    .entry__input[aria-invalid='true'] {
        border-color: var(--au-warning);
    }

    /* soft keys along the bottom edge of the display */
    .softkeys {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        height: 32px;
        border-top: 1px solid var(--lcd-line);
    }
    .softkey {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 2px;
        margin: 0;
        padding: 0;
        font: inherit;
        font-size: var(--au-fs-xxs);
        font-weight: 500;
        color: var(--au-text);
        background: transparent;
        border: 0;
        cursor: pointer;
        transition: background var(--au-fast) var(--au-ease), color var(--au-fast) var(--au-ease);
    }
    .softkey + .softkey {
        border-left: 1px solid var(--lcd-line);
    }
    .softkey:hover:not(:disabled) {
        background: var(--au-bg-alt);
    }
    .softkey:active:not(:disabled) {
        background: var(--au-bg-alt-shade);
    }
    .softkey:disabled {
        color: var(--au-border-strong);
        cursor: default;
    }
    .softkey:focus-visible {
        outline: 2px solid var(--au-focus);
        outline-offset: -2px;
    }
</style>
