<script>
    import { Button, Tag, Modal, Field, TextInput, Checkbox, PageAlert } from '@sandbox/ui-kit';
    import { app, go, back, hasPerm, hasJob } from '../../state/app.svelte.js';
    import { store } from '../../state/data.svelte.js';
    import { toast } from '../../state/toasts.svelte.js';
    import { call, list } from '../../lib/api.js';
    import { formatDay, formatDateTime, toDate, plural } from '../../lib/format.js';
    import { chargeType, licenceName, VehicleTypes } from '../../lib/data.js';
    import { mergeConvictions } from '../../lib/charges.js';
    import State from '../common/State.svelte';

    let { params = {} } = $props();

    let status = $state('loading');
    let person = $state(null); // { data, parole, convictions, vehicles, ownedBusinesses }
    let dialog = $state(null);
    let busy = $state(false);

    // dialog fields
    let flagViolent = $state(false);
    let flagGang = $state('');
    let photoUrl = $state('');
    let unsuspend = $state({});
    let pointsToRemove = $state('1');
    let expungeConfirm = $state(false);
    let attorneyCert = $state(false);

    async function load() {
        status = 'loading';
        const res = await call('View', { type: 'person', id: params.id });
        if (!res || !res.data) {
            status = res === null ? 'error' : 'missing';
            return;
        }
        person = res;
        status = 'ready';
    }

    $effect(() => {
        load();
    });

    const d = $derived(person?.data ?? {});
    const govJobs = $derived(list(store.governmentJobs));
    const jobs = $derived(list(d.Jobs));
    const govEmployment = $derived(jobs.find((j) => govJobs.includes(j.Id)));
    const businesses = $derived(jobs.filter((j) => !govJobs.includes(j.Id) && !j.Hidden));
    const licences = $derived(Object.entries(d.Licenses ?? {}).filter(([, l]) => l && (l.Active || l.Suspended)));
    const suspended = $derived(Object.entries(d.Licenses ?? {}).filter(([, l]) => l?.Suspended));
    const driverPoints = $derived(Number(d.Licenses?.Drivers?.Points) || 0);
    const convictions = $derived(mergeConvictions(person?.convictions));
    const vehicles = $derived(list(person?.vehicles));
    const paroleEnd = $derived(toDate(person?.parole?.end));
    const paroleLeft = $derived(paroleEnd && paroleEnd.getTime() > Date.now() ? Math.ceil((paroleEnd.getTime() - Date.now()) / 60000) : 0);

    const isPolice = $derived(hasJob('police'));
    const canCreateIncident = $derived(hasPerm('MDT_INCIDENT_REPORT_CREATE', false));
    const canViewVehicles = $derived(isPolice || (hasJob('government') && app.job?.Workplace?.Id !== 'publicdefenders'));
    const canLicences = $derived(hasPerm('REVOKE_LICENSE_SUSPENSIONS'));
    const canExpunge = $derived(hasPerm('EXPUNGEMENT'));
    const canBar = $derived(hasPerm('BAR_CERTIFICATIONS'));
    const isSysAdmin = $derived(hasPerm(true));

    function openDialog(name) {
        flagViolent = Boolean(d.Flags?.Violent);
        flagGang = typeof d.Flags?.Gang === 'string' ? d.Flags.Gang : '';
        photoUrl = d.Mugshot ?? '';
        unsuspend = Object.fromEntries(suspended.map(([k]) => [k, false]));
        pointsToRemove = '1';
        expungeConfirm = false;
        attorneyCert = Boolean(d.Attorney);
        dialog = name;
    }

    async function update(Key, Data, done) {
        busy = true;
        const res = await call('Update', { type: 'person', SID: d.SID, Key, Data });
        busy = false;
        if (res) {
            person.data = { ...person.data, [Key]: Data };
            toast.success(done);
            dialog = null;
        } else toast.error('The record was not updated. Check your permissions and try again.');
    }

    async function liftSuspensions() {
        const body = Object.fromEntries(Object.entries(unsuspend).filter(([, v]) => v));
        if (!Object.keys(body).length) return toast.error('Choose at least one licence to reinstate.');
        busy = true;
        const res = await call('RevokeSuspension', { SID: d.SID, unsuspend: body });
        busy = false;
        if (res && typeof res === 'object') {
            person.data = { ...person.data, Licenses: res };
            toast.success('Suspension lifted');
            dialog = null;
        } else toast.error('The suspension was not lifted. Try again.');
    }

    async function removePoints() {
        const n = Math.floor(Number(pointsToRemove));
        if (!n || n < 1 || n > driverPoints) return toast.error(`Enter a number from 1 to ${driverPoints}.`);
        busy = true;
        const res = await call('RemovePoints', { SID: d.SID, newPoints: driverPoints - n });
        busy = false;
        if (res && typeof res === 'object') {
            person.data = { ...person.data, Licenses: res };
            toast.success(`${plural(n, 'point')} removed`);
            dialog = null;
        } else toast.error('The points were not removed. Try again.');
    }

    async function expunge() {
        if (!expungeConfirm) return toast.error('Tick the box to confirm you want to clear this record.');
        busy = true;
        const res = await call('ClearRecord', { SID: d.SID });
        busy = false;
        if (res) {
            person.convictions = [];
            toast.success('Criminal record cleared');
            dialog = null;
        } else toast.error('The record was not cleared. Try again.');
    }

    const history = $derived(list(d.MDTHistory).slice().reverse());
</script>

<div class="mdt-back"><Button variant="tertiary" size="sm" icon="arrow-left" onclick={() => back('people')}>Back to people</Button></div>

{#if status === 'loading'}
    <State status="loading" title="Opening record" />
{:else if status === 'error'}
    <State status="error" onretry={load} />
{:else if status === 'missing'}
    <State title="No person with state ID {params.id}">The person may have been deleted. Search again from People.</State>
{:else}
    <div class="mdt-page-head">
        <div>
            <h1>{d.First} {d.Last}</h1>
            <p>State ID <span class="au-mono">{d.SID}</span></p>
            <div class="mdt-tags tags">
                {#if d.Flags?.Violent}<Tag tone="error">Violent</Tag>{/if}
                {#if paroleLeft}<Tag tone="warning">On parole</Tag>{/if}
                {#if suspended.length}<Tag tone="warning">Licence suspended</Tag>{/if}
                {#if d.Attorney}<Tag tone="info">Bar certified attorney</Tag>{/if}
                {#if govEmployment}<Tag>Government employee</Tag>{/if}
            </div>
        </div>
        {#if canCreateIncident}
            <div class="mdt-page-head__actions">
                <Button onclick={() => go('report-edit', { type: 0, suspect: { SID: d.SID, First: d.First, Last: d.Last, Licenses: d.Licenses ?? {} } })}>Create incident report</Button>
            </div>
        {/if}
    </div>

    {#if paroleLeft}
        <div class="block"><PageAlert type="warning" title="On parole">{plural(paroleLeft, 'month')} left, ending {formatDateTime(paroleEnd)}.</PageAlert></div>
    {/if}

    <div class="mdt-split">
        <div>
            <section class="mdt-section">
                <h2>Details</h2>
                <dl class="au-dl">
                    <dt>Date of birth</dt>
                    <dd>{formatDay(d.DOB)}</dd>
                    <dt>Sex</dt>
                    <dd>{d.Gender ? 'Female' : 'Male'}</dd>
                    <dt>Phone</dt>
                    <dd class="au-mono">{d.Phone ?? 'None on file'}</dd>
                    <dt>Violent</dt>
                    <dd>{d.Flags?.Violent ? 'Yes' : 'No'}</dd>
                    <dt>Gang affiliation</dt>
                    <dd>{d.Flags?.Gang ? d.Flags.Gang : 'None known'}</dd>
                </dl>
            </section>

            <section class="mdt-section">
                <h2>Licences</h2>
                {#if licences.length}
                    <table class="au-table au-table--dense mdt-table">
                        <thead><tr><th scope="col">Licence</th><th scope="col">Status</th><th scope="col" class="mdt-num">Points</th></tr></thead>
                        <tbody>
                            {#each licences as [key, l] (key)}
                                <tr>
                                    <td>{licenceName(key)}</td>
                                    <td>{#if l.Suspended}<Tag tone="error">Suspended</Tag>{:else}<Tag tone="success">Valid</Tag>{/if}</td>
                                    <td class="mdt-num au-mono">{l.Points ?? 0}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                {:else}
                    <p class="au-muted">Holds no licences.</p>
                {/if}
            </section>

            {#if canViewVehicles}
                <section class="mdt-section">
                    <h2>Registered vehicles</h2>
                    {#if vehicles.length}
                        <table class="au-table au-table--hover au-table--dense mdt-table">
                            <thead><tr><th scope="col">Plate</th><th scope="col">Vehicle</th><th scope="col">Type</th><th scope="col">VIN</th></tr></thead>
                            <tbody>
                                {#each vehicles as v (v.VIN)}
                                    <tr class="is-clickable" tabindex="0" onclick={() => go('vehicle', { id: v.VIN })} onkeydown={(e) => e.key === 'Enter' && go('vehicle', { id: v.VIN })}>
                                        <td class="au-mono"><strong>{v.RegisteredPlate ?? 'None'}</strong></td>
                                        <td>{v.Make} {v.Model}</td>
                                        <td>{VehicleTypes[v.Type] ?? 'Car'}</td>
                                        <td class="au-mono">{v.VIN}</td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    {:else}
                        <p class="au-muted">No vehicles registered to this person.</p>
                    {/if}
                </section>
            {/if}

            <section class="mdt-section">
                <h2>Convictions</h2>
                {#if convictions.length}
                    <table class="au-table au-table--dense mdt-table">
                        <thead><tr><th scope="col">Charge</th><th scope="col">Class</th><th scope="col" class="mdt-num">Count</th></tr></thead>
                        <tbody>
                            {#each convictions as c (c.id)}
                                <tr>
                                    <td>{c.title}</td>
                                    <td><Tag tone={chargeType(c.type).tone}>{chargeType(c.type).label}</Tag></td>
                                    <td class="mdt-num au-mono">{c.count}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                {:else}
                    <p class="au-muted">No convictions on record.</p>
                {/if}
            </section>
        </div>

        <aside>
            {#if d.Mugshot}
                <img class="mdt-photo" src={d.Mugshot} alt="Photo of {d.First} {d.Last}" />
            {:else}
                <div class="mdt-photo">No photo on file</div>
            {/if}

            {#if isPolice || canLicences || canExpunge || canBar || isSysAdmin || hasJob('government')}
                <section class="mdt-section actions">
                    <h2>Record actions</h2>
                    <div class="stack">
                        <Button variant="secondary" size="sm" onclick={() => go('reports', { term: `suspect: ${d.SID}` })}>Find reports naming this person</Button>
                        {#if isPolice}<Button variant="secondary" size="sm" onclick={() => openDialog('flags')}>Edit flags</Button>{/if}
                        {#if isPolice && !govEmployment}<Button variant="secondary" size="sm" onclick={() => openDialog('photo')}>Update photo</Button>{/if}
                        {#if canLicences}<Button variant="secondary" size="sm" disabled={!suspended.length} onclick={() => openDialog('suspensions')}>Reinstate licences</Button>{/if}
                        {#if canLicences}<Button variant="secondary" size="sm" disabled={driverPoints <= 0} onclick={() => openDialog('points')}>Remove licence points</Button>{/if}
                        {#if canBar}<Button variant="secondary" size="sm" onclick={() => openDialog('attorney')}>Change bar certification</Button>{/if}
                        {#if isSysAdmin}<Button variant="secondary" size="sm" onclick={() => openDialog('history')}>View change history</Button>{/if}
                        {#if canExpunge}<Button variant="danger" size="sm" disabled={!convictions.length} onclick={() => openDialog('expunge')}>Clear criminal record</Button>{/if}
                    </div>
                </section>
            {/if}

            <section class="mdt-section">
                <h2>Employment</h2>
                {#if govEmployment || businesses.length}
                    <dl class="au-dl">
                        {#if govEmployment}
                            <dt>{govEmployment.Workplace?.Name ?? govEmployment.Name}</dt>
                            <dd>{govEmployment.Grade?.Name ?? 'Employee'}</dd>
                        {/if}
                        {#each businesses as j (j.Id)}
                            <dt>{j.Workplace?.Name ?? j.Name}</dt>
                            <dd>{j.Grade?.Name ?? 'Employee'}{#if list(person.ownedBusinesses).includes(j.Id)}, owner{/if}</dd>
                        {/each}
                    </dl>
                {:else}
                    <p class="au-muted">Not employed.</p>
                {/if}
            </section>
        </aside>
    </div>

    <Modal open={dialog === 'flags'} title="Edit flags" onclose={() => (dialog = null)}>
        <Checkbox bind:checked={flagViolent} label="Known to be violent" />
        <div class="gap"></div>
        <Field label="Gang affiliation (optional)" id="p-gang"><TextInput id="p-gang" bind:value={flagGang} /></Field>
        {#snippet actions()}
            <Button variant="secondary" onclick={() => (dialog = null)}>Cancel</Button>
            <Button loading={busy} onclick={() => update('Flags', { Violent: flagViolent, Gang: flagGang.trim() }, 'Flags saved')}>Save flags</Button>
        {/snippet}
    </Modal>

    <Modal open={dialog === 'photo'} title="Update photo" onclose={() => (dialog = null)}>
        <Field label="Image address" hint="Paste a link to the booking photo, for example from the camera app." id="p-photo"><TextInput id="p-photo" bind:value={photoUrl} /></Field>
        {#snippet actions()}
            <Button variant="secondary" onclick={() => (dialog = null)}>Cancel</Button>
            <Button loading={busy} onclick={() => (photoUrl.trim() ? update('Mugshot', photoUrl.trim(), 'Photo updated') : toast.error('Paste an image address first.'))}>Save photo</Button>
        {/snippet}
    </Modal>

    <Modal open={dialog === 'suspensions'} title="Reinstate licences" onclose={() => (dialog = null)}>
        <p>Choose the suspended licences to reinstate.</p>
        {#each suspended as [key] (key)}
            <div><Checkbox bind:checked={unsuspend[key]} label={licenceName(key)} /></div>
        {/each}
        {#snippet actions()}
            <Button variant="secondary" onclick={() => (dialog = null)}>Cancel</Button>
            <Button loading={busy} onclick={liftSuspensions}>Reinstate licences</Button>
        {/snippet}
    </Modal>

    <Modal open={dialog === 'points'} title="Remove licence points" onclose={() => (dialog = null)}>
        <p>The driver licence has {plural(driverPoints, 'point')}. Removing points does not lift a suspension.</p>
        <Field label="Points to remove" id="p-points"><TextInput id="p-points" type="number" min="1" max={driverPoints} bind:value={pointsToRemove} width="120px" block={false} /></Field>
        {#snippet actions()}
            <Button variant="secondary" onclick={() => (dialog = null)}>Cancel</Button>
            <Button loading={busy} onclick={removePoints}>Remove points</Button>
        {/snippet}
    </Modal>

    <Modal open={dialog === 'expunge'} title="Clear criminal record" onclose={() => (dialog = null)}>
        <p>This removes all {plural(convictions.length, 'conviction')} from {d.First} {d.Last}'s record. You cannot undo it.</p>
        <Checkbox bind:checked={expungeConfirm} label="I have a court order to clear this record" />
        {#snippet actions()}
            <Button variant="secondary" onclick={() => (dialog = null)}>Cancel</Button>
            <Button variant="danger" loading={busy} onclick={expunge}>Clear record</Button>
        {/snippet}
    </Modal>

    <Modal open={dialog === 'attorney'} title="Bar certification" onclose={() => (dialog = null)}>
        <Checkbox bind:checked={attorneyCert} label="Certified to practise as an attorney" />
        {#snippet actions()}
            <Button variant="secondary" onclick={() => (dialog = null)}>Cancel</Button>
            <Button loading={busy} onclick={() => update('Attorney', attorneyCert, 'Certification saved')}>Save certification</Button>
        {/snippet}
    </Modal>

    <Modal open={dialog === 'history'} title="Change history" width="760px" onclose={() => (dialog = null)}>
        {#if history.length}
            <table class="au-table au-table--dense mdt-table">
                <thead><tr><th scope="col">When</th><th scope="col">Change</th></tr></thead>
                <tbody>
                    {#each history as h, i (i)}
                        <tr><td class="nowrap">{formatDateTime(h.Time)}</td><td>{h.Log}</td></tr>
                    {/each}
                </tbody>
            </table>
        {:else}
            <p class="au-muted">No changes recorded.</p>
        {/if}
    </Modal>
{/if}

<style>
    .tags {
        margin-top: var(--au-s2);
    }
    .block {
        margin-bottom: var(--au-s4);
    }
    .actions {
        margin-top: var(--au-s6);
    }
    .stack {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: var(--au-s2);
    }
    .gap {
        height: var(--au-s3);
    }
    .nowrap {
        white-space: nowrap;
    }
    aside .mdt-photo {
        width: 160px;
        height: 200px;
    }
</style>
