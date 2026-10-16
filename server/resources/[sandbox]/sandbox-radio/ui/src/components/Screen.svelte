<script>
    import { tick } from 'svelte';
    import { Icon, TextInput, uid, clamp } from '@sandbox/ui-kit';
    import { radio } from '../state/radio.svelte.js';
    import { formatFrequency, parseEntry } from '../lib/entry.js';
    import { rangeFor, inRange } from '../lib/ranges.js';
    import { tuneTo, step, stepTarget } from '../lib/actions.js';

    /**
     * The handset's backlit display, drawn behind the cut-out of the frame image.
     * Off: a black screen. On: status row, channel readout (or what a knob just did),
     * the frequency entry and a row of soft keys. Readable text is 16px or more.
     */
    const inputId = uid('freq');
    const SEGMENTS = Array.from({ length: 10 }, (_, i) => i);
    let entry = $state('');

    const range = $derived(rangeFor(radio.type) ?? { min: 1, max: 9999 });
    const parsed = $derived(parseEntry(entry));
    // Anything typed that Lua would refuse: outside this radio's range, or not a frequency at all.
    const invalid = $derived(entry.trim() !== '' && (parsed === null || !inRange(radio.type, parsed)));
    const busy = $derived(radio.pending !== null);

    const onChannel = $derived(radio.frequency > 0);
    const masked = $derived(onChannel && radio.maskRadio);
    const digits = $derived(masked ? '???.?' : formatFrequency(radio.frequency));
    const name = $derived(!onChannel ? 'No channel' : masked ? 'Channel hidden' : radio.frequencyName || 'Open channel');
    // "B0085 Radio" -> "B0085": the model, as printed on a real handset's status bar.
    const model = $derived(String(radio.typeName || 'Radio').replace(/\s+radio$/i, '') || 'Radio');
    const volume = $derived(Math.round(clamp(radio.volume, 0, 200)));

    // One word above the channel, in priority order (see CONTRACT.md).
    const state = $derived.by(() => {
        if (radio.pending !== null) return { text: 'Tuning', freq: radio.pending, tone: 'muted' };
        if (radio.notice?.kind === 'refused') return { text: 'Refused', freq: radio.notice.frequency, tone: 'error' };
        if (radio.notice?.kind === 'tuned') return { text: 'Tuned', tone: 'success' };
        if (onChannel) return { text: 'Receiving', tone: 'muted' };
        return { text: 'Standby', tone: 'muted' };
    });

    const canDown = $derived(!busy && stepTarget(-1) !== null);
    const canUp = $derived(!busy && stepTarget(1) !== null);

    // The entry takes the keyboard whenever the screen is lit (on open and on power-on).
    $effect(() => {
        if (radio.power) tick().then(() => document.getElementById(inputId)?.focus({ preventScroll: true }));
        else entry = '';
    });

    // Digits and one separator only, at most "1337.55"; Lua rounds to one decimal.
    $effect(() => {
        const clean = entry.replace(/[^\d.,]/g, '').slice(0, 7);
        if (clean !== entry) entry = clean;
    });

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
            <label class="entry__label" for={inputId}>Frequency</label>
            <span class="entry__hint" class:is-error={invalid} id="{inputId}-hint">
                {invalid ? `Use ${range.min} to ${range.max}` : `${range.min} to ${range.max}`}
            </span>
            <TextInput
                id={inputId}
                size="sm"
                mono
                inputmode="decimal"
                spellcheck="false"
                maxlength="7"
                {invalid}
                aria-describedby="{inputId}-hint"
                bind:value={entry}
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
    /* A dim backlit LCD: one flat dark colour, lit text, nothing decorative. Powered off it is black. */
    .lcd {
        --lcd-bg: var(--au-bg-sunk);
        position: relative;
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        background: var(--lcd-bg);
        /* the same flat colour carried under the frame's soft inner edge, so no gap shows */
        box-shadow: 0 0 0 4px var(--lcd-bg);
        color: var(--au-text);
        font-size: var(--au-fs-xs);
        line-height: 24px;
        user-select: none;
        transition: background var(--au-normal) var(--au-ease), box-shadow var(--au-normal) var(--au-ease);
    }
    .lcd.is-off {
        --lcd-bg: var(--hud-black);
    }

    /* status row: model, signal, volume */
    .lcd__status {
        display: flex;
        align-items: center;
        gap: var(--au-s2);
        height: 32px;
        flex-shrink: 0;
        padding: 0 var(--au-s3);
        border-bottom: 1px solid var(--au-border);
        color: var(--au-muted);
    }
    .lcd__model {
        flex: 1;
        min-width: 0;
    }
    .signal {
        display: inline-flex;
        align-items: flex-end;
        gap: 1px;
        height: 12px;
    }
    .signal i {
        width: 3px;
        background: var(--au-border);
    }
    .signal i:nth-child(1) { height: 3px; }
    .signal i:nth-child(2) { height: 6px; }
    .signal i:nth-child(3) { height: 9px; }
    .signal i:nth-child(4) { height: 12px; }
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
        width: 16px;
        height: 8px;
        border: 1px solid var(--au-muted);
    }
    .minibar span {
        position: absolute;
        inset: 0 auto 0 0;
        background: var(--au-text);
    }

    /* channel readout */
    .lcd__main {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-height: 0;
        padding: 0 var(--au-s3);
    }
    .lcd__word {
        color: var(--au-muted);
        white-space: nowrap;
    }
    .lcd__word.is-error {
        color: var(--au-error);
    }
    .lcd__word.is-success {
        color: var(--au-success);
    }
    .lcd__digits {
        font-size: var(--au-fs-xxl);
        font-weight: 700;
        line-height: 48px;
        white-space: nowrap;
    }
    .lcd__name {
        font-size: var(--au-fs-sm);
        font-weight: 700;
        line-height: 24px;
    }
    .lcd__big-word {
        font-size: var(--au-fs-lg);
        font-weight: 700;
        line-height: 48px;
    }
    .is-dim {
        color: var(--au-muted);
    }
    .meter {
        display: flex;
        gap: 2px;
        height: 8px;
        margin-top: var(--au-s1);
    }
    .meter span {
        flex: 1;
        background: var(--au-bg-alt-shade);
    }
    .meter span.is-lit {
        background: var(--au-text);
    }

    /* frequency entry: label, hint (the error in the same place), field */
    .entry {
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
        margin: 0;
        padding: 0 var(--au-s3) var(--au-s3);
    }
    .entry__label {
        font-weight: 700;
    }
    .entry__hint {
        margin-bottom: var(--au-s1);
        color: var(--au-muted);
        white-space: nowrap;
    }
    .entry__hint.is-error {
        color: var(--au-error);
        font-weight: 700;
    }
    /* The caret lives in this field whenever the radio is open, so the app-wide
       gold focus ring would be on permanently; on the device screen the field
       keeps a plain ink edge instead (an exception recorded in DESIGN.md). */
    .entry :global(.au-input:focus) {
        outline: none;
        box-shadow: none;
        border-color: var(--au-ink);
    }

    /* soft keys along the bottom edge of the display */
    .softkeys {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        flex-shrink: 0;
        height: 40px;
        border-top: 1px solid var(--au-border);
    }
    .softkey {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 2px;
        margin: 0;
        padding: 0;
        font: inherit;
        font-weight: 700;
        color: var(--au-text);
        background: transparent;
        border: 0;
        cursor: pointer;
        transition: background var(--au-fast) var(--au-ease), color var(--au-fast) var(--au-ease);
    }
    .softkey:hover:not(:disabled) {
        background: var(--au-bg-alt);
    }
    .softkey:active:not(:disabled) {
        background: var(--au-bg-alt-shade);
    }
    .softkey:disabled {
        color: var(--au-border);
        cursor: default;
    }
    .softkey:focus-visible {
        outline: 3px solid var(--au-focus);
        outline-offset: -3px;
    }
</style>
