<script>
    import { pedState } from '../../state/ped.svelte.js';
    import { TATTOO_ZONES, sectionDef } from '../../data/sections.js';
    import ComponentGroup from './ComponentGroup.svelte';
    import PropGroup from './PropGroup.svelte';
    import OverlayGroup from './OverlayGroup.svelte';
    import HairColour from './HairColour.svelte';
    import HairSection from './HairSection.svelte';
    import HeritageSection from './HeritageSection.svelte';
    import FeaturesSection from './FeaturesSection.svelte';
    import ModelSection from './ModelSection.svelte';
    import TattooZone from './TattooZone.svelte';

    /** The controls of the open section. */
    let { section } = $props();

    const def = $derived(sectionDef(section));
    const overlay = $derived(pedState.ped.customization.overlay);
</script>

{#if def?.zone}
    <TattooZone zone={def.zone} label={def.label} />
{:else if section === 'heritage'}
    <HeritageSection />
{:else if section === 'features'}
    <FeaturesSection />
{:else if section === 'skin'}
    {#each ['blemish', 'ageing', 'complexion', 'sundamage', 'freckles'] as k (k)}<OverlayGroup key={k} />{/each}
{:else if section === 'makeup'}
    {#each ['makeup', 'blush', 'lipstick'] as k (k)}<OverlayGroup key={k} />{/each}
{:else if section === 'hair'}
    <HairSection />
{:else if section === 'brows'}
    <OverlayGroup key="eyebrows" colours={false}>
        {#if !overlay.eyebrows.disabled}<HairColour name="eyebrows" what="Eyebrow" />{/if}
    </OverlayGroup>
    <OverlayGroup key="facialhair" colours={false}>
        {#if !overlay.facialhair.disabled}<HairColour name="facialhair" what="Facial hair" />{/if}
    </OverlayGroup>
{:else if section === 'bodyhair'}
    <OverlayGroup key="chesthair" />
{:else if section === 'arms'}
    <ComponentGroup name="torso" />
{:else if section === 'body'}
    <OverlayGroup key="bodyblemish" />
    <OverlayGroup key="addbodyblemish" />
{:else if section === 'model'}
    <ModelSection />
{:else if section === 'tops'}
    {#each ['torso2', 'undershirt', 'kevlar', 'torso'] as n (n)}<ComponentGroup name={n} />{/each}
{:else if section === 'legs'}
    {#each ['leg', 'shoes'] as n (n)}<ComponentGroup name={n} />{/each}
{:else if section === 'accessories'}
    {#each ['hat', 'glass', 'ear', 'watch', 'bracelet'] as n (n)}<PropGroup name={n} />{/each}
{:else if section === 'extras'}
    {#each ['mask', 'bag', 'accessory', 'badge'] as n (n)}<ComponentGroup name={n} />{/each}
{:else if section === 'tattoos'}
    {#each TATTOO_ZONES as z (z.zone)}<TattooZone zone={z.zone} label={z.label} heading />{/each}
{/if}
