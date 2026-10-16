<script>
    import { Select, uid } from '@sandbox/ui-kit';
    import { catalog } from '../../state/catalog.svelte.js';
    import { pedState, act, sound } from '../../state/ped.svelte.js';
    import Group from '../controls/Group.svelte';
    import Row from '../controls/Row.svelte';
    import ComponentGroup from './ComponentGroup.svelte';
    import HairColour from './HairColour.svelte';

    /**
     * Haircut (component 2), its colours, and the hairline fade
     * (customization.hairOverlay: -1 follows the haircut, 0 none, 1..n one of
     * Config.CustomHairOverlays).
     */
    const fadeId = uid('fade');
    const fadeOptions = $derived([
        { value: '-1', label: 'Match the haircut' },
        { value: '0', label: 'No fade' },
        ...Array.from({ length: Math.max(catalog.hairOverlays, Number(pedState.ped.customization.hairOverlay) || 0) }, (_, i) => ({ value: String(i + 1), label: `Fade ${i + 1}` })),
    ]);

    let fade = $state('-1');
    $effect.pre(() => {
        fade = String(pedState.ped.customization.hairOverlay ?? -1);
    });
</script>

<ComponentGroup name="hair" title="Cut" />

<Group title="Colour">
    <HairColour name="hair" what="Hair" labels={['Main', 'Highlight']} />
</Group>

<Group title="Hairline">
    <Row label="Fade" note="Shading under the cut" id={fadeId}>
        <div class="ped-pick">
            <Select
                id={fadeId}
                options={fadeOptions}
                bind:value={fade}
                onchange={(e) => {
                    sound('UPDOWN');
                    act.hairOverlay(Number(e.currentTarget.value));
                }}
            />
        </div>
    </Row>
</Group>

<style>
    .ped-pick {
        width: 216px;
    }
</style>
