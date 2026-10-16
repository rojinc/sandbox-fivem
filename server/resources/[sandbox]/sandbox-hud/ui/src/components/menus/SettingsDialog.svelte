<script>
    import { Modal, Button, Field, Select, Checkbox, TextInput, fetchNui, onKey } from '@sandbox/ui-kit';
    import { hud, defaultConfig, setConfig } from '../../state/hud.svelte.js';

    /** /hud configuration dialog (client/events.lua UI:Client:Configure, SaveConfig). */
    let form = $state({ ...defaultConfig });

    $effect(() => {
        if (hud.settings) form = { ...defaultConfig, ...hud.config };
    });

    function close() {
        hud.settings = false;
        fetchNui('CloseUI');
    }
    function save(e) {
        e?.preventDefault();
        const next = { ...form, skewAmount: Math.max(0, Math.min(35, Number(form.skewAmount) || 0)) };
        setConfig(next);
        fetchNui('SaveConfig', next);
        close();
    }

    onKey('Escape', () => (hud.settings ? close() : false));
</script>

{#if hud.settings}
    <div class="hud-ui">
        <Modal title="HUD settings" onclose={close} width="720px">
            <form id="hud-settings" class="grid" onsubmit={save}>
                <div>
                    <h3>Compass</h3>
                    <Field label="Position" id="compassLocation">
                        <Select id="compassLocation" bind:value={form.compassLocation} options={[{ value: 'top', label: 'Top of the screen' }, { value: 'bottom', label: 'Bottom of the screen' }, { value: 'hidden', label: 'Hidden' }]} />
                    </Field>
                    <div class="checks">
                        <Checkbox bind:checked={form.compassAlways} label="Show on foot as well as in vehicles" />
                        <Checkbox bind:checked={form.hideCrossStreet} label="Hide the cross street" />
                        <Checkbox bind:checked={form.hideCompassBg} label="Hide the boxes behind the text" />
                        <Checkbox bind:checked={form.maskRadio} label="Hide the radio channel number" />
                    </div>
                </div>
                <div>
                    <h3>Vehicle</h3>
                    <Field label="Speed unit" id="speedUnit">
                        <Select id="speedUnit" bind:value={form.speedUnit} options={[{ value: 'mph', label: 'Miles per hour' }, { value: 'kph', label: 'Kilometres per hour' }]} />
                    </Field>
                    <div class="checks">
                        <Checkbox bind:checked={form.showRPM} label="Show the RPM arc" />
                        <Checkbox bind:checked={form.showGears} label="Show gears" />
                    </div>
                    <h3 class="later">Style</h3>
                    <div class="checks">
                        <Checkbox bind:checked={form.skewed} label="Tilt the clusters in perspective" />
                    </div>
                    {#if form.skewed}
                        <Field label="Tilt amount (degrees)" id="skewAmount" hint="10 to 20 reads best">
                            <TextInput id="skewAmount" type="number" bind:value={form.skewAmount} min="0" max="35" width="140px" block={false} mono />
                        </Field>
                    {/if}
                </div>
            </form>
            {#snippet actions()}
                <Button variant="secondary" onclick={close}>Cancel</Button>
                <Button type="submit" form="hud-settings" icon="check">Save</Button>
            {/snippet}
        </Modal>
    </div>
{/if}

<style>
    .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 32px;
    }
    h3 {
        font-size: 16px;
        margin-bottom: 12px;
    }
    .later {
        margin-top: 8px;
    }
    .checks {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 16px;
    }
</style>
