<script>
    import { fly } from 'svelte/transition';
    import { Header, Footer, Button, Field, Select, TextInput, Checkbox, Icon, fetchNui } from '@sandbox/ui-kit';
    import { faXmark, faCheck } from '@fortawesome/free-solid-svg-icons';
    import { radar, applySettings, settingsPayload } from '../../state/radar.svelte.js';
    import { POSITIONS, POSITION_ORDER } from '../../positions.js';
    import KeyHints from '../radar/KeyHints.svelte';

    /**
     * The hand-held remote (client/remote.lua): a small settings form docked bottom
     * centre, where Lua parks the cursor (SetCursorLocation 0.5, 0.8). Every change
     * is sent straight away as the complete settings object (UpdateSettings).
     */
    const FAST = { off: 20, min: 0, max: 300 }; // Lua clamps 0..300 and arms alerts only above 20
    const scaleOptions = Array.from({ length: 14 }, (_, i) => 85 + i * 5).map((v) => ({ value: v, label: `${v}%` }));
    const positionOptions = POSITION_ORDER.map((id) => ({ value: id, label: POSITIONS[id].label }));
    const laneOptions = [
        { value: 'same', label: 'Same lane' },
        { value: 'opp', label: 'Opposite lane' },
    ];
    const antennas = [
        { key: 'frontRadar', label: 'Front antenna' },
        { key: 'rearRadar', label: 'Rear antenna' },
    ];

    const settings = $derived(radar.settings);

    function save(patch) {
        applySettings(patch);
        fetchNui('UpdateSettings', settingsPayload(radar.settings));
    }
    function saveAntenna(key, patch) {
        save({ [key]: { ...settings[key], ...patch } });
    }
    function close() {
        fetchNui('CloseRemote');
    }

    // The threshold is typed, so it lives in local text until the operator commits it.
    let fastText = $state(String(radar.settings.fastSpeed));
    $effect(() => {
        fastText = String(settings.fastSpeed);
    });
    function commitFast() {
        if (fastText === '' || fastText === null || fastText === undefined) {
            fastText = String(settings.fastSpeed);
            return;
        }
        const n = Math.round(Number(fastText));
        const next = Number.isFinite(n) ? Math.min(FAST.max, Math.max(FAST.min, n)) : Number(settings.fastSpeed);
        fastText = String(next);
        if (next !== Number(settings.fastSpeed)) save({ fastSpeed: next });
    }

    const fastHint = $derived(
        Number(settings.fastSpeed) > FAST.off ? `Beeps and holds readings of ${settings.fastSpeed} mph or more. 20 or less turns it off.` : 'Off. Enter a speed above 20 mph to turn it on.',
    );

    const hints = [
        { key: 'Num *', label: 'Lock' },
        { key: 'Num -', label: 'Hide' },
        { key: 'Esc', label: 'Close' },
    ];
</script>

{#if radar.remoteOpen}
    <div class="remote">
        <div class="remote__panel au-light" role="dialog" aria-label="Radar remote" transition:fly={{ y: 24, duration: 200 }}>
            <Header compact title="Radar remote" subline="Changes apply straight away">
                {#snippet actions()}
                    <button type="button" class="remote__close" aria-label="Close remote" onclick={close}><Icon icon={faXmark} /></button>
                {/snippet}
            </Header>

            <form
                class="remote__body"
                onsubmit={(e) => {
                    e.preventDefault();
                    commitFast();
                }}
            >
                <h3>Antennas</h3>
                <div class="remote__grid">
                    {#each antennas as a (a.key)}
                        <fieldset class="antenna">
                            <legend>{a.label}</legend>
                            <div class="antenna__check">
                                <Checkbox
                                    label="Transmit"
                                    checked={Boolean(settings[a.key]?.transmit)}
                                    onchange={(e) => saveAntenna(a.key, { transmit: e.currentTarget.checked })}
                                />
                            </div>
                            <Field label="Beam" id="lane-{a.key}">
                                <Select
                                    id="lane-{a.key}"
                                    value={settings[a.key]?.lane === false ? 'opp' : 'same'}
                                    options={laneOptions}
                                    disabled={!settings[a.key]?.transmit}
                                    onchange={(e) => saveAntenna(a.key, { lane: e.currentTarget.value === 'same' })}
                                />
                            </Field>
                        </fieldset>
                    {/each}
                </div>

                <h3>Alerts</h3>
                <Field label="Fast alert threshold (mph)" id="fast" hint={fastHint}>
                    <TextInput
                        id="fast"
                        type="number"
                        min={FAST.min}
                        max={FAST.max}
                        step="5"
                        inputmode="numeric"
                        width="140px"
                        block={false}
                        mono
                        bind:value={fastText}
                        onchange={commitFast}
                        onblur={commitFast}
                    />
                </Field>

                <h3>Display</h3>
                <div class="remote__grid">
                    <Field label="Position" id="location">
                        <Select id="location" value={settings.location} options={positionOptions} onchange={(e) => save({ location: Number(e.currentTarget.value) })} />
                    </Field>
                    <Field label="Size" id="scale">
                        <Select id="scale" value={settings.scale} options={scaleOptions} onchange={(e) => save({ scale: Number(e.currentTarget.value) })} />
                    </Field>
                </div>
            </form>

            <Footer>
                <KeyHints {hints} />
                <span class="remote__spacer"></span>
                <Button icon={faCheck} onclick={close}>Done</Button>
            </Footer>
        </div>
    </div>
{/if}

<style>
    .remote {
        position: absolute;
        left: 50%;
        bottom: 24px;
        transform: translateX(-50%);
        pointer-events: auto;
    }
    .remote__panel {
        width: 480px;
        background: var(--au-bg);
        color: var(--au-text);
        border-radius: var(--au-radius);
        box-shadow: var(--au-shadow-2);
        overflow: hidden;
    }
    .remote__close {
        display: grid;
        place-items: center;
        width: 44px;
        height: 44px;
        border: 0;
        border-radius: var(--au-radius);
        background: transparent;
        color: var(--au-text);
        font-size: 20px;
        cursor: pointer;
    }
    .remote__close:hover {
        background: var(--au-bg-alt);
    }
    .remote__body {
        padding: 12px 24px 0;
    }
    .remote__body h3 {
        font-size: 16px;
        margin: 0 0 8px;
    }
    .remote__body :global(.au-field) {
        margin-bottom: 12px;
    }
    .remote__grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0 16px;
    }
    .antenna {
        min-width: 0;
        margin: 0 0 12px;
        padding: 0 12px;
        border: 1px solid var(--au-bg-alt-shade);
        border-radius: var(--au-radius);
    }
    .antenna legend {
        padding: 0 4px;
        font-weight: 700;
    }
    .antenna__check {
        margin: 2px 0 6px;
    }
    .remote__spacer {
        flex: 1;
    }
</style>
