<script>
    import { onMount } from 'svelte';
    import { Button, Checkbox, Field, Modal, PageAlert, Select, Tabs } from '@sandbox/ui-kit';
    import { app, hasPerm } from '../../state/app.svelte.js';
    import { store } from '../../state/data.svelte.js';
    import { toast } from '../../state/toasts.svelte.js';
    import { call, list } from '../../lib/api.js';
    import { resolveRole, adminSections, permissionJobFor, fleetJobFor } from '../../lib/nav.js';
    import { VehicleTypes } from '../../lib/data.js';
    import State from '../common/State.svelte';
    import PersonPicker from '../common/PersonPicker.svelte';

    /** Command tools: rank permissions and the vehicle fleet. */
    const role = resolveRole();
    const sections = adminSections(role);
    const LABELS = { permissions: 'Rank permissions', fleet: 'Fleet', system: 'System' };
    let tab = $state(sections[0] ?? 'permissions');

    /* ------------------------------------------------ permissions */
    const sysAdmin = hasPerm(true);
    let permJob = $state(permissionJobFor[role] ?? app.job?.Id ?? 'police');
    const jobs = $derived(sysAdmin ? list(store.governmentJobs) : [permJob]);
    const jobData = $derived(store.governmentJobsData?.[permJob] ?? null);
    const workplaces = $derived(list(jobData?.Workplaces));
    let wpId = $state('');
    let gradeId = $state('');
    const grades = $derived(list(workplaces.find((w) => w.Id === wpId)?.Grades).sort((a, b) => (b.Level ?? 0) - (a.Level ?? 0)));
    const grade = $derived(grades.find((g) => g.Id === gradeId) ?? null);
    const myLevel = app.job?.Grade?.Level ?? 0;
    const available = $derived(
        Object.entries(store.permissions ?? {})
            .filter(([, d]) => d && (!d.restrict || !d.restrict.job || d.restrict.job === permJob) && (!d.restrict?.workplace || d.restrict.workplace === wpId))
            .sort((a, b) => String(a[1].name).localeCompare(String(b[1].name))),
    );
    let pending = $state({});
    let saving = $state(false);

    $effect.pre(() => {
        if (workplaces.length && !workplaces.some((w) => w.Id === wpId)) wpId = workplaces[0].Id;
    });
    $effect.pre(() => {
        if (grades.length && !grades.some((g) => g.Id === gradeId)) gradeId = grades[0].Id;
    });
    $effect.pre(() => {
        const perms = grade?.Permissions ?? {};
        const held = Array.isArray(perms) ? perms : Object.keys(perms).filter((k) => perms[k]);
        pending = Object.fromEntries(available.map(([k]) => [k, held.includes(k)]));
    });

    const canEditGrade = $derived(sysAdmin || (grade && (grade.Level ?? 0) < myLevel));

    async function savePerms() {
        saving = true;
        const UpdatedPermissions = Object.fromEntries(Object.entries(pending).filter(([, v]) => v).map(([k]) => [k, true]));
        const res = await call('Update', { type: 'jobPermissions', JobId: permJob, WorkplaceId: wpId, GradeId: gradeId, UpdatedPermissions });
        saving = false;
        if (res) toast.success(`Permissions saved for ${grade?.Name ?? 'the rank'}`);
        else toast.error('The permissions were not saved. You can only change ranks below your own.');
    }

    /* ------------------------------------------------------ fleet */
    const fleetJob = fleetJobFor[role] ?? 'police';
    let fleetStatus = $state('idle');
    let fleet = $state([]);
    let assigning = $state(null);
    let assigned = $state([]);
    let busy = $state(false);

    async function loadFleet() {
        fleetStatus = 'loading';
        const res = await call('ViewVehicleFleet', {});
        if (res === null || res === false) {
            fleetStatus = 'error';
            return;
        }
        fleet = list(res);
        fleetStatus = 'ready';
    }
    onMount(() => {
        if (sections.includes('fleet')) loadFleet();
    });

    async function track(v) {
        const res = await call('TrackFleetVehicle', { vehicle: v.VIN });
        if (res) toast.success(`Waypoint set to ${v.RegisteredPlate ?? v.VIN}`);
        else toast.error('That vehicle cannot be tracked right now. It may be stored.');
    }

    async function saveAssigned() {
        busy = true;
        const res = await call('SetAssignedDrivers', { vehicle: assigning.VIN, assigned: assigned.map((a) => ({ SID: a.SID, First: a.First, Last: a.Last, Callsign: a.Callsign })) });
        busy = false;
        if (res) {
            assigning.GovAssigned = [...assigned];
            fleet = [...fleet];
            toast.success('Drivers saved');
            assigning = null;
        } else toast.error('The drivers were not saved. Try again.');
    }

    const drivers = (v) => list(v.GovAssigned);
</script>

<div class="mdt-page-head">
    <div>
        <h1>Admin</h1>
        <p>Tools for command staff. What you see depends on your rank.</p>
    </div>
</div>

{#if sections.length > 1}
    <div class="tabs"><Tabs bind:active={tab} items={sections.map((id) => ({ id, label: LABELS[id] }))} /></div>
{/if}

{#if tab === 'permissions' || (tab === 'system' && !sections.includes('permissions'))}
    <section class="mdt-section">
        <h2>Rank permissions</h2>
        <p class="au-muted">Choose a rank to see what it can do. You can change ranks below your own.</p>
        <div class="pickers">
            {#if sysAdmin}<Field label="Job" id="pm-job"><Select id="pm-job" bind:value={permJob} options={jobs.map((j) => ({ value: j, label: store.governmentJobsData?.[j]?.Name ?? j }))} /></Field>{/if}
            <Field label="Department" id="pm-wp"><Select id="pm-wp" bind:value={wpId} options={workplaces.map((w) => ({ value: w.Id, label: w.Name }))} /></Field>
            <Field label="Rank" id="pm-grade"><Select id="pm-grade" bind:value={gradeId} options={grades.map((g) => ({ value: g.Id, label: g.Name }))} /></Field>
        </div>
        {#if !workplaces.length}
            <State title="No job data loaded">Job data arrives when you go on duty. Reopen the terminal if this stays empty.</State>
        {:else if grade}
            {#if !canEditGrade}<div class="block"><PageAlert type="info" compact>{grade.Name} is your rank or higher, so you can only read it.</PageAlert></div>{/if}
            <div class="perms">
                {#each available as [key, def] (key)}
                    <Checkbox bind:checked={pending[key]} disabled={!canEditGrade} label={def.name ?? key} />
                {/each}
            </div>
            {#if canEditGrade}<Button loading={saving} onclick={savePerms}>Save permissions</Button>{/if}
        {/if}
    </section>
{:else if tab === 'fleet'}
    <section class="mdt-section">
        <h2>Fleet</h2>
        {#if fleetStatus === 'loading'}
            <State status="loading" title="Loading the fleet" />
        {:else if fleetStatus === 'error'}
            <State status="error" onretry={loadFleet} />
        {:else if !fleet.length}
            <State title="No fleet vehicles">Vehicles your department owns show here.</State>
        {:else}
            <table class="au-table au-table--dense mdt-table">
                <thead><tr><th scope="col">Plate</th><th scope="col">Vehicle</th><th scope="col">Stored at</th><th scope="col">Drivers</th><th scope="col"><span class="au-hidden">Actions</span></th></tr></thead>
                <tbody>
                    {#each fleet as v (v.VIN)}
                        <tr>
                            <td class="au-mono"><strong>{v.RegisteredPlate ?? 'None'}</strong></td>
                            <td>{v.Make} {v.Model}<div class="au-muted">{VehicleTypes[v.Type] ?? 'Car'}</div></td>
                            <td>{v.Storage?.Name ?? (v.Storage?.Type === 0 ? 'Impound' : 'Out on the road')}</td>
                            <td>{#if drivers(v).length}{drivers(v).map((d) => `${d.Callsign ? `${d.Callsign} ` : ''}${d.First?.[0] ?? ''}. ${d.Last ?? ''}`).join(', ')}{:else}<span class="au-muted">Anyone</span>{/if}</td>
                            <td class="act">
                                <Button variant="tertiary" size="sm" onclick={() => ((assigning = v), (assigned = [...drivers(v)]))}>Assign drivers</Button>
                                <Button variant="tertiary" size="sm" onclick={() => track(v)}>Track</Button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {/if}
    </section>
{:else}
    <section class="mdt-section">
        <h2>System</h2>
        <p>You are a system administrator. You can also edit the penal code on the Charges page and add documents in the Library.</p>
    </section>
{/if}

<Modal open={Boolean(assigning)} title="Drivers for {assigning?.RegisteredPlate ?? 'vehicle'}" onclose={() => (assigning = null)}>
    <p class="au-muted">Only assigned drivers can take this vehicle out. Leave the list empty to let anyone drive it.</p>
    {#if assigned.length}
        <ul class="people">
            {#each assigned as a (a.SID)}
                <li>
                    <span>{a.Callsign ? `${a.Callsign} ` : ''}{a.First} {a.Last}</span>
                    <Button variant="tertiary" size="sm" onclick={() => (assigned = assigned.filter((x) => x.SID !== a.SID))}>Remove</Button>
                </li>
            {/each}
        </ul>
    {/if}
    <PersonPicker label="Add a driver" type="job" job={fleetJob} exclude={assigned.map((a) => a.SID)} onpick={(p) => (assigned = [...assigned, p])} />
    {#snippet actions()}
        <Button variant="secondary" onclick={() => (assigning = null)}>Cancel</Button>
        <Button loading={busy} onclick={saveAssigned}>Save drivers</Button>
    {/snippet}
</Modal>

<style>
    .tabs {
        margin-bottom: var(--au-s5);
    }
    .pickers {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 340px));
        gap: 0 var(--au-s3);
    }
    .perms {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: var(--au-s2) var(--au-s4);
        margin: 0 0 var(--au-s5);
    }
    .block {
        margin-bottom: var(--au-s3);
    }
    .act {
        text-align: right;
        white-space: nowrap;
    }
    .people {
        list-style: none;
        margin: 0 0 var(--au-s3);
        padding: 0;
    }
    .people li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--au-s1) 0;
        border-bottom: 1px solid var(--au-border);
    }
</style>
