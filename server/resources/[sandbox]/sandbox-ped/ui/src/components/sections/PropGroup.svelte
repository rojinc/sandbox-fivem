<script>
    import { catalog, ensureDrawables, requestTextures } from '../../state/catalog.svelte.js';
    import { pedState, act, sound } from '../../state/ped.svelte.js';
    import { PROPS } from '../../data/sections.js';
    import Group from '../controls/Group.svelte';
    import Row from '../controls/Row.svelte';
    import Stepper from '../controls/Stepper.svelte';

    /** One prop slot (hat, glasses...): worn or not, then style and variant. */
    let { name } = $props();

    const prop = $derived(pedState.ped.customization.props[name]);
    const label = $derived(PROPS[name] ?? name);
    const id = $derived(prop?.componentId ?? 0);
    const drawable = $derived(Number(prop?.drawableId) || 0);
    const allowed = $derived(catalog.drawables.props[id]);
    const textures = $derived(catalog.textures.props[id]);
    const pos = $derived(allowed ? allowed.indexOf(drawable) : -1);
    const worn = $derived(prop ? !prop.disabled : false);

    $effect(() => {
        void catalog.generation;
        ensureDrawables('props', id);
    });
    $effect(() => {
        void catalog.generation;
        if (worn) requestTextures('props', id, drawable);
    });

    function setStyle(i) {
        if (!allowed?.length) return;
        act.prop(name, 'drawableId', allowed[i]);
        act.prop(name, 'textureId', 0);
    }
</script>

{#if prop}
    <Group
        title={label}
        toggle
        checked={worn}
        ontoggle={(on) => {
            sound('SELECT');
            act.prop(name, 'disabled', !on);
        }}
    >
        <Row label="Style" note={allowed && pos < 0 ? 'Your current one is not sold here' : undefined}>
            <Stepper label="{label} style" index={pos} count={allowed ? allowed.length : null} text={allowed ? (pos < 0 ? `– / ${allowed.length}` : undefined) : 'Loading'} onchange={setStyle} />
        </Row>
        <Row label="Variant">
            <Stepper label="{label} variant" index={Number(prop.textureId) || 0} count={textures || null} text={textures === undefined ? 'Loading' : textures === 0 ? 'None' : undefined} onchange={(v) => act.prop(name, 'textureId', v)} />
        </Row>
    </Group>
{/if}
