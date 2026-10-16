<script>
    import { Button, Field, Select } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import AppPage from '../../components/common/AppPage.svelte';
    import { data, updateSetting } from '../../state/data.svelte.js';
    import { RINGTONES, TEXTTONES } from './sounds.js';

    /** Pick the ringtone and text tone; Play tries one at your current volume. */
    const s = $derived(data.player?.PhoneSettings ?? {});

    let ring = $state('ringtone1.ogg');
    let textTone = $state('text1.ogg');
    $effect.pre(() => {
        ring = s.ringtone ?? 'ringtone1.ogg';
        textTone = s.texttone ?? 'text1.ogg';
    });
</script>

<AppPage title="Ringtone and text tone">
    <div class="ph-form">
        <Field label="Ringtone" hint="Plays when someone calls you" id="snd-ring">
            <div class="pair">
                <Select id="snd-ring" options={RINGTONES} bind:value={ring} onchange={() => updateSetting('ringtone', ring, fetchNui)} />
                <Button variant="secondary" onclick={() => fetchNui('TestSound', { type: 'ringtone', val: ring })}>Play</Button>
            </div>
        </Field>
        <Field label="Text tone" hint="Plays when a text or notification arrives" id="snd-text">
            <div class="pair">
                <Select id="snd-text" options={TEXTTONES} bind:value={textTone} onchange={() => updateSetting('texttone', textTone, fetchNui)} />
                <Button variant="secondary" onclick={() => fetchNui('TestSound', { type: 'texttone', val: textTone })}>Play</Button>
            </div>
        </Field>
    </div>
</AppPage>

<style>
    .pair {
        display: flex;
        align-items: flex-start;
        gap: var(--au-s3);
    }
    .pair :global(.au-select-wrap) {
        flex: 1;
        min-width: 0;
    }
</style>
