<script>
    import { fly } from 'svelte/transition';
    import { Button, Field, Select, TextInput, Checkbox, Icon, fetchNui, uid } from '@sandbox/ui-kit';
    import { radar, applySettings, settingsPayload } from '../../state/radar.svelte.js';
    import { POSITIONS, POSITION_ORDER } from '../../positions.js';

    /**
     * The hand-held remote (client/remote.lua): a dark settings panel docked bottom
     * centre, where Lua parks the cursor (SetCursorLocation 0.5, 0.8). Every change
     * is sent straight away as the complete settings object (UpdateSettings).
     */
    const titleId = uid('remote');
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
</script>

{#if radar.remoteOpen}
    <div class="remote">
        <div class="remote__panel" role="dialog" aria-labelledby={titleId} transition:fly={{ y: 24, duration: 200 }}>
            <div class="remote__head">
                <div class="remote__heading">
                    <strong class="remote__eyebrow">Radar</strong>
                    <h2 class="remote__title" id={titleId}>Remote</h2>
                    <div class="remote__subline">Changes apply straight away</div>
                </div>
                <button type="button" class="remote__close" aria-label="Close remote" onclick={close}><Icon icon="x" /></button>
            </div>

            <form
                class="remote__body"
                onsubmit={(e) => {
                    e.preventDefault();
                    commitFast();
                }}
            >
                <section class="remote__section">
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
                </section>

                <section class="remote__section">
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
                </section>

                <section class="remote__section">
                    <h3>Display</h3>
                    <div class="remote__grid">
                        <Field label="Position" id="location">
                            <Select id="location" value={settings.location} options={positionOptions} onchange={(e) => save({ location: Number(e.currentTarget.value) })} />
                        </Field>
                        <Field label="Size" id="scale">
                            <Select id="scale" value={settings.scale} options={scaleOptions} onchange={(e) => save({ scale: Number(e.currentTarget.value) })} />
                        </Field>
                    </div>
                </section>
            </form>

            <div class="remote__actions">
                <Button icon="check" onclick={close}>Done</Button>
            </div>
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
    /* Dialog surface, as the kit Modal draws it: page colour, 1px line, 8px radius. */
    .remote__panel {
        width: 480px;
        background: var(--au-bg);
        color: var(--au-text);
        border: 1px solid var(--au-border);
        border-radius: var(--au-radius-lg);
        box-shadow: var(--au-shadow-2);
    }
    .remote__head {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 20px 24px 0;
    }
    .remote__heading {
        flex: 1;
        min-width: 0;
    }
    .remote__eyebrow {
        display: block;
        margin-bottom: 2px;
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--au-action);
    }
    .remote__title {
        margin: 0;
        font-size: 20px;
    }
    .remote__subline {
        margin-top: 2px;
        font-size: 13px;
        color: var(--au-muted);
    }
    .remote__close {
        display: flex;
        margin: -4px -8px 0 0;
        padding: 4px;
        border: 0;
        border-radius: var(--au-radius);
        background: transparent;
        color: var(--au-muted);
        font-size: 20px;
        cursor: pointer;
    }
    .remote__close:hover {
        color: var(--au-text);
        background: var(--au-bg-alt);
    }
    .remote__body {
        padding: 16px 24px 0;
        font-size: 14px;
    }
    .remote__section + .remote__section {
        padding-top: 12px;
        border-top: 1px solid var(--au-border);
    }
    .remote__section h3 {
        margin: 0 0 8px;
        font-size: 16px;
        font-weight: 500;
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
        margin: 0;
        padding: 0;
        border: 0;
    }
    .antenna legend {
        padding: 0;
        font-size: 14px;
        font-weight: 500;
        color: var(--au-muted);
    }
    .antenna__check {
        margin: 4px 0 8px;
    }
    .remote__actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding: 4px 24px 20px;
    }
</style>
