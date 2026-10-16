<script>
    import { onMount } from 'svelte';
    import { Button, Field, Modal, PageAlert, Select, TextInput } from '@sandbox/ui-kit';
    import { app, hasPerm } from '../../state/app.svelte.js';
    import { store } from '../../state/data.svelte.js';
    import { toast } from '../../state/toasts.svelte.js';
    import { call, list } from '../../lib/api.js';
    import { STATIC_LIBRARY } from '../../lib/library.js';
    import State from '../common/State.svelte';

    /** Policies and guides. A document opens inside the terminal. */
    let status = $state('loading');
    let docs = $state([]);
    let viewing = $state(null);
    let adding = $state(false);
    let removing = $state(null);
    let busy = $state(false);
    let f = $state({ label: '', link: '', job: app.job?.Id ?? 'police', workplace: '' });
    let errors = $state({});
    const isAdmin = $derived(hasPerm(true));

    async function load() {
        status = 'loading';
        const res = await call('GetLibraryDocuments', {});
        if (res === null) {
            status = 'error';
            return;
        }
        docs = list(res);
        status = 'ready';
    }
    onMount(load);

    const fixed = $derived((STATIC_LIBRARY[app.job?.Id] ?? []).filter((d) => d.link));
    const all = $derived([...fixed.map((d, i) => ({ ...d, id: `static-${i}`, fixed: true })), ...docs]);
    const jobs = $derived(list(store.governmentJobs).map((j) => ({ value: j, label: store.governmentJobsData?.[j]?.Name ?? j })));
    const workplaces = $derived([{ value: '', label: 'Every department' }, ...list(store.governmentJobsData?.[f.job]?.Workplaces).map((w) => ({ value: w.Id, label: w.Name }))]);

    async function add() {
        errors = {};
        if (!f.label.trim()) errors.label = 'Enter the document name';
        if (!/^https:\/\//.test(f.link.trim())) errors.link = 'Enter a link that starts with https://';
        if (Object.keys(errors).length) return;
        busy = true;
        const res = await call('AddLibraryDocument', { label: f.label.trim(), link: f.link.trim(), job: f.job, workplace: f.workplace || null });
        busy = false;
        if (res) {
            toast.success('Document added');
            adding = false;
            load();
        } else errors = { form: 'The document was not added. Only system administrators can add documents.' };
    }

    async function remove() {
        busy = true;
        const res = await call('RemoveLibraryDocument', { id: removing.id });
        busy = false;
        if (res) {
            docs = docs.filter((d) => d.id !== removing.id);
            toast.success('Document removed');
            removing = null;
        } else toast.error('The document was not removed. Try again.');
    }
</script>

{#if viewing}
    <div class="viewer">
        <div class="mdt-page-head">
            <div><h1>{viewing.label}</h1></div>
            <div class="mdt-page-head__actions"><Button variant="secondary" onclick={() => (viewing = null)}>Close document</Button></div>
        </div>
        <iframe title={viewing.label} src={viewing.link} sandbox="allow-scripts allow-same-origin" referrerpolicy="no-referrer"></iframe>
    </div>
{:else}
    <div class="mdt-page-head">
        <div>
            <h1>Library</h1>
            <p>Policies, procedures and guides for your department.</p>
        </div>
        {#if isAdmin}<div class="mdt-page-head__actions"><Button onclick={() => ((f = { label: '', link: '', job: app.job?.Id ?? 'police', workplace: '' }), (errors = {}), (adding = true))}>Add a document</Button></div>{/if}
    </div>

    {#if status === 'loading'}
        <State status="loading" title="Loading documents" />
    {:else if status === 'error'}
        <State status="error" onretry={load} />
    {:else if !all.length}
        <State title="No documents yet">Command staff add policies and guides here.</State>
    {:else}
        <table class="au-table au-table--hover au-table--dense mdt-table">
            <thead><tr><th scope="col">Document</th><th scope="col"><span class="au-hidden">Actions</span></th></tr></thead>
            <tbody>
                {#each all as d (d.id)}
                    <tr>
                        <td><button type="button" class="mdt-link" onclick={() => (viewing = d)}>{d.label}</button></td>
                        <td class="act">{#if isAdmin && !d.fixed}<Button variant="tertiary" size="sm" onclick={() => (removing = d)}>Remove</Button>{/if}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {/if}
{/if}

<Modal open={adding} title="Add a document" onclose={() => (adding = false)}>
    {#if errors.form}<div class="block"><PageAlert type="error">{errors.form}</PageAlert></div>{/if}
    <Field label="Name" id="l-label" error={errors.label}><TextInput id="l-label" bind:value={f.label} /></Field>
    <Field label="Link" hint="A PDF works best. The game must be able to reach it." id="l-link" error={errors.link}><TextInput id="l-link" bind:value={f.link} /></Field>
    <div class="mdt-form-row">
        <Field label="Job" id="l-job"><Select id="l-job" bind:value={f.job} options={jobs} onchange={() => (f.workplace = '')} /></Field>
        <Field label="Department" id="l-wp"><Select id="l-wp" bind:value={f.workplace} options={workplaces} /></Field>
    </div>
    {#snippet actions()}
        <Button variant="secondary" onclick={() => (adding = false)}>Cancel</Button>
        <Button loading={busy} onclick={add}>Add document</Button>
    {/snippet}
</Modal>

<Modal open={Boolean(removing)} title="Remove {removing?.label ?? 'document'}" onclose={() => (removing = null)}>
    <p>The link disappears from everyone's library.</p>
    {#snippet actions()}
        <Button variant="secondary" onclick={() => (removing = null)}>Cancel</Button>
        <Button variant="danger" loading={busy} onclick={remove}>Remove document</Button>
    {/snippet}
</Modal>

<style>
    .viewer {
        display: flex;
        flex-direction: column;
        height: 100%;
    }
    iframe {
        flex: 1;
        min-height: 480px;
        width: 100%;
        border: 2px solid var(--au-border);
        background: var(--au-bg-sunk);
    }
    .act {
        text-align: right;
    }
    .block {
        margin-bottom: var(--au-s4);
    }
</style>
