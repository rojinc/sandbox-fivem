<script>
    import { Button, Select, PageAlert } from '@sandbox/ui-kit';
    import { app } from '../../state/app.svelte.js';
    import { pedState, act, sound } from '../../state/ped.svelte.js';
    import { MAX_TATTOOS, collectionName, tattooName } from '../../data/sections.js';
    import Row from '../controls/Row.svelte';
    import Stepper from '../controls/Stepper.svelte';

    /**
     * The tattoo slots of one body zone. Slot indexes are positions in the
     * whole ped.customization.tattoos list (what Lua expects); the designs are
     * the SET_TATTOOS_DATA entries for this zone.
     */
    let { zone, label, heading = false } = $props();

    const all = $derived(pedState.ped.customization.tattoos);
    const designs = $derived(app.tattoos.filter((t) => t.Zone === zone));
    const slots = $derived(all.map((t, index) => ({ t, index })).filter((s) => s.t.Zone === zone));
    const full = $derived(all.length >= MAX_TATTOOS);
    const lower = $derived(label.toLowerCase());

    /** Designs grouped by collection for the select. */
    const groups = $derived.by(() => {
        const map = new Map();
        for (const d of designs) {
            const c = collectionName(d.Collection);
            if (!map.has(c)) map.set(c, []);
            map.get(c).push(d);
        }
        return [...map.entries()];
    });

    function choose(index, design) {
        if (!design) return;
        sound('UPDOWN');
        act.tattooSet(index, { Collection: design.Collection, Name: design.Name, HashNameMale: design.HashNameMale, HashNameFemale: design.HashNameFemale, Zone: design.Zone });
    }
</script>

<section class="ped-zone">
    {#if heading}<h3 class="ped-zone__title">{label}</h3>{/if}

    {#if !slots.length}
        <p class="ped-zone__empty">You have no {lower} tattoos. Add a slot, then choose a design for it.</p>
    {/if}

    {#each slots as { t, index }, n (index)}
        {@const pos = designs.findIndex((d) => d.Name === t.Name && d.Collection === t.Collection)}
        <div class="ped-slot">
            <Row label="Tattoo {n + 1}" note={pos >= 0 ? collectionName(t.Collection) : 'No design yet'}>
                <Stepper label="{label} tattoo {n + 1} design" index={pos} count={designs.length || null} text={designs.length ? (pos < 0 ? `– / ${designs.length}` : undefined) : 'None'} onchange={(i) => choose(index, designs[i])} />
            </Row>
            <div class="ped-slot__pick">
                <Select
                    value={pos >= 0 ? String(pos) : ''}
                    placeholder="Choose a design"
                    aria-label="{label} tattoo {n + 1} design"
                    onchange={(e) => choose(index, designs[Number(e.currentTarget.value)])}
                >
                    {#each groups as [collection, items] (collection)}
                        <optgroup label={collection}>
                            {#each items as d (d.Collection + d.Name)}
                                <option value={String(designs.indexOf(d))}>{tattooName(d.Name)}</option>
                            {/each}
                        </optgroup>
                    {/each}
                </Select>
                <Button
                    variant="secondary"
                    size="sm"
                    onclick={() => {
                        sound('BACK');
                        act.tattooRemove(index);
                    }}>Remove</Button
                >
            </div>
        </div>
    {/each}

    {#if full}
        <PageAlert type="warning" compact>You have {MAX_TATTOOS} tattoos, the most one character can have. Remove one to add another.</PageAlert>
    {:else if !designs.length}
        <p class="ped-zone__empty">This parlour has no {lower} designs.</p>
    {:else}
        <Button
            variant="secondary"
            size="sm"
            icon="plus"
            onclick={() => {
                sound('SELECT');
                act.tattooAdd(zone);
            }}>Add {lower} tattoo</Button
        >
    {/if}
</section>

<style>
    .ped-zone {
        margin: 0 0 var(--au-s6);
    }
    .ped-zone__title {
        margin: 0 0 var(--au-s2);
        font-size: var(--au-fs-sm);
        font-weight: 700;
    }
    .ped-zone__empty {
        color: var(--au-muted);
        font-size: var(--au-fs-xs);
        margin: 0 0 var(--au-s3);
    }
    .ped-slot {
        padding: 0 0 var(--au-s4);
        margin: 0 0 var(--au-s4);
        border-bottom: 1px solid var(--au-border);
    }
    .ped-slot__pick {
        display: flex;
        align-items: center;
        gap: var(--au-s2);
    }
    .ped-slot__pick :global(.au-select-wrap) {
        flex: 1;
        min-width: 0;
    }
</style>
