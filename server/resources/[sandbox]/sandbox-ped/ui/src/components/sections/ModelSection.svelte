<script>
    import { Field, Select, PageAlert, uid } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import { app, isFreemode } from '../../state/app.svelte.js';
    import { pedState, sound } from '../../state/ped.svelte.js';
    import { invalidateRanges } from '../../state/catalog.svelte.js';
    import PED_MODELS from '../../data/peds.js';
    import Group from '../controls/Group.svelte';
    import Row from '../controls/Row.svelte';
    import Stepper from '../controls/Stepper.svelte';

    /**
     * Swap the whole ped model (SetPed). Lua answers true once the model has
     * loaded; clothing ranges differ per model, so they are asked for again.
     */
    const listId = uid('model');
    const wlId = uid('wl');
    const models = $derived(PED_MODELS[pedState.gender] ?? PED_MODELS[0]);
    const model = $derived(pedState.ped.model || models[0]);
    const index = $derived(models.indexOf(model));
    const whitelisted = $derived(app.whitelistedPeds);
    const wlValue = $derived(whitelisted.some((p) => p.model === model) ? model : '');
    let failed = $state(false);

    async function setModel(value) {
        if (app.busy || !value || value === pedState.ped.model) return;
        app.busy = true;
        failed = false;
        sound('SELECT');
        let ok = false;
        try {
            ok = await fetchNui('SetPed', { value });
        } catch {
            ok = false;
        }
        app.busy = false;
        if (ok === true || (ok && ok !== 'false')) {
            pedState.ped.model = value;
            invalidateRanges();
        } else {
            failed = true;
        }
    }
</script>

{#if !isFreemode()}
    <PageAlert type="warning" compact>Only the multiplayer ped shows every clothing, hair and tattoo option.</PageAlert>
{/if}

{#if failed}
    <PageAlert type="error" compact>That model did not load in time. Choose it again or pick another one.</PageAlert>
{/if}

<Group title="Model">
    <Row label="Browse models">
        <Stepper label="Ped model" {index} count={models.length} text={index < 0 ? `– / ${models.length}` : undefined} disabled={app.busy} onchange={(i) => setModel(models[i])} />
    </Row>
    <Field label="Model name" id={listId}>
        <Select id={listId} class="au-mono" value={index >= 0 ? model : ''} placeholder="Not in this list" disabled={app.busy} onchange={(e) => setModel(e.currentTarget.value)}>
            {#each models as m (m)}<option value={m}>{m}</option>{/each}
        </Select>
    </Field>
</Group>

{#if whitelisted.length}
    <Group title="Whitelisted models">
        <p class="ped-hint" id="{wlId}-hint">Models the server has set aside for you.</p>
        <Select id={wlId} aria-label="Whitelisted model" aria-describedby="{wlId}-hint" value={wlValue} placeholder="None in use" disabled={app.busy} onchange={(e) => setModel(e.currentTarget.value)}>
            {#each whitelisted as p (p.model)}<option value={p.model}>{p.label || p.model}</option>{/each}
        </Select>
    </Group>
{/if}

<style>
    .ped-hint {
        color: var(--au-muted);
        font-size: var(--au-fs-xs);
        margin: 0 0 var(--au-s2);
    }
</style>
