<script>
    import { Select, uid } from '@sandbox/ui-kit';
    import { pedState, act, sound } from '../../state/ped.svelte.js';
    import { FACE_FEATURE_GROUPS, EYE_COLORS } from '../../data/faceFeatures.js';
    import Group from '../controls/Group.svelte';
    import Range from '../controls/Range.svelte';
    import Row from '../controls/Row.svelte';

    /** Eye colour (named) and the 20 SetPedFaceFeature values (-100 to 100). */
    const features = $derived(pedState.ped.customization.face.features);
    const eyeId = uid('eye');

    // Some game eye colours share a name: number the repeats so every option reads differently.
    const EYE_OPTIONS = EYE_COLORS.map((label, i) => ({
        value: String(i),
        label: EYE_COLORS.indexOf(label) !== i ? `${label} (${i + 1})` : label,
    }));

    let eye = $state('0');
    $effect.pre(() => {
        eye = String(Number(pedState.ped.customization.eyeColor) || 0);
    });
</script>

{#each FACE_FEATURE_GROUPS as g (g.title)}
    <Group title={g.title}>
        {#if g.title === 'Eyes'}
            <Row label="Colour" id={eyeId}>
                <div class="ped-pick">
                    <Select
                        id={eyeId}
                        options={EYE_OPTIONS}
                        bind:value={eye}
                        onchange={(e) => {
                            sound('UPDOWN');
                            act.eyeColour(Number(e.currentTarget.value));
                        }}
                    />
                </div>
            </Row>
        {/if}
        {#each g.items as it (it.index)}
            <Range label={it.label} value={features[it.index]} min={-100} max={100} onchange={(v) => act.faceFeature(it.index, v)} />
        {/each}
    </Group>
{/each}

<style>
    .ped-pick {
        width: 216px;
    }
</style>
