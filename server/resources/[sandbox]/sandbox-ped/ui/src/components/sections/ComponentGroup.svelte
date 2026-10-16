<script>
    import { catalog, ensureDrawables, requestTextures } from '../../state/catalog.svelte.js';
    import { pedState, act } from '../../state/ped.svelte.js';
    import { COMPONENTS } from '../../data/sections.js';
    import Group from '../controls/Group.svelte';
    import Row from '../controls/Row.svelte';
    import Stepper from '../controls/Stepper.svelte';

    /**
     * One clothing slot (ped.customization.components.<name>): style and variant.
     * The style steps through the drawables this store sells (SET_MAX_DRAWABLE);
     * a new style starts on its first variant, as in the game.
     */
    let { name, title } = $props();

    const comp = $derived(pedState.ped.customization.components[name]);
    const id = $derived(comp?.componentId ?? 0);
    const drawable = $derived(Number(comp?.drawableId) || 0);
    const allowed = $derived(catalog.drawables.components[id]);
    const textures = $derived(catalog.textures.components[id]);
    const pos = $derived(allowed ? allowed.indexOf(drawable) : -1);

    $effect(() => {
        void catalog.generation;
        ensureDrawables('components', id);
    });
    $effect(() => {
        void catalog.generation;
        requestTextures('components', id, drawable);
    });

    function setStyle(i) {
        if (!allowed?.length) return;
        act.component(name, 'drawableId', allowed[i]);
        act.component(name, 'textureId', 0);
    }
</script>

{#if comp}
    <Group title={title ?? COMPONENTS[name] ?? name}>
        <Row label="Style" note={allowed && pos < 0 ? 'Your current one is not sold here' : undefined}>
            <Stepper label="{title ?? COMPONENTS[name]} style" index={pos} count={allowed ? allowed.length : null} text={allowed ? (pos < 0 ? `– / ${allowed.length}` : undefined) : 'Loading'} onchange={setStyle} />
        </Row>
        <Row label="Variant">
            <Stepper label="{title ?? COMPONENTS[name]} variant" index={Number(comp.textureId) || 0} count={textures || null} text={textures === undefined ? 'Loading' : textures === 0 ? 'None' : undefined} onchange={(v) => act.component(name, 'textureId', v)} />
        </Row>
    </Group>
{/if}
