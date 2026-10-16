<script>
    import { Button, Tag, Modal, Field, Select, Textarea, PageAlert } from '@sandbox/ui-kit';
    import { app, go, back, hasJob } from '../../state/app.svelte.js';
    import { toast } from '../../state/toasts.svelte.js';
    import { call, list } from '../../lib/api.js';
    import { formatDay, formatDateTime, personName } from '../../lib/format.js';
    import { VehicleTypes, VehicleFlagTypes, vehicleFlag } from '../../lib/data.js';
    import State from '../common/State.svelte';

    let { params = {} } = $props();

    let status = $state('loading');
    let v = $state(null);
    let dialog = $state(null);
    let busy = $state(false);
    let flagType = $state('');
    let flagText = $state('');
    let strikeText = $state('');
    let formError = $state('');

    async function load() {
        status = 'loading';
        const res = await call('View', { type: 'vehicle', id: params.id });
        if (!res || typeof res !== 'object') {
            status = res === null ? 'error' : 'missing';
            return;
        }
        v = res;
        status = 'ready';
    }

    $effect(() => {
        load();
    });

    const flags = $derived(list(v?.Flags));
    const strikes = $derived(list(v?.Strikes));
    const history = $derived(list(v?.OwnerHistory));
    const canEdit = $derived(hasJob('police'));
    const author = () => ({ SID: app.user?.SID, First: app.user?.First, Last: app.user?.Last, Callsign: app.user?.Callsign });

    function openDialog(name) {
        flagType = '';
        flagText = '';
        strikeText = '';
        formError = '';
        dialog = name;
    }

    async function addFlag() {
        if (!flagType) return (formError = 'Choose the type of flag.');
        if (flags.some((f) => f.Type === flagType)) return (formError = 'This vehicle already has that flag.');
        if (!flagText.trim()) return (formError = 'Describe why the vehicle is flagged.');
        busy = true;
        const doc = { Type: flagType, Description: flagText.trim(), Date: Date.now(), Author: author(), radarFlag: Boolean(vehicleFlag(flagType).radar) };
        const res = await call('Create', { type: 'vehicle-flag', parent: v.VIN, plate: v.RegisteredPlate, doc });
        busy = false;
        if (res) {
            v.Flags = [...flags, doc];
            toast.success('Flag added');
            dialog = null;
        } else formError = 'The flag was not added. Try again.';
    }

    async function removeFlag(type) {
        const res = await call('Delete', { type: 'vehicle-flag', parent: v.VIN, plate: v.RegisteredPlate, removeRadarFlag: flags.length <= 1, id: type });
        if (res) {
            v.Flags = flags.filter((f) => f.Type !== type);
            toast.success('Flag removed');
        } else toast.error('The flag was not removed. Try again.');
    }

    async function saveStrikes(next, done) {
        busy = true;
        const res = await call('Update', { type: 'vehicle-strikes', VIN: v.VIN, strikes: next });
        busy = false;
        if (res) {
            v.Strikes = next;
            toast.success(done);
            dialog = null;
            return true;
        }
        toast.error('The strikes were not saved. Try again.');
        return false;
    }

    function addStrike() {
        if (!strikeText.trim()) return (formError = 'Describe the offence for this strike.');
        saveStrikes([...strikes, { Description: strikeText.trim(), Date: Date.now(), Author: author() }], 'Strike added');
    }

    const ownerIsPerson = $derived(v?.Owner?.Type === 0);
</script>

<div class="mdt-back"><Button variant="tertiary" size="sm" icon="arrow-left" onclick={() => back('vehicles')}>Back to vehicles</Button></div>

{#if status === 'loading'}
    <State status="loading" title="Opening vehicle" />
{:else if status === 'error'}
    <State status="error" onretry={load} />
{:else if status === 'missing'}
    <State title="No vehicle with VIN {params.id}">The vehicle may have been scrapped. Search again from Vehicles.</State>
{:else}
    <div class="mdt-page-head">
        <div>
            <h1>{v.Make} {v.Model}</h1>
            <p>Plate <span class="au-mono plate">{v.RegisteredPlate ?? 'None'}</span></p>
            <div class="mdt-tags tags">
                {#each flags as f (f.Type)}<Tag tone={vehicleFlag(f.Type).tone}>{vehicleFlag(f.Type).label}</Tag>{/each}
                {#if v.Storage?.Type === 0}<Tag tone="warning">Impounded</Tag>{/if}
                {#if strikes.length}<Tag tone="warning">{strikes.length} {strikes.length === 1 ? 'strike' : 'strikes'}</Tag>{/if}
            </div>
        </div>
        {#if canEdit}
            <div class="mdt-page-head__actions">
                <Button variant="secondary" onclick={() => openDialog('strike')}>Add strike</Button>
                <Button onclick={() => openDialog('flag')}>Flag vehicle</Button>
            </div>
        {/if}
    </div>

    {#if v.RadarFlag}
        <div class="block"><PageAlert type="warning" title="Flagged on plate readers">{v.RadarFlag}</PageAlert></div>
    {/if}

    <div class="mdt-split">
        <div>
            <section class="mdt-section">
                <h2>Registration</h2>
                <dl class="au-dl">
                    <dt>Owner</dt>
                    <dd>
                        {#if ownerIsPerson}
                            <Button variant="tertiary" size="sm" onclick={() => go('person', { id: v.Owner.Id })}>{v.Owner.Person ? personName(v.Owner.Person) : `State ID ${v.Owner.Id}`}</Button>
                            <span class="au-muted">State ID <span class="au-mono">{v.Owner.Id}</span></span>
                        {:else}
                            {v.Owner?.JobName ?? 'Unknown business'}
                        {/if}
                    </dd>
                    <dt>Registered</dt>
                    <dd>{v.RegistrationDate ? formatDay(v.RegistrationDate, { unix: true }) : 'Unknown'}</dd>
                    <dt>Type</dt>
                    <dd>{VehicleTypes[v.Type] ?? 'Car'}</dd>
                    <dt>VIN</dt>
                    <dd class="au-mono">{v.VIN}</dd>
                    <dt>Stored at</dt>
                    <dd>{v.Storage?.Type === 0 ? `Impound: ${v.Storage?.Name ?? 'police impound'}` : (v.Storage?.Name ?? 'Out on the road')}</dd>
                </dl>
            </section>

            <section class="mdt-section">
                <h2>Flags</h2>
                {#if flags.length}
                    <table class="au-table au-table--dense mdt-table">
                        <thead><tr><th scope="col">Flag</th><th scope="col">Reason</th><th scope="col">Added by</th><th scope="col">Date</th>{#if canEdit}<th scope="col"><span class="au-hidden">Actions</span></th>{/if}</tr></thead>
                        <tbody>
                            {#each flags as f (f.Type)}
                                <tr>
                                    <td><Tag tone={vehicleFlag(f.Type).tone}>{vehicleFlag(f.Type).label}</Tag></td>
                                    <td>{f.Description}</td>
                                    <td>{f.Author ? personName(f.Author, { callsign: true, initial: true }) : 'Unknown'}</td>
                                    <td class="nowrap">{formatDay(f.Date)}</td>
                                    {#if canEdit}<td class="mdt-num"><Button variant="tertiary" size="sm" onclick={() => removeFlag(f.Type)}>Remove</Button></td>{/if}
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                {:else}
                    <p class="au-muted">No flags on this vehicle.</p>
                {/if}
            </section>

            <section class="mdt-section">
                <h2>Strikes</h2>
                {#if strikes.length}
                    <table class="au-table au-table--dense mdt-table">
                        <thead><tr><th scope="col">Offence</th><th scope="col">Issued by</th><th scope="col">Date</th>{#if canEdit}<th scope="col"><span class="au-hidden">Actions</span></th>{/if}</tr></thead>
                        <tbody>
                            {#each strikes as st, i (i)}
                                <tr>
                                    <td>{st.Description}</td>
                                    <td>{st.Author ? personName(st.Author, { callsign: true, initial: true }) : 'Unknown'}</td>
                                    <td class="nowrap">{formatDay(st.Date)}</td>
                                    {#if canEdit}<td class="mdt-num"><Button variant="tertiary" size="sm" onclick={() => saveStrikes(strikes.filter((_, k) => k !== i), 'Strike removed')}>Remove</Button></td>{/if}
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                {:else}
                    <p class="au-muted">No strikes against this vehicle.</p>
                {/if}
            </section>
        </div>

        <aside>
            <section class="mdt-section">
                <h2>Previous owners</h2>
                {#if history.length}
                    <table class="au-table au-table--dense mdt-table">
                        <thead><tr><th scope="col">Owner</th><th scope="col">Until</th></tr></thead>
                        <tbody>
                            {#each history as o, i (i)}
                                <tr>
                                    <td>{o.First ? personName(o) : o.Type === 0 ? `State ID ${o.Id}` : 'Business'}</td>
                                    <td class="nowrap">{o.Time ? formatDay(o.Time) : 'Unknown'}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                {:else}
                    <p class="au-muted">No earlier owners recorded.</p>
                {/if}
            </section>
        </aside>
    </div>

    <Modal open={dialog === 'flag'} title="Flag vehicle" onclose={() => (dialog = null)}>
        {#if formError}<div class="block"><PageAlert type="error" compact>{formError}</PageAlert></div>{/if}
        <Field label="Flag" id="v-flag">
            <Select id="v-flag" bind:value={flagType} placeholder="Choose a flag" options={VehicleFlagTypes.map((f) => ({ value: f.value, label: f.label }))} />
        </Field>
        <Field label="Reason" hint="Plate readers will alert officers when they pass this vehicle." id="v-flag-text"><Textarea id="v-flag-text" rows={3} bind:value={flagText} /></Field>
        {#snippet actions()}
            <Button variant="secondary" onclick={() => (dialog = null)}>Cancel</Button>
            <Button loading={busy} onclick={addFlag}>Add flag</Button>
        {/snippet}
    </Modal>

    <Modal open={dialog === 'strike'} title="Add strike" onclose={() => (dialog = null)}>
        {#if formError}<div class="block"><PageAlert type="error" compact>{formError}</PageAlert></div>{/if}
        <Field label="Offence" id="v-strike"><Textarea id="v-strike" rows={3} bind:value={strikeText} /></Field>
        {#snippet actions()}
            <Button variant="secondary" onclick={() => (dialog = null)}>Cancel</Button>
            <Button loading={busy} onclick={addStrike}>Add strike</Button>
        {/snippet}
    </Modal>
{/if}

<style>
    .tags {
        margin-top: var(--au-s2);
    }
    .plate {
        font-weight: 700;
        color: var(--au-text);
    }
    .block {
        margin-bottom: var(--au-s4);
    }
    .nowrap {
        white-space: nowrap;
    }
</style>
