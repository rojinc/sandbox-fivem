<script>
    import { onMount, untrack } from 'svelte';
    import { Button, Checkbox, Field, PageAlert, Select, Tag, TextInput, Textarea } from '@sandbox/ui-kit';
    import { app, go, back, hasPerm } from '../../state/app.svelte.js';
    import { toast } from '../../state/toasts.svelte.js';
    import { call, list } from '../../lib/api.js';
    import { ReportTypes, reportType, reportTypeLabel, PleaTypes, EvidenceTypes, evidenceLabel, chargeType } from '../../lib/data.js';
    import { resolveCharges, chargeTotals } from '../../lib/charges.js';
    import { htmlToText, textToHtml } from '../../lib/notes.js';
    import { formatMoney, months, personName } from '../../lib/format.js';
    import State from '../common/State.svelte';
    import PersonPicker from '../common/PersonPicker.svelte';
    import ChargePicker from '../common/ChargePicker.svelte';

    /**
     * Create (params.type, optional params.suspect) or edit (params.id) a report.
     * Edits are sent as a list of changes, as the server expects.
     */
    let { params = {} } = $props();

    // The page remounts when params change, so the first value is the only one.
    const p0 = untrack(() => ({ ...params }));
    const editing = p0.id != null;
    const creatable = ReportTypes.filter((t) => hasPerm(t.create, false) || (t.create && hasPerm(true)));

    const me = () => ({ SID: app.user?.SID, First: app.user?.First, Last: app.user?.Last, Callsign: app.user?.Callsign ?? '' });
    let status = $state(editing ? 'loading' : 'ready');
    let original = $state(null);
    let form = $state({
        type: p0.type ?? creatable[0]?.value ?? 0,
        title: '',
        notes: '',
        allowAttorney: false,
        primaries: !editing && app.user ? [me()] : [],
        people: [],
        suspects: !editing && p0.suspect ? [{ ...p0.suspect, charges: [], plea: 'unknown' }] : [],
        evidence: [],
    });
    let errors = $state([]);
    let saving = $state(false);
    let chargesFor = $state(null); // SID of the suspect whose charges are open
    let ev = $state({ type: 'photo', label: '', value: '' });


    async function load() {
        status = 'loading';
        const res = await call('View', { type: 'report', id: p0.id });
        if (!res || !res.id) {
            status = res === null ? 'error' : 'missing';
            return;
        }
        original = res;
        form = {
            type: res.type,
            title: res.title ?? '',
            notes: htmlToText(res.notes),
            allowAttorney: Boolean(res.allowAttorney),
            primaries: list(res.primaries).map((p) => ({ SID: p.SID, First: p.First, Last: p.Last, Callsign: p.Callsign ?? '' })),
            people: list(res.people).map((p) => ({ SID: p.SID, First: p.First, Last: p.Last })),
            suspects: list(res.suspects).map((s) => ({ ...s, charges: list(s.charges), plea: s.plea ?? 'unknown' })),
            evidence: list(res.evidence),
        };
        status = 'ready';
    }

    onMount(() => {
        if (editing) load();
    });

    const type = $derived(reportType(form.type));
    const hasSuspects = $derived(Number(form.type) === 0);
    const hasEvidence = $derived(Boolean(type?.evidence));
    const officerWord = $derived(type?.officers ?? 'Officers');
    const officerJob = $derived(type?.officerJob ?? 'police');
    const lockedSuspects = $derived(new Set(form.suspects.filter((s) => s.sentenced).map((s) => s.SID)));

    function addSuspect(p) {
        if (form.suspects.some((s) => s.SID == p.SID)) return toast.error(`${personName(p)} is already a suspect on this report.`);
        form.suspects.push({ SID: p.SID, First: p.First, Last: p.Last, Licenses: p.Licenses ?? {}, charges: [], plea: 'unknown' });
        chargesFor = p.SID;
    }

    function addEvidence() {
        if (!ev.label.trim() || !ev.value.trim()) return toast.error('Give the evidence a description and a value, such as a photo link or casing number.');
        form.evidence.push({ type: ev.type, label: ev.label.trim(), value: ev.value.trim() });
        ev = { type: ev.type, label: '', value: '' };
    }

    function validate() {
        const out = [];
        if (!form.title.trim()) out.push({ field: 'r-title', text: 'Enter a title for the report' });
        if (!form.notes.trim()) out.push({ field: 'r-notes', text: 'Write the report notes' });
        if (hasSuspects && !form.suspects.length) out.push({ field: 'r-suspect', text: 'Add at least one suspect to an incident report' });
        if (hasSuspects && form.suspects.some((s) => !list(s.charges).length)) out.push({ field: 'r-suspect', text: 'Choose charges for every suspect' });
        return out;
    }

    const bySID = (arr) => new Map(arr.map((x) => [String(x.SID), x]));

    function changes() {
        const out = [];
        const o = original;
        const evNow = new Set(form.evidence.filter((e) => e.id != null).map((e) => e.id));
        form.evidence.filter((e) => e.id == null).forEach((e) => out.push({ mode: 'add', type: 'evidence', data: e }));
        list(o.evidence).filter((e) => !evNow.has(e.id)).forEach((e) => out.push({ mode: 'delete', type: 'evidence', data: e }));

        const oldS = bySID(list(o.suspects));
        const newS = bySID(form.suspects);
        for (const [sid, s] of newS) {
            const before = oldS.get(sid);
            if (!before) out.push({ mode: 'add', type: 'suspect', data: s });
            else if (!s.sentenced && (JSON.stringify(list(before.charges)) !== JSON.stringify(s.charges) || before.plea !== s.plea)) out.push({ mode: 'update', type: 'suspect', data: s });
        }
        for (const [sid, s] of oldS) if (!newS.has(sid)) out.push({ mode: 'delete', type: 'suspect', data: s });

        for (const [kind, before, now] of [
            ['primary', list(o.primaries), form.primaries],
            ['person', list(o.people), form.people],
        ]) {
            const b = bySID(before);
            const n = bySID(now);
            for (const [sid, p] of n) if (!b.has(sid)) out.push({ mode: 'add', type: kind, data: p });
            for (const [sid, p] of b) if (!n.has(sid)) out.push({ mode: 'delete', type: kind, data: p });
        }
        return out;
    }

    async function save(e) {
        e?.preventDefault();
        errors = validate();
        if (errors.length) return;
        saving = true;
        const notes = textToHtml(form.notes);
        if (editing) {
            const res = await call('Update', {
                type: 'report',
                id: original.id,
                report: { type: form.type, title: form.title.trim(), notes, time: original.time, allowAttorney: form.allowAttorney, changes: changes() },
            });
            saving = false;
            if (res) {
                toast.success('Report saved');
                go('report', { id: original.id }, { replace: false });
            } else errors = [{ field: 'r-title', text: 'The report was not saved. Check your connection and try again.' }];
        } else {
            const res = await call('Create', {
                type: 'report',
                doc: {
                    type: form.type,
                    title: form.title.trim(),
                    notes,
                    time: Date.now(),
                    evidence: hasEvidence ? form.evidence : [],
                    suspects: hasSuspects ? form.suspects : [],
                    primaries: form.primaries,
                    people: form.people,
                    allowAttorney: form.allowAttorney,
                },
            });
            saving = false;
            if (res) {
                toast.success(`Report ${res} filed`);
                go('report', { id: Number(res) });
            } else errors = [{ field: 'r-title', text: 'The report was not filed. Check your connection and try again.' }];
        }
    }

    const focusField = (id) => document.getElementById(id)?.focus();
    const chargeSuspect = $derived(form.suspects.find((s) => s.SID == chargesFor));
</script>

<div class="mdt-back"><Button variant="tertiary" size="sm" icon="arrow-left" onclick={() => back('reports')}>{editing ? 'Back to the report' : 'Back to reports'}</Button></div>

{#if status === 'loading'}
    <State status="loading" title="Opening report" />
{:else if status === 'error'}
    <State status="error" onretry={load} />
{:else if status === 'missing'}
    <State title="Report {p0.id} was not found">It may have been deleted.</State>
{:else if !editing && !creatable.length}
    <State title="You cannot file reports">Your rank has no permission to create reports. Ask a supervisor.</State>
{:else}
    <form onsubmit={save} novalidate>
        <div class="mdt-page-head">
            <div>
                <h1>{editing ? `Edit report ${original.id}` : `New ${reportTypeLabel(form.type).toLowerCase()}`}</h1>
                <p>{editing ? reportTypeLabel(form.type) : 'Fill in each part, then file the report. You can edit it later.'}</p>
            </div>
        </div>

        {#if errors.length}
            <div class="summary">
                <PageAlert type="error" title="There is a problem">
                    <ul>
                        {#each errors as er, i (i)}
                            <li><button type="button" class="mdt-link" onclick={() => focusField(er.field)}>{er.text}</button></li>
                        {/each}
                    </ul>
                </PageAlert>
            </div>
        {/if}

        <div class="mdt-split">
            <div>
                {#if !editing}
                    <Field label="Report type" id="r-type">
                        <Select id="r-type" bind:value={form.type} options={creatable.map((t) => ({ value: t.value, label: t.label }))} />
                    </Field>
                {/if}
                <Field label="Title" hint="Say what happened and where, for example Pursuit and arrest on Vespucci Boulevard." id="r-title" error={errors.find((e) => e.field === 'r-title')?.text}>
                    <TextInput id="r-title" bind:value={form.title} />
                </Field>
                <Field label="Notes" hint="Write what you saw and did, in order. Leave a blank line between paragraphs." id="r-notes" error={errors.find((e) => e.field === 'r-notes')?.text}>
                    <Textarea id="r-notes" rows={8} bind:value={form.notes} />
                </Field>
                {#if type?.attorney}
                    <div class="check"><Checkbox bind:checked={form.allowAttorney} label="Defence attorneys can read this report" /></div>
                {/if}

                {#if hasSuspects}
                    <section class="mdt-section">
                        <h2>Suspects and charges</h2>
                        {#if form.suspects.length}
                            <table class="au-table au-table--dense mdt-table">
                                <thead>
                                    <tr>
                                        <th scope="col">Suspect</th>
                                        <th scope="col">Charges</th>
                                        <th scope="col">Plea</th>
                                        <th scope="col"><span class="au-hidden">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each form.suspects as s (s.SID)}
                                        {@const resolved = resolveCharges(s.charges)}
                                        {@const t = chargeTotals(resolved)}
                                        <tr>
                                            <td><strong>{personName(s)}</strong><div class="au-muted">State ID <span class="au-mono">{s.SID}</span></div></td>
                                            <td>
                                                {#if resolved.length}
                                                    <div class="mdt-tags">
                                                        {#each resolved as c (c.id)}<Tag tone={chargeType(c.type).tone}>{c.title}{c.count > 1 ? ` x${c.count}` : ''}</Tag>{/each}
                                                    </div>
                                                    <div class="au-muted sum">{months(t.months)}, {formatMoney(t.fine)}, {t.points} points</div>
                                                {:else}
                                                    <span class="au-muted">No charges yet</span>
                                                {/if}
                                            </td>
                                            <td class="plea">
                                                {#if s.sentenced}
                                                    <Tag tone="success">Sentenced</Tag>
                                                {:else}
                                                    <Select size="sm" bind:value={s.plea} options={PleaTypes} aria-label="Plea for {personName(s)}" />
                                                {/if}
                                            </td>
                                            <td class="act">
                                                {#if !lockedSuspects.has(s.SID)}
                                                    <Button variant="secondary" size="sm" onclick={() => (chargesFor = s.SID)}>Choose charges</Button>
                                                    <Button variant="tertiary" size="sm" onclick={() => (form.suspects = form.suspects.filter((x) => x.SID !== s.SID))}>Remove</Button>
                                                {/if}
                                            </td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        {:else}
                            <p class="au-muted">An incident report needs at least one suspect.</p>
                        {/if}
                        <div class="picker-wrap" id="r-suspect" tabindex="-1">
                            <PersonPicker label="Add a suspect" exclude={form.suspects.map((s) => s.SID)} onpick={addSuspect} />
                        </div>
                    </section>
                {/if}

                {#if hasEvidence}
                    <section class="mdt-section">
                        <h2>Evidence</h2>
                        {#if form.evidence.length}
                            <table class="au-table au-table--dense mdt-table">
                                <thead><tr><th scope="col">Type</th><th scope="col">Description</th><th scope="col">Value</th><th scope="col"><span class="au-hidden">Actions</span></th></tr></thead>
                                <tbody>
                                    {#each form.evidence as e, i (e.id ?? `new-${i}`)}
                                        <tr>
                                            <td>{evidenceLabel(e.type)}</td>
                                            <td>{e.label}</td>
                                            <td class="au-mono value">{e.value}</td>
                                            <td class="act"><Button variant="tertiary" size="sm" onclick={() => (form.evidence = form.evidence.filter((x) => x !== e))}>Remove</Button></td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        {:else}
                            <p class="au-muted">No evidence logged.</p>
                        {/if}
                        <div class="ev-row">
                            <Field label="Type" id="ev-type"><Select id="ev-type" bind:value={ev.type} options={EvidenceTypes} /></Field>
                            <Field label="Description" id="ev-label"><TextInput id="ev-label" bind:value={ev.label} /></Field>
                            <Field label="Value" hint="Photo link or item number" id="ev-value"><TextInput id="ev-value" bind:value={ev.value} /></Field>
                            <div class="ev-add"><Button variant="secondary" onclick={addEvidence}>Add evidence</Button></div>
                        </div>
                    </section>
                {/if}
            </div>

            <aside>
                <section class="mdt-section">
                    <h2>{officerWord} involved</h2>
                    {#if form.primaries.length}
                        <ul class="people">
                            {#each form.primaries as p (p.SID)}
                                <li>
                                    <span>{p.Callsign ? `${p.Callsign} ` : ''}{personName(p)}</span>
                                    <Button variant="tertiary" size="sm" onclick={() => (form.primaries = form.primaries.filter((x) => x.SID !== p.SID))}>Remove</Button>
                                </li>
                            {/each}
                        </ul>
                    {:else}
                        <p class="au-muted">Nobody added.</p>
                    {/if}
                    <PersonPicker label="Add {officerWord.toLowerCase()}" type="job" job={officerJob} exclude={form.primaries.map((p) => p.SID)} onpick={(p) => form.primaries.push({ SID: p.SID, First: p.First, Last: p.Last, Callsign: p.Callsign ?? '' })} />
                </section>

                <section class="mdt-section">
                    <h2>Other people</h2>
                    {#if form.people.length}
                        <ul class="people">
                            {#each form.people as p (p.SID)}
                                <li>
                                    <span>{personName(p)}</span>
                                    <Button variant="tertiary" size="sm" onclick={() => (form.people = form.people.filter((x) => x.SID !== p.SID))}>Remove</Button>
                                </li>
                            {/each}
                        </ul>
                    {:else}
                        <p class="au-muted">Victims and witnesses go here.</p>
                    {/if}
                    <PersonPicker label="Add a victim or witness" exclude={form.people.map((p) => p.SID)} onpick={(p) => form.people.push({ SID: p.SID, First: p.First, Last: p.Last })} />
                </section>
            </aside>
        </div>

        <div class="footer-actions">
            <Button type="submit" loading={saving}>{editing ? 'Save changes' : 'File report'}</Button>
            <Button variant="secondary" onclick={() => back('reports')}>Cancel</Button>
        </div>
    </form>

    <ChargePicker
        open={Boolean(chargeSuspect)}
        title={chargeSuspect ? `Charges for ${personName(chargeSuspect)}` : 'Charges'}
        selected={chargeSuspect?.charges ?? []}
        onclose={() => (chargesFor = null)}
        onsave={(next) => {
            if (chargeSuspect) chargeSuspect.charges = next;
            chargesFor = null;
        }}
    />
{/if}

<style>
    .summary {
        margin-bottom: var(--au-s4);
    }
    .summary ul {
        margin: var(--au-s1) 0 0;
        padding-left: var(--au-s5);
    }
    .check {
        margin: 0 0 var(--au-s6);
    }
    .sum {
        margin-top: var(--au-s1);
    }
    .plea {
        width: 170px;
    }
    .act {
        white-space: nowrap;
        text-align: right;
    }
    .value {
        word-break: break-all;
    }
    .picker-wrap {
        margin-top: var(--au-s3);
        max-width: 420px;
    }
    .ev-row {
        display: grid;
        grid-template-columns: 170px 1fr 1fr auto;
        gap: 0 var(--au-s3);
        align-items: end;
        margin-top: var(--au-s3);
    }
    .ev-add {
        margin-bottom: var(--au-s4);
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
        gap: var(--au-s2);
        padding: var(--au-s1) 0;
        border-bottom: 1px solid var(--au-border);
    }
    .footer-actions {
        display: flex;
        gap: var(--au-s3);
        padding-top: var(--au-s4);
        border-top: 4px solid var(--au-ink);
    }
</style>
