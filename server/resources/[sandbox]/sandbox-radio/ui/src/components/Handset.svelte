<script>
    import { tick } from 'svelte';
    import { Button, Tag, TextInput, Kbd, fetchNui, uid } from '@sandbox/ui-kit';
    import { faPowerOff, faXmark } from '@fortawesome/free-solid-svg-icons';
    import { radio, tuneRequested } from '../state/radio.svelte.js';
    import { parseEntry } from '../lib/entry.js';
    import { rangeFor, inRange } from '../lib/ranges.js';
    import Screen from './Screen.svelte';

    /** The floating handset (client/main.lua OpenRadio). Mounted only while APP_SHOW is in effect. */
    const inputId = uid('freq');
    let entry = $state('');

    const parsed = $derived(parseEntry(entry));
    const range = $derived(rangeFor(radio.type));
    const outOfRange = $derived(parsed !== null && !inRange(radio.type, parsed));
    const canTune = $derived(radio.power && parsed !== null && radio.pending === null);
    const atTop = $derived(Boolean(range) && radio.frequency >= range.max);

    const status = $derived.by(() => {
        if (!radio.power) return { text: 'Off', tone: 'default', solid: false };
        if (radio.pending !== null) return { text: 'Tuning', tone: 'info', solid: true };
        if (radio.notice?.kind === 'refused') return { text: 'Refused', tone: 'error', solid: true };
        if (radio.notice?.kind === 'tuned') return { text: 'Tuned', tone: 'success', solid: true };
        if (radio.frequency > 0) return { text: 'Receiving', tone: 'success', solid: true };
        return { text: 'No channel', tone: 'default', solid: false };
    });

    // Typing goes straight into the frequency box when the handset opens.
    $effect(() => {
        tick().then(() => document.getElementById(inputId)?.focus());
    });
    $effect(() => {
        if (!radio.power) entry = '';
    });

    function tuneTo(target) {
        if (!radio.power || target === null || target === undefined) return;
        entry = '';
        if (Math.abs(target - radio.frequency) < 0.05) return; // Lua would not answer: nothing to wait for
        tuneRequested(target);
        fetchNui('SetChannel', { frequency: target });
    }

    /** Channel up/down by one, like Lua's CycleRadioChannel but kept inside this radio's range. */
    function step(dir) {
        if (!radio.power) return;
        const min = range?.min ?? 1;
        const max = range?.max ?? 9999;
        if (radio.frequency <= 0) {
            if (dir > 0) tuneTo(min);
            return;
        }
        let target = Math.round((radio.frequency + dir) * 10) / 10;
        if (target < min) target = 0; // stepping below the range leaves the channel
        if (target > max) return;
        tuneTo(target);
    }

    const close = () => fetchNui('Close');
    const togglePower = () => fetchNui('TogglePower');
    const volume = (dir) => radio.power && fetchNui(dir > 0 ? 'VolumeUp' : 'VolumeDown');
    const clicks = (dir) => fetchNui(dir > 0 ? 'ClickVolumeUp' : 'ClickVolumeDown');
</script>

<section class="handset au-dark" aria-label="Handheld radio">
    <header class="handset__head">
        <h2 class="handset__title au-truncate">{radio.typeName}</h2>
        <Tag tone={status.tone} solid={status.solid}>{status.text}</Tag>
        <Button size="sm" variant="tertiary" icon={faXmark} aria-label="Close radio" title="Close (Esc)" onclick={close} />
    </header>

    <Screen />

    <div class="handset__keys" role="group" aria-label="Channel and volume">
        <Button size="sm" variant="secondary" block disabled={!radio.power || radio.frequency <= 0} onclick={() => step(-1)}>Channel down</Button>
        <Button size="sm" variant="secondary" block disabled={!radio.power || atTop} onclick={() => step(1)}>Channel up</Button>
        <Button size="sm" variant="secondary" block disabled={!radio.power} onclick={() => volume(-1)}>Volume down</Button>
        <Button size="sm" variant="secondary" block disabled={!radio.power} onclick={() => volume(1)}>Volume up</Button>
        <Button size="sm" variant="secondary" block onclick={() => clicks(-1)}>Clicks quieter</Button>
        <Button size="sm" variant="secondary" block onclick={() => clicks(1)}>Clicks louder</Button>
    </div>

    <form
        class="entry"
        onsubmit={(e) => {
            e.preventDefault();
            tuneTo(parsed);
        }}
    >
        <label class="entry__label" for={inputId}>Frequency</label>
        <div class="entry__row">
            <TextInput
                id={inputId}
                size="sm"
                mono
                inputmode="decimal"
                autocomplete="off"
                spellcheck="false"
                placeholder={range ? `${range.min}–${range.max}` : 'No radio'}
                disabled={!radio.power}
                invalid={outOfRange}
                aria-describedby="{inputId}-hint"
                bind:value={entry}
            />
            <Button size="sm" type="submit" disabled={!canTune}>Tune</Button>
        </div>
        <div class="entry__hint" class:is-warning={outOfRange} id="{inputId}-hint">
            {#if outOfRange}
                Outside this radio's range ({range.min}–{range.max}). The radio will refuse it.
            {:else if !radio.power}
                Turn the radio on to tune.
            {:else}
                One decimal place. Enter tunes.
            {/if}
        </div>
    </form>

    <footer class="handset__foot">
        <Button size="sm" variant="secondary" icon={faPowerOff} aria-pressed={radio.power} onclick={togglePower}>
            {radio.power ? 'Power off' : 'Power on'}
        </Button>
        <span class="handset__hints au-hint"><Kbd>↑</Kbd><Kbd>↓</Kbd> volume <Kbd>Esc</Kbd> close</span>
    </footer>
</section>

<style>
    .handset {
        display: flex;
        flex-direction: column;
        gap: var(--au-s3);
        width: 336px;
        padding: var(--au-s4);
        background: var(--au-bg);
        color: var(--au-text);
        border-radius: var(--au-radius);
        box-shadow: var(--au-shadow-2);
    }
    .handset__head {
        display: flex;
        align-items: center;
        gap: var(--au-s2);
        min-height: 34px;
    }
    .handset__title {
        flex: 1;
        min-width: 0;
        margin: 0;
        font-size: var(--au-fs-sm);
    }
    .handset__keys {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--au-s2);
    }
    .entry {
        margin: 0;
    }
    .entry__label {
        display: block;
        font-weight: 700;
        font-size: var(--au-fs-xs);
        margin-bottom: var(--au-s1);
    }
    .entry__row {
        display: flex;
        gap: var(--au-s2);
    }
    .entry__row :global(.au-input) {
        flex: 1;
        min-width: 0;
        width: auto;
    }
    .entry__hint {
        margin-top: var(--au-s1);
        font-size: var(--au-fs-xs);
        color: var(--au-hint);
        min-height: 21px;
    }
    .entry__hint.is-warning {
        color: var(--au-warning);
    }
    .handset__foot {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--au-s2);
        padding-top: var(--au-s3);
        border-top: 1px solid var(--au-bg-alt-shade);
    }
    .handset__hints {
        display: inline-flex;
        align-items: center;
        gap: var(--au-s1);
        white-space: nowrap;
    }
</style>
