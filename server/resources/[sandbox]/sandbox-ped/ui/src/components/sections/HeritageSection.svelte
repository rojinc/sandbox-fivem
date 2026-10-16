<script>
    import { Checkbox } from '@sandbox/ui-kit';
    import { pedState, act, sound } from '../../state/ped.svelte.js';
    import { HEAD_BLEND_MAX } from '../../data/faceFeatures.js';
    import Group from '../controls/Group.svelte';
    import Row from '../controls/Row.svelte';
    import Stepper from '../controls/Stepper.svelte';
    import Range from '../controls/Range.svelte';

    /**
     * SetPedHeadBlendData. One face: face3 sets both shape and skin (mix 100).
     * Two parents: face3.mix 0, then face1/face2 give shape and skin, and the
     * face1/face2 mixes blend them.
     */
    const face = $derived(pedState.ped.customization.face);
    const blended = $derived(Number(face.face3.mix) === 0);
    const COUNT = HEAD_BLEND_MAX + 1;

    let mixParents = $state(false);
    $effect.pre(() => {
        mixParents = blended;
    });
</script>

<div class="ped-intro">
    <Checkbox
        label="Mix two parents"
        bind:checked={mixParents}
        onchange={(e) => {
            sound('SELECT');
            act.headBlend('face3', 'mix', e.currentTarget.checked ? 0 : 100);
        }}
    />
</div>

{#if !blended}
    <Group title="Face">
        <Row label="Face and skin">
            <Stepper label="Face" index={Number(face.face3.index) || 0} count={COUNT} onchange={(v) => act.headBlend('face3', 'index', v)} />
        </Row>
    </Group>
{:else}
    <Group title="First parent">
        <Row label="Face">
            <Stepper label="First parent face" index={Number(face.face1.index) || 0} count={COUNT} onchange={(v) => act.headBlend('face1', 'index', v)} />
        </Row>
        <Row label="Skin">
            <Stepper label="First parent skin" index={Number(face.face1.texture) || 0} count={COUNT} onchange={(v) => act.headBlend('face1', 'texture', v)} />
        </Row>
    </Group>
    <Group title="Second parent">
        <Row label="Face">
            <Stepper label="Second parent face" index={Number(face.face2.index) || 0} count={COUNT} onchange={(v) => act.headBlend('face2', 'index', v)} />
        </Row>
        <Row label="Skin">
            <Stepper label="Second parent skin" index={Number(face.face2.texture) || 0} count={COUNT} onchange={(v) => act.headBlend('face2', 'texture', v)} />
        </Row>
    </Group>
    <Group title="Likeness">
        <p class="ped-hint">At 0% your character takes after the first parent, at 100% the second.</p>
        <Range label="Face shape" value={face.face1.mix} unit="%" onchange={(v) => act.headBlend('face1', 'mix', v)} />
        <Range label="Skin tone" value={face.face2.mix} unit="%" onchange={(v) => act.headBlend('face2', 'mix', v)} />
    </Group>
{/if}

<style>
    .ped-intro {
        margin: 0 0 var(--au-s5);
    }
    .ped-hint {
        color: var(--au-muted);
        font-size: var(--au-fs-xs);
        margin: 0 0 var(--au-s1);
    }
</style>
