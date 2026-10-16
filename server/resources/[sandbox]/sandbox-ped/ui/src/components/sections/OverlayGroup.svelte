<script>
    import { pedState, act, sound } from '../../state/ped.svelte.js';
    import { OVERLAYS, OVERLAY_COLOURS } from '../../data/overlays.js';
    import Group from '../controls/Group.svelte';
    import Row from '../controls/Row.svelte';
    import Stepper from '../controls/Stepper.svelte';
    import Range from '../controls/Range.svelte';

    /**
     * A head overlay (blemishes, makeup, eyebrows...): applied or not, style,
     * opacity and, for tinted overlays, colour indices from the makeup palette.
     * `colours: false` hides the tint where the hair palette sets it instead.
     */
    let { key, colours = true, children } = $props();

    const def = $derived(OVERLAYS[key]);
    const o = $derived(pedState.ped.customization.overlay[key]);
</script>

{#if def && o}
    <Group
        title={def.label}
        toggle
        checked={!o.disabled}
        ontoggle={(on) => {
            sound('SELECT');
            act.overlay(key, 'disabled', !on);
        }}
    >
        <Row label="Style">
            <Stepper label="{def.label} style" index={Number(o.index) || 0} count={def.max + 1} onchange={(v) => act.overlay(key, 'index', v)} />
        </Row>
        <Range label="Opacity" value={o.opacity ?? 100} unit="%" onchange={(v) => act.overlay(key, 'opacity', v)} />
        {#if colours && def.colors >= 1}
            <Row label={def.colors >= 2 ? 'First colour' : 'Colour'}>
                <Stepper label="{def.label} colour" index={Number(o.color1) || 0} count={OVERLAY_COLOURS} onchange={(v) => act.overlay(key, 'color1', v)} />
            </Row>
        {/if}
        {#if colours && def.colors >= 2}
            <Row label="Second colour">
                <Stepper label="{def.label} second colour" index={Number(o.color2) || 0} count={OVERLAY_COLOURS} onchange={(v) => act.overlay(key, 'color2', v)} />
            </Row>
        {/if}
        {@render children?.()}
    </Group>
{/if}
