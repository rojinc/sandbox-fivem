<script>
    import { catalog } from '../../state/catalog.svelte.js';
    import { pedState, act } from '../../state/ped.svelte.js';
    import Row from '../controls/Row.svelte';
    import Stepper from '../controls/Stepper.svelte';
    import Swatches from '../controls/Swatches.svelte';

    /**
     * Base and highlight colour for hair, eyebrows or facial hair
     * (ped.customization.colors.<name>), from the game's hair palette.
     * Renders rows only; the caller puts them in a group.
     */
    let { name, what, labels = ['Colour', 'Highlight'] } = $props();

    const colours = $derived(pedState.ped.customization.colors[name]);
    const count = $derived(catalog.hairColours || null);
    const known = $derived(Object.keys(catalog.palette).length > 0);
</script>

{#snippet slot(type, label)}
    {@const idx = Number(colours[type]?.index) || 0}
    <Row {label}>
        <Stepper label="{what} {label.toLowerCase()}" index={idx} {count} text={count ? undefined : 'Loading'} onchange={(v) => act.hairColour(name, type, v)} />
    </Row>
    {#if known}
        <Swatches palette={catalog.palette} count={catalog.hairColours} value={idx} label="{what} {label.toLowerCase()}" onchange={(v) => act.hairColour(name, type, v)} />
    {/if}
{/snippet}

{#if colours}
    {@render slot('color1', labels[0])}
    {@render slot('color2', labels[1])}
{/if}
