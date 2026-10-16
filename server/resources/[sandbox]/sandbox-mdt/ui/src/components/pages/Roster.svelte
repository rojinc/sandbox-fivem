<script>
    import { onMount } from 'svelte';
    import { Button, Checkbox, Field, Modal, PageAlert, Select, Tag, TextInput } from '@sandbox/ui-kit';
    import { app, hasPerm } from '../../state/app.svelte.js';
    import { store } from '../../state/data.svelte.js';
    import { toast } from '../../state/toasts.svelte.js';
    import { call, list } from '../../lib/api.js';
    import { resolveRole, rosterJobFor } from '../../lib/nav.js';
    import { formatDuration } from '@sandbox/ui-kit';
    import { formatDateTime, personName } from '../../lib/format.js';
    import State from '../common/State.svelte';

    /** Everyone employed by your job; command staff hire, promote, suspend and fire here. */
    const job = rosterJobFor[resolveRole()] ?? app.job?.Id ?? 'police';
    const jobData = $derived(store.governmentJobsData?.[job] ?? null);
    const workplaces = $derived(list(jobData?.Workplaces));
    const highCommand = $derived(hasPerm(['PD_HIGH_COMMAND', 'SAFD_HIGH_COMMAND', 'DOJ_JUDGE', 'DOC_HIGH_COMMAND']));
    const canHire = $derived(hasPerm('MDT_HIRE') || highCommand);
    const canFire = $derived(hasPerm('MDT_FIRE') || highCommand);
    const canPromote = $derived(hasPerm('MDT_PROMOTE') || highCommand);
    const canEdit = $derived(hasPerm('MDT_EDIT_EMPLOYEE') || highCommand);

    let status = $state('loading');
    let people = $state([]);
    let filter = $state('');
    let selected = $state(null); // RosterSelect result
    let selStatus = $state('idle');
    let dialog = $state(null);
    let busy = $state(false);
    let errors = $state({});
    let f = $state({});

    async function load() {
        status = 'loading';
        const res = await call('RosterView', { job });
        if (res === null || res === false) {
            status = 'error';
            return;
        }
        people = list(res);
        status = 'ready';
    }
    onMount(load);

    const jobOf = (p) => list(p?.Jobs).find((j) => j.Id === job) ?? list(p?.Jobs)[0] ?? null;
    const rows = $derived(
        people
            .filter((p) => !filter.trim() || `${p.First} ${p.Last} ${p.Callsign ?? ''} ${p.SID}`.toLowerCase().includes(filter.trim().toLowerCase()))
            .sort((a, b) => (jobOf(b)?.Grade?.Level ?? 0) - (jobOf(a)?.Grade?.Level ?? 0) || String(a.Callsign ?? '').localeCompare(String(b.Callsign ?? ''), undefined, { numeric: true })),
    );

    async function open(p) {
        selStatus = 'loading';
        selected = { ...p };
        const res = await call('RosterSelect', { job, person: p.SID });
        if (res && typeof res === 'object') {
            selected = res;
            selStatus = 'ready';
        } else selStatus = 'error';
    }

    const sj = $derived(jobOf(selected));
    const suspended = $derived(Number(selected?.MDTSuspension?.[job]?.Expires) > Date.now() / 1000);
    // Duty minutes in the last 7 days, as the old roster showed.
    const weekMinutes = $derived(list(selected?.TimeClockedOn?.[job]).filter((t) => t.time >= Date.now() / 1000 - 7 * 86400).reduce((a, t) => a + (Number(t.minutes) || 0), 0));
    const myLevel = $derived(app.job?.Grade?.Level ?? 0);

    function gradesFor(wpId) {
        return list(workplaces.find((w) => w.Id === wpId)?.Grades).sort((a, b) => (a.Level ?? 0) - (b.Level ?? 0));
    }

    function openDialog(name) {
        errors = {};
        if (name === 'position') f = { workplace: sj?.Workplace?.Id ?? '', grade: sj?.Grade?.Id ?? '', callsign: selected?.Callsign ?? '' };
        if (name === 'hire') f = { sid: '', workplace: workplaces[0]?.Id ?? '', grade: gradesFor(workplaces[0]?.Id)[0]?.Id ?? '' };
        if (name === 'suspend') f = { days: '1' };
        if (name === 'fire') f = { confirm: false };
        dialog = name;
    }

    async function act(name, body, done, after) {
        busy = true;
        const res = await call(name, body);
        busy = false;
        if (res) {
            toast.success(done);
            dialog = null;
            after?.();
            return true;
        }
        errors = { form: 'That did not work. Check your rank allows it, then try again.' };
        return false;
    }

    async function savePosition() {
        const wp = workplaces.find((w) => w.Id === f.workplace);
        const grade = gradesFor(f.workplace).find((g) => g.Id === f.grade);
        if (!wp || !grade) return (errors = { grade: 'Choose a department and a rank' });
        if (f.callsign.trim() && f.callsign.trim() !== (selected.Callsign ?? '')) {
            const free = await call('CheckCallsign', f.callsign.trim());
            if (!free) return (errors = { callsign: `Callsign ${f.callsign.trim()} is taken. Choose another.` });
            const ok = await call('Update', { type: 'person', SID: selected.SID, Key: 'Callsign', Data: f.callsign.trim() });
            if (!ok) return (errors = { callsign: 'The callsign was not saved.' });
        }
        const data = { ...sj, Workplace: { Id: wp.Id, Name: wp.Name }, Grade: { Id: grade.Id, Name: grade.Name, Level: grade.Level } };
        await act('ManageEmployment', { SID: selected.SID, data, JobId: job }, 'Position saved', () => {
            load();
            open(selected);
        });
    }

    async function hire() {
        const sid = parseInt(f.sid, 10);
        if (!sid) return (errors = { sid: 'Enter the state ID of the person to hire' });
        if (!f.workplace || !f.grade) return (errors = { grade: 'Choose a department and a rank' });
        await act('HireEmployee', { SID: sid, JobId: job, WorkplaceId: f.workplace, GradeId: f.grade }, 'Employee hired', load);
    }

    async function suspend() {
        const days = parseInt(f.days, 10);
        if (!days || days < 1) return (errors = { days: 'Enter a number of days, 1 or more' });
        await act('SuspendEmployee', { SID: selected.SID, JobId: job, Length: days }, 'Employee suspended', () => open(selected));
    }

    async function fire() {
        if (!f.confirm) return (errors = { confirm: 'Tick the box to confirm' });
        await act('FireEmployee', { SID: selected.SID, JobId: job }, 'Employee removed from the roster', () => {
            selected = null;
            load();
        });
    }

    function printBadge() {
        call('PrintBadge', { SID: selected.SID, JobId: job });
        toast.info('Printing the badge. Collect it from your inventory.');
    }
</script>

<div class="mdt-page-head">
    <div>
        <h1>Roster</h1>
        <p>{jobData?.Name ?? 'Department'} employees, highest rank first.</p>
    </div>
    {#if canHire}<div class="mdt-page-head__actions"><Button onclick={() => openDialog('hire')}>Hire someone</Button></div>{/if}
</div>

{#if status === 'loading'}
    <State status="loading" title="Loading the roster" />
{:else if status === 'error'}
    <State status="error" onretry={load} />
{:else}
    <div class="mdt-split">
        <div>
            <div class="filter">
                <label for="roster-filter">Find an employee</label>
                <TextInput id="roster-filter" bind:value={filter} placeholder="Name, callsign or state ID" autocomplete="off" />
            </div>
            {#if !rows.length}
                <State title={filter ? `Nobody matches "${filter}"` : 'Nobody on the roster'}>{filter ? 'Check the spelling.' : 'Hire someone to add them.'}</State>
            {:else}
                <table class="au-table au-table--hover au-table--dense mdt-table">
                    <thead><tr><th scope="col">Callsign</th><th scope="col">Name</th><th scope="col">Rank</th><th scope="col">Department</th></tr></thead>
                    <tbody>
                        {#each rows as p (p.SID)}
                            {@const j = jobOf(p)}
                            <tr class="is-clickable" class:is-selected={selected?.SID === p.SID} tabindex="0" onclick={() => open(p)} onkeydown={(e) => e.key === 'Enter' && open(p)}>
                                <td class="au-mono">{p.Callsign ?? 'None'}</td>
                                <td>{personName(p)}</td>
                                <td>{j?.Grade?.Name ?? 'Unknown'}</td>
                                <td>{j?.Workplace?.Name ?? jobData?.Name ?? ''}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            {/if}
        </div>

        <aside>
            {#if !selected}
                <div class="mdt-empty"><strong>Choose an employee</strong>Their details and the actions your rank allows appear here.</div>
            {:else}
                <section class="mdt-section">
                    <h2>{personName(selected)}</h2>
                    {#if selStatus === 'loading'}
                        <State status="loading" title="Loading details" />
                    {:else if selStatus === 'error'}
                        <State status="error" title="Their details did not load" onretry={() => open(selected)} />
                    {:else}
                        {#if suspended}<div class="block"><Tag tone="warning">Suspended</Tag></div>{/if}
                        <dl class="au-dl">
                            <dt>State ID</dt>
                            <dd class="au-mono">{selected.SID}</dd>
                            <dt>Callsign</dt>
                            <dd class="au-mono">{selected.Callsign ?? 'None'}</dd>
                            <dt>Rank</dt>
                            <dd>{sj?.Grade?.Name ?? 'Unknown'}</dd>
                            <dt>Department</dt>
                            <dd>{sj?.Workplace?.Name ?? 'Unknown'}</dd>
                            <dt>Phone</dt>
                            <dd class="au-mono">{selected.Phone ?? 'None'}</dd>
                            <dt>Last on duty</dt>
                            <dd>{selected.LastClockOn?.[job] ? formatDateTime(selected.LastClockOn[job], { unix: true }) : 'Not recorded'}</dd>
                            <dt>On duty this week</dt>
                            <dd class="au-mono">{formatDuration(weekMinutes * 60)}</dd>
                            {#if suspended}
                                <dt>Suspended until</dt>
                                <dd>{formatDateTime(selected.MDTSuspension[job].Expires, { unix: true })}</dd>
                            {/if}
                        </dl>
                        <div class="stack">
                            {#if canPromote || canEdit}<Button variant="secondary" size="sm" onclick={() => openDialog('position')}>Change rank or callsign</Button>{/if}
                            {#if highCommand}<Button variant="secondary" size="sm" onclick={printBadge}>Print badge</Button>{/if}
                            {#if canFire && !suspended}<Button variant="secondary" size="sm" onclick={() => openDialog('suspend')}>Suspend</Button>{/if}
                            {#if canFire && suspended}<Button variant="secondary" size="sm" onclick={() => act('UnsuspendEmployee', { SID: selected.SID, JobId: job }, 'Suspension lifted', () => open(selected))}>Lift suspension</Button>{/if}
                            {#if canFire && selected.SID !== app.user?.SID}<Button variant="danger" size="sm" onclick={() => openDialog('fire')}>Remove from roster</Button>{/if}
                        </div>
                    {/if}
                </section>
            {/if}
        </aside>
    </div>
{/if}

<Modal open={dialog === 'position'} title="Change rank or callsign" onclose={() => (dialog = null)}>
    {#if errors.form}<div class="block"><PageAlert type="error">{errors.form}</PageAlert></div>{/if}
    <Field label="Department" id="r-wp"><Select id="r-wp" bind:value={f.workplace} disabled={!highCommand} options={workplaces.map((w) => ({ value: w.Id, label: w.Name }))} onchange={() => (f.grade = gradesFor(f.workplace)[0]?.Id ?? '')} /></Field>
    <Field label="Rank" hint="You can only give ranks below your own." id="r-grade" error={errors.grade}>
        <Select id="r-grade" bind:value={f.grade} options={gradesFor(f.workplace).map((g) => ({ value: g.Id, label: g.Name, disabled: !hasPerm(true) && (g.Level ?? 0) >= myLevel }))} />
    </Field>
    {#if canEdit}<Field label="Callsign" id="r-cs" error={errors.callsign}><TextInput id="r-cs" bind:value={f.callsign} width="160px" block={false} mono /></Field>{/if}
    {#snippet actions()}
        <Button variant="secondary" onclick={() => (dialog = null)}>Cancel</Button>
        <Button loading={busy} onclick={savePosition}>Save position</Button>
    {/snippet}
</Modal>

<Modal open={dialog === 'hire'} title="Hire someone" onclose={() => (dialog = null)}>
    {#if errors.form}<div class="block"><PageAlert type="error">{errors.form}</PageAlert></div>{/if}
    <Field label="State ID" id="h-sid" error={errors.sid}><TextInput id="h-sid" bind:value={f.sid} inputmode="numeric" width="160px" block={false} mono /></Field>
    <Field label="Department" id="h-wp"><Select id="h-wp" bind:value={f.workplace} options={workplaces.map((w) => ({ value: w.Id, label: w.Name }))} onchange={() => (f.grade = gradesFor(f.workplace)[0]?.Id ?? '')} /></Field>
    <Field label="Rank" id="h-grade" error={errors.grade}><Select id="h-grade" bind:value={f.grade} options={gradesFor(f.workplace).map((g) => ({ value: g.Id, label: g.Name, disabled: !hasPerm(true) && (g.Level ?? 0) >= myLevel }))} /></Field>
    {#snippet actions()}
        <Button variant="secondary" onclick={() => (dialog = null)}>Cancel</Button>
        <Button loading={busy} onclick={hire}>Hire</Button>
    {/snippet}
</Modal>

<Modal open={dialog === 'suspend'} title="Suspend {personName(selected)}" onclose={() => (dialog = null)}>
    {#if errors.form}<div class="block"><PageAlert type="error">{errors.form}</PageAlert></div>{/if}
    <p>They cannot go on duty until the suspension ends or someone lifts it.</p>
    <Field label="Days" id="s-days" error={errors.days}><TextInput id="s-days" type="number" min="1" bind:value={f.days} width="120px" block={false} /></Field>
    {#snippet actions()}
        <Button variant="secondary" onclick={() => (dialog = null)}>Cancel</Button>
        <Button loading={busy} onclick={suspend}>Suspend</Button>
    {/snippet}
</Modal>

<Modal open={dialog === 'fire'} title="Remove {personName(selected)} from the roster" onclose={() => (dialog = null)}>
    {#if errors.form}<div class="block"><PageAlert type="error">{errors.form}</PageAlert></div>{/if}
    <p>They lose this job and every permission that comes with it.</p>
    <Field id="f-ok" error={errors.confirm}><Checkbox id="f-ok" bind:checked={f.confirm} label="I want to remove this employee" /></Field>
    {#snippet actions()}
        <Button variant="secondary" onclick={() => (dialog = null)}>Cancel</Button>
        <Button variant="danger" loading={busy} onclick={fire}>Remove from roster</Button>
    {/snippet}
</Modal>

<style>
    .filter {
        max-width: 360px;
        margin-bottom: var(--au-s4);
    }
    .filter label {
        display: block;
        font-weight: 700;
        margin-bottom: var(--au-s1);
    }
    .stack {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: var(--au-s2);
    }
    .block {
        margin-bottom: var(--au-s3);
    }
</style>
