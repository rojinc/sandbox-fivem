<script>
    import { Button, Field, Modal, PageAlert, Select, Tag, TextInput, Textarea, uid } from '@sandbox/ui-kit';
    import { hasPerm } from '../../state/app.svelte.js';
    import { store, addData, updateData, removeData } from '../../state/data.svelte.js';
    import { toast } from '../../state/toasts.svelte.js';
    import { call, list } from '../../lib/api.js';
    import { ChargeTypes, chargeType } from '../../lib/data.js';
    import { sortCharges } from '../../lib/charges.js';
    import { formatMoney } from '../../lib/format.js';
    import State from '../common/State.svelte';

    /** The penal code. System admins add, change and remove charges here. */
    let filter = $state('');
    let cls = $state('');
    const fid = uid('pc');
    const canEdit = $derived(hasPerm(true));

    const all = $derived(sortCharges(list(store.charges)));
    const shown = $derived(all.filter((c) => (!cls || String(c.type) === cls) && (!filter.trim() || `${c.title} ${c.description ?? ''}`.toLowerCase().includes(filter.trim().toLowerCase()))));

    let editing = $state(null); // charge doc being edited, or a new one
    let confirmDelete = $state(null);
    let errors = $state({});
    let busy = $state(false);

    function edit(c) {
        errors = {};
        editing = c ? { ...c, type: String(c.type), jail: String(c.jail ?? 0), fine: String(c.fine ?? 0), points: String(c.points ?? 0) } : { title: '', description: '', type: '1', jail: '0', fine: '0', points: '0' };
    }

    async function save() {
        const e = {};
        if (!editing.title.trim()) e.title = 'Enter the name of the charge';
        for (const k of ['jail', 'fine', 'points']) if (!(Number(editing[k]) >= 0)) e[k] = 'Enter 0 or a whole number';
        errors = e;
        if (Object.keys(e).length) return;
        const doc = { ...editing, title: editing.title.trim(), type: Number(editing.type), jail: Number(editing.jail), fine: Number(editing.fine), points: Number(editing.points) };
        busy = true;
        const res = await call(doc.id != null ? 'Update' : 'Create', { type: 'charge', doc });
        busy = false;
        if (res) {
            // The server also broadcasts ADD_DATA / UPDATE_DATA; this keeps the page right if it does not.
            if (doc.id != null) updateData('charges', doc.id, doc);
            else if (!list(store.charges).some((c) => c.title === doc.title)) addData('charges', doc);
            toast.success(doc.id != null ? 'Charge saved' : 'Charge added');
            editing = null;
        } else errors = { form: 'The charge was not saved. Only system administrators can change the penal code.' };
    }

    async function remove() {
        busy = true;
        const res = await call('Delete', { type: 'charge', doc: confirmDelete });
        busy = false;
        if (res) {
            removeData('charges', confirmDelete.id);
            toast.success('Charge removed');
            confirmDelete = null;
        } else toast.error('The charge was not removed. Try again.');
    }
</script>

<div class="mdt-page-head">
    <div>
        <h1>Charges</h1>
        <p>The San Andreas penal code, with the sentence for each charge before any reduction.</p>
    </div>
    {#if canEdit}<div class="mdt-page-head__actions"><Button onclick={() => edit(null)}>Add a charge</Button></div>{/if}
</div>

<div class="filters" role="search">
    <div class="f-term">
        <label for={fid}>Find a charge</label>
        <TextInput id={fid} bind:value={filter} placeholder="Name or description" autocomplete="off" />
    </div>
    <div class="f-class">
        <label for="{fid}-c">Class</label>
        <Select id="{fid}-c" bind:value={cls} options={[{ value: '', label: 'All classes' }, ...ChargeTypes.map((t) => ({ value: String(t.value), label: t.label }))]} />
    </div>
    <p class="au-muted count" aria-live="polite">Showing {shown.length} of {all.length}</p>
</div>

{#if !all.length}
    <State title="No charges loaded">The penal code arrives when you go on duty. Reopen the terminal if this stays empty.</State>
{:else if !shown.length}
    <State title="No charges match">Clear the search or choose all classes.</State>
{:else}
    <table class="au-table au-table--dense mdt-table">
        <thead>
            <tr>
                <th scope="col">Charge</th>
                <th scope="col">Class</th>
                <th scope="col" class="mdt-num">Jail</th>
                <th scope="col" class="mdt-num">Fine</th>
                <th scope="col" class="mdt-num">Points</th>
                {#if canEdit}<th scope="col"><span class="au-hidden">Actions</span></th>{/if}
            </tr>
        </thead>
        <tbody>
            {#each shown as c (c.id ?? c.title)}
                <tr>
                    <td><strong>{c.title}</strong>{#if c.description}<div class="au-muted">{c.description}</div>{/if}</td>
                    <td><Tag tone={chargeType(c.type).tone}>{chargeType(c.type).label}</Tag></td>
                    <td class="mdt-num au-mono">{c.jail ? `${c.jail} mo` : 'None'}</td>
                    <td class="mdt-num au-mono">{c.fine ? formatMoney(c.fine) : 'None'}</td>
                    <td class="mdt-num au-mono">{c.points || 0}</td>
                    {#if canEdit}
                        <td class="act">
                            <Button variant="tertiary" size="sm" onclick={() => edit(c)}>Edit</Button>
                            <Button variant="tertiary" size="sm" onclick={() => (confirmDelete = c)}>Remove</Button>
                        </td>
                    {/if}
                </tr>
            {/each}
        </tbody>
    </table>
{/if}

<Modal open={Boolean(editing)} title={editing?.id != null ? 'Edit charge' : 'Add a charge'} width="640px" onclose={() => (editing = null)}>
    {#if editing}
        {#if errors.form}<div class="block"><PageAlert type="error">{errors.form}</PageAlert></div>{/if}
        <Field label="Charge" id="c-title" error={errors.title}><TextInput id="c-title" bind:value={editing.title} /></Field>
        <Field label="Class" id="c-type"><Select id="c-type" bind:value={editing.type} options={ChargeTypes.map((t) => ({ value: String(t.value), label: t.label }))} /></Field>
        <Field label="Description (optional)" id="c-desc"><Textarea id="c-desc" rows={3} bind:value={editing.description} /></Field>
        <div class="mdt-form-row">
            <Field label="Jail (months)" id="c-jail" error={errors.jail}><TextInput id="c-jail" type="number" min="0" bind:value={editing.jail} /></Field>
            <Field label="Fine ($)" id="c-fine" error={errors.fine}><TextInput id="c-fine" type="number" min="0" bind:value={editing.fine} /></Field>
            <Field label="Licence points" id="c-points" error={errors.points}><TextInput id="c-points" type="number" min="0" bind:value={editing.points} /></Field>
        </div>
    {/if}
    {#snippet actions()}
        <Button variant="secondary" onclick={() => (editing = null)}>Cancel</Button>
        <Button loading={busy} onclick={save}>{editing?.id != null ? 'Save charge' : 'Add charge'}</Button>
    {/snippet}
</Modal>

<Modal open={Boolean(confirmDelete)} title="Remove {confirmDelete?.title ?? 'charge'}" onclose={() => (confirmDelete = null)}>
    <p>Officers can no longer choose it, and reports that list it stop showing it.</p>
    {#snippet actions()}
        <Button variant="secondary" onclick={() => (confirmDelete = null)}>Cancel</Button>
        <Button variant="danger" loading={busy} onclick={remove}>Remove charge</Button>
    {/snippet}
</Modal>

<style>
    .filters {
        display: flex;
        align-items: flex-end;
        gap: var(--au-s3);
        margin: 0 0 var(--au-s4);
    }
    .filters label {
        display: block;
        font-weight: 700;
        margin-bottom: var(--au-s1);
    }
    .f-term {
        width: 360px;
    }
    .f-class {
        width: 220px;
    }
    .count {
        margin: 0 0 10px auto;
    }
    .act {
        white-space: nowrap;
        text-align: right;
    }
    .block {
        margin-bottom: var(--au-s4);
    }
</style>
