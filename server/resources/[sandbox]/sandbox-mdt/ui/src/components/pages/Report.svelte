<script>
    import { onMount } from 'svelte';
    import { Button, Checkbox, Field, Modal, PageAlert, RichText, Select, Tag, TextInput, Textarea } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import { app, go, back, hasPerm, hasJob } from '../../state/app.svelte.js';
    import { toast } from '../../state/toasts.svelte.js';
    import { call, list } from '../../lib/api.js';
    import { reportType, reportTypeLabel, pleaLabel, evidenceLabel, chargeType, ReductionTypes, licenceName } from '../../lib/data.js';
    import { resolveCharges, chargeTotals, sentenceFor } from '../../lib/charges.js';
    import { formatDateTime, formatMoney, months, personName, plural, toDate } from '../../lib/format.js';
    import State from '../common/State.svelte';

    let { params = {} } = $props();

    let status = $state('loading');
    let r = $state(null);
    let dialog = $state(null); // { kind: sentence | warrant | overturn | delete, suspect }
    let busy = $state(false);
    let reduction = $state({ type: '', value: '0' });
    let revoke = $state({ drivers: false, weapons: false, hunting: false, fishing: false });
    let toDoc = $state(false);
    let warrantNotes = $state('');

    async function load() {
        status = 'loading';
        const res = await call('View', { type: 'report', id: params.id });
        if (!res || !res.id) {
            status = res === null ? 'error' : 'missing';
            return;
        }
        r = res;
        status = 'ready';
    }
    onMount(load);

    const type = $derived(reportType(r?.type));
    const canEdit = $derived(Boolean(type?.create && hasPerm(type.create)));
    const canDelete = $derived(hasPerm(true));
    const canSentence = $derived(hasJob('police') || hasJob('government', 'doj'));
    const canOverturn = $derived(hasPerm('DOJ_OVERTURN_CHARGES'));
    const suspects = $derived(list(r?.suspects));
    const overturned = $derived(list(r?.suspectsOverturned));
    const evidence = $derived(list(r?.evidence));
    const breakpoint = $derived(Number(app.points?.license) || 20);

    function paroleCarry(s) {
        const p = list(r?.paroleData).find((x) => x.SID == s.SID);
        const end = toDate(p?.end);
        return p && end && end.getTime() > Date.now() ? Number(p.parole) || 0 : 0;
    }

    function statusOf(s) {
        if (s.sentenced) return { tone: 'success', text: 'Sentenced' };
        if (s.warrant) return { tone: 'error', text: `Warrant ${s.warrant}` };
        return { tone: 'warning', text: 'Awaiting sentence' };
    }

    function openSentence(s) {
        const t = chargeTotals(resolveCharges(s.charges));
        reduction = { type: '', value: '0' };
        revoke = {
            drivers: Boolean(s.Licenses?.Drivers?.Active && (Number(s.Licenses?.Drivers?.Points) || 0) + t.points >= breakpoint),
            weapons: Boolean(t.felony && s.Licenses?.Weapons?.Active),
            hunting: false,
            fishing: false,
        };
        toDoc = false;
        dialog = { kind: 'sentence', suspect: s };
    }

    const sentenceTotals = $derived(dialog?.kind === 'sentence' ? chargeTotals(resolveCharges(dialog.suspect.charges)) : null);
    const sentence = $derived(dialog?.kind === 'sentence' ? sentenceFor(sentenceTotals, reduction, paroleCarry(dialog.suspect)) : null);

    async function submitSentence() {
        const s = dialog.suspect;
        const pct = Number(reduction.value) || 0;
        if (reduction.type && (pct < 0 || pct > 100)) return toast.error('Enter a reduction from 0 to 100 percent.');
        busy = true;
        const parole = sentenceTotals.infraction
            ? null
            : { end: Math.floor(Date.now() / 1000) + sentence.parole * 60, total: sentence.parole, parole: Math.ceil(sentence.jail * 0.5), sentence: sentence.jail, fine: sentence.fine };
        const res = await call('SentencePlayer', {
            report: r.id,
            data: s,
            sentence: { type: reduction.type || false, value: pct, revoke: { ...revoke }, doc: toDoc },
            jail: sentence.jail,
            fine: sentence.fine,
            points: sentence.points,
            parole,
        });
        busy = false;
        if (res) {
            toast.success(`${personName(s)} sentenced`);
            dialog = null;
            load();
        } else toast.error('The sentence was not recorded. The suspect may already be sentenced.');
    }

    async function submitWarrant() {
        busy = true;
        const res = await call('IssueWarrant', { suspect: dialog.suspect, report: r.id, notes: warrantNotes.trim() });
        busy = false;
        if (res) {
            toast.success('Warrant issued for 7 days');
            dialog = null;
            load();
        } else toast.error('The warrant was not issued. Try again.');
    }

    async function submitOverturn() {
        busy = true;
        const res = await call('OverturnSentence', { SID: dialog.suspect.SID, report: r.id });
        busy = false;
        if (res) {
            toast.success('Sentence overturned');
            dialog = null;
            load();
        } else toast.error('The sentence was not overturned. Try again.');
    }

    async function submitDelete() {
        busy = true;
        const res = await call('Delete', { type: 'report', id: r.id });
        busy = false;
        if (res) {
            toast.success(`Report ${r.id} deleted`);
            dialog = null;
            go('reports', {}, { replace: true });
        } else toast.error('The report was not deleted. Try again.');
    }

    async function evidenceLocker() {
        const res = await call('EvidenceLocker', r.id);
        if (res) fetchNui('Close');
    }
</script>

<div class="mdt-back"><Button variant="tertiary" size="sm" icon="arrow-left" onclick={() => back('reports')}>Back to reports</Button></div>

{#if status === 'loading'}
    <State status="loading" title="Opening report" />
{:else if status === 'error'}
    <State status="error" onretry={load} />
{:else if status === 'missing'}
    <State title="Report {params.id} was not found">It may have been deleted, or you may not have access to this type of report.</State>
{:else}
    <div class="mdt-page-head">
        <div>
            <h1>{r.title}</h1>
            <p>{reportTypeLabel(r.type)} <span class="au-mono">{r.id}</span>, filed by {r.creatorCallsign ? `${r.creatorCallsign} ` : ''}{r.creatorName} on {formatDateTime(r.created)}</p>
        </div>
        <div class="mdt-page-head__actions">
            {#if type?.evidence && hasJob('police')}<Button variant="secondary" onclick={evidenceLocker}>Open evidence locker</Button>{/if}
            {#if canDelete}<Button variant="danger" onclick={() => (dialog = { kind: 'delete' })}>Delete report</Button>{/if}
            {#if canEdit}<Button onclick={() => go('report-edit', { id: r.id })}>Edit report</Button>{/if}
        </div>
    </div>

    <div class="mdt-split">
        <div>
            <section class="mdt-section">
                <h2>Notes</h2>
                {#if r.notes}
                    <RichText tag="div" class="mdt-rich" text={r.notes} allowedTags={['h2', 'h3', 'blockquote']} />
                {:else}
                    <p class="au-muted">No notes written.</p>
                {/if}
            </section>

            {#if Number(r.type) === 0}
                <section class="mdt-section">
                    <h2>Suspects</h2>
                    {#if suspects.length}
                        <table class="au-table au-table--dense mdt-table">
                            <thead>
                                <tr>
                                    <th scope="col">Suspect</th>
                                    <th scope="col">Charges</th>
                                    <th scope="col">Plea</th>
                                    <th scope="col">Status</th>
                                    <th scope="col"><span class="au-hidden">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each suspects as s (s.SID)}
                                    {@const resolved = resolveCharges(s.charges)}
                                    {@const t = chargeTotals(resolved)}
                                    {@const st = statusOf(s)}
                                    <tr>
                                        <td class="who">
                                            <button type="button" class="mdt-link" onclick={() => go('person', { id: s.SID })}>{personName(s)}</button>
                                            <div class="au-muted">State ID <span class="au-mono">{s.SID}</span></div>
                                        </td>
                                        <td>
                                            <div class="mdt-tags">
                                                {#each resolved as c (c.id)}<Tag tone={chargeType(c.type).tone}>{c.title}{c.count > 1 ? ` x${c.count}` : ''}</Tag>{/each}
                                            </div>
                                            <div class="au-muted sum">
                                                {#if s.sentenced}Sentenced to {months(s.jail)}, {formatMoney(s.fine)} fine{#if s.doc}, sent to corrections{/if}{:else}{months(t.months)}, {formatMoney(t.fine)}, {t.points} points{/if}
                                            </div>
                                        </td>
                                        <td class="nowrap">{pleaLabel(s.plea)}</td>
                                        <td><Tag tone={st.tone}>{st.text}</Tag></td>
                                        <td class="act">
                                            {#if !s.sentenced && canSentence}
                                                <Button variant="secondary" size="sm" onclick={() => openSentence(s)}>Sentence</Button>
                                                {#if !s.warrant}<Button variant="secondary" size="sm" onclick={() => ((warrantNotes = ''), (dialog = { kind: 'warrant', suspect: s }))}>Issue warrant</Button>{/if}
                                            {:else if s.warrant && !s.sentenced}
                                                <Button variant="tertiary" size="sm" onclick={() => go('warrant', { id: s.warrant })}>View warrant</Button>
                                            {/if}
                                            {#if s.sentenced && canOverturn}
                                                <Button variant="tertiary" size="sm" onclick={() => (dialog = { kind: 'overturn', suspect: s })}>Overturn</Button>
                                            {/if}
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    {:else}
                        <p class="au-muted">No suspects on this report.</p>
                    {/if}
                    {#if overturned.length}
                        <p class="au-muted overturned">Overturned: {overturned.map((s) => personName(s)).join(', ')}</p>
                    {/if}
                </section>
            {/if}
        </div>

        <aside>
            <section class="mdt-section">
                <h2>{type?.officers ?? 'Officers'}</h2>
                {#if list(r.primaries).length}
                    <ul class="plain">
                        {#each list(r.primaries) as p (p.SID)}<li>{p.Callsign ? `${p.Callsign} ` : ''}{personName(p)}</li>{/each}
                    </ul>
                {:else}
                    <p class="au-muted">None listed.</p>
                {/if}
            </section>
            <section class="mdt-section">
                <h2>Other people</h2>
                {#if list(r.people).length}
                    <ul class="plain">
                        {#each list(r.people) as p (p.SID)}
                            <li><button type="button" class="mdt-link" onclick={() => go('person', { id: p.SID })}>{personName(p)}</button></li>
                        {/each}
                    </ul>
                {:else}
                    <p class="au-muted">None listed.</p>
                {/if}
            </section>
            {#if type?.evidence}
                <section class="mdt-section">
                    <h2>Evidence</h2>
                    {#if evidence.length}
                        <dl class="au-dl">
                            {#each evidence as e (e.id)}
                                <dt>{evidenceLabel(e.type)}</dt>
                                <dd>{e.label}<div class="au-mono value">{e.value}</div></dd>
                            {/each}
                        </dl>
                    {:else}
                        <p class="au-muted">No evidence logged.</p>
                    {/if}
                </section>
            {/if}
            <section class="mdt-section">
                <h2>Access</h2>
                <p>{r.allowAttorney ? 'Defence attorneys can read this report.' : 'Only your department can read this report.'}</p>
            </section>
        </aside>
    </div>

    {#if dialog?.kind === 'sentence'}
        {@const s = dialog.suspect}
        <Modal open title="Sentence {personName(s)}" width="720px" onclose={() => (dialog = null)}>
            {#if paroleCarry(s)}
                <div class="block"><PageAlert type="warning" compact>On parole: {months(paroleCarry(s))} of parole time is added to this sentence.</PageAlert></div>
            {/if}
            <div class="mdt-form-row">
                <Field label="Reduction" id="s-red">
                    <Select id="s-red" bind:value={reduction.type} options={ReductionTypes} />
                </Field>
                {#if reduction.type}
                    <Field label="Reduce by (percent)" id="s-pct"><TextInput id="s-pct" type="number" min="0" max="100" bind:value={reduction.value} /></Field>
                {/if}
            </div>
            <fieldset class="revoke">
                <legend>Licences to revoke</legend>
                <Checkbox bind:checked={revoke.drivers} disabled={!s.Licenses?.Drivers?.Active} label="{licenceName('Drivers')}{(Number(s.Licenses?.Drivers?.Points) || 0) + sentenceTotals.points >= breakpoint ? ' (reaches the points limit)' : ''}" />
                <Checkbox bind:checked={revoke.weapons} disabled={!sentenceTotals.felony || s.Licenses?.Weapons?.Suspended} label="{licenceName('Weapons')}{sentenceTotals.felony ? '' : ' (felonies only)'}" />
                <Checkbox bind:checked={revoke.hunting} disabled={s.Licenses?.Hunting?.Suspended} label={licenceName('Hunting')} />
                <Checkbox bind:checked={revoke.fishing} disabled={s.Licenses?.Fishing?.Suspended} label={licenceName('Fishing')} />
            </fieldset>
            <Checkbox bind:checked={toDoc} label="Send to the Department of Corrections" />
            <dl class="au-dl result">
                <dt>Jail</dt>
                <dd class="au-mono">{months(sentence.jail)}</dd>
                <dt>Fine</dt>
                <dd class="au-mono">{formatMoney(sentence.fine)}</dd>
                <dt>Licence points</dt>
                <dd class="au-mono">{sentence.points}</dd>
                <dt>Parole</dt>
                <dd>{sentenceTotals.infraction ? 'None for infractions' : months(sentence.parole)}</dd>
            </dl>
            {#snippet actions()}
                <Button variant="secondary" onclick={() => (dialog = null)}>Cancel</Button>
                <Button loading={busy} onclick={submitSentence}>Record sentence</Button>
            {/snippet}
        </Modal>
    {:else if dialog?.kind === 'warrant'}
        <Modal open title="Issue a warrant for {personName(dialog.suspect)}" onclose={() => (dialog = null)}>
            <p>The warrant lists this report's charges and expires after 7 days.</p>
            <Field label="Notes for officers (optional)" id="w-notes"><Textarea id="w-notes" rows={4} bind:value={warrantNotes} /></Field>
            {#snippet actions()}
                <Button variant="secondary" onclick={() => (dialog = null)}>Cancel</Button>
                <Button loading={busy} onclick={submitWarrant}>Issue warrant</Button>
            {/snippet}
        </Modal>
    {:else if dialog?.kind === 'overturn'}
        <Modal open title="Overturn sentence" onclose={() => (dialog = null)}>
            <p>The conviction of {personName(dialog.suspect)} on report {r.id} moves to the overturned list and no longer shows on their record.</p>
            {#snippet actions()}
                <Button variant="secondary" onclick={() => (dialog = null)}>Cancel</Button>
                <Button variant="danger" loading={busy} onclick={submitOverturn}>Overturn sentence</Button>
            {/snippet}
        </Modal>
    {:else if dialog?.kind === 'delete'}
        <Modal open title="Delete report {r.id}" onclose={() => (dialog = null)}>
            <p>The report, its suspects and its evidence are deleted for everyone. You cannot undo this.</p>
            {#snippet actions()}
                <Button variant="secondary" onclick={() => (dialog = null)}>Cancel</Button>
                <Button variant="danger" loading={busy} onclick={submitDelete}>Delete report</Button>
            {/snippet}
        </Modal>
    {/if}
{/if}

<style>
    .sum {
        margin-top: var(--au-s1);
    }
    .who,
    .nowrap {
        white-space: nowrap;
    }
    .act {
        white-space: nowrap;
        text-align: right;
    }
    .plain {
        list-style: none;
        margin: 0;
        padding: 0;
    }
    .plain li {
        padding: var(--au-s1) 0;
        border-bottom: 1px solid var(--au-border);
    }
    .value {
        color: var(--au-muted);
        word-break: break-all;
    }
    .overturned {
        margin-top: var(--au-s2);
    }
    .block {
        margin-bottom: var(--au-s3);
    }
    .revoke {
        border: 0;
        padding: 0;
        margin: 0 0 var(--au-s3);
        display: flex;
        flex-direction: column;
        gap: var(--au-s1);
    }
    .revoke legend {
        font-weight: 700;
        margin-bottom: var(--au-s1);
    }
    .result {
        margin-top: var(--au-s4);
        padding-top: var(--au-s3);
        border-top: 1px solid var(--au-border);
    }
</style>
