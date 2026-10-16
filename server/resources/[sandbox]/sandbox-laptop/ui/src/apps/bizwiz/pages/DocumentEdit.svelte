<script>
    import { untrack } from 'svelte';
    import { Button, Field, TextInput, Checkbox, Breadcrumbs, PageAlert, Spinner } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import RichEditor from '../../../components/common/RichEditor.svelte';
    import { showAlert } from '../../../state/notify.svelte.js';
    import { hasJobPerm } from '../../../lib/perms.js';
    import { cleanHtml, isBlank } from '../../../lib/html.js';

    /** Create a document, or edit one (params.id): BusinessDocumentCreate / BusinessDocumentUpdate. */
    let { params = {}, onnav } = $props();

    // The page is keyed on params.id, so the first value is the only one.
    const editing = untrack(() => Boolean(params.id));
    let doc = $state({ title: '', notes: '', pinned: false });
    let loading = $state(editing);
    let missing = $state(false);
    let errors = $state({});
    let failure = $state(null);
    let busy = $state(false);
    const canPin = $derived(hasJobPerm('TABLET_PIN_DOCUMENT'));

    async function load() {
        const res = await fetchNui('BusinessDocumentView', { id: params.id });
        if (res && typeof res === 'object' && res._id !== undefined) doc = { ...res, title: res.title ?? '', notes: res.notes ?? '', pinned: Boolean(res.pinned) };
        else missing = true;
        loading = false;
    }

    async function submit() {
        const e = {};
        if (!doc.title.trim()) e.title = 'Enter a title for the document';
        if (isBlank(doc.notes)) e.notes = 'Write the document';
        errors = e;
        failure = null;
        if (Object.keys(e).length) return;
        busy = true;
        const notes = cleanHtml(doc.notes);
        if (editing) {
            const res = await fetchNui('BusinessDocumentUpdate', {
                id: doc._id,
                Report: { title: doc.title.trim(), pinned: doc.pinned, notes, time: doc.time, author: doc.author },
            });
            busy = false;
            if (res === true) {
                showAlert('Document saved', 'success');
                onnav('View/Document', { id: doc._id });
            } else failure = 'The document was not saved. You may not have permission to edit documents.';
        } else {
            const res = await fetchNui('BusinessDocumentCreate', { doc: { title: doc.title.trim(), pinned: doc.pinned, notes, time: Date.now() } });
            busy = false;
            if (res && typeof res === 'object' && res._id !== undefined) {
                showAlert('Document created', 'success');
                onnav('View/Document', { id: res._id });
            } else failure = 'The document was not created. You may not have permission to create documents.';
        }
    }

    function cancel() {
        if (editing) onnav('View/Document', { id: params.id });
        else onnav('Search/Document');
    }

    if (editing) load();
</script>

<Breadcrumbs items={[{ label: 'Documents', onclick: () => onnav('Search/Document') }, { label: editing ? 'Edit document' : 'New document' }]} />
<h3 class="heading">{editing ? 'Edit document' : 'New document'}</h3>

{#if loading}
    <div class="loading"><Spinner /> Loading document</div>
{:else if missing}
    <div class="state">
        <strong>This document could not be opened</strong>
        <p>It may have been deleted.</p>
        <Button variant="secondary" onclick={() => onnav('Search/Document')}>Back to documents</Button>
    </div>
{:else}
    {#if failure}<PageAlert type="error" compact>{failure}</PageAlert>{/if}
    <form
        class="form"
        onsubmit={(e) => {
            e.preventDefault();
            submit();
        }}
    >
        <Field label="Title" id="doc-title" error={errors.title}>
            <TextInput id="doc-title" bind:value={doc.title} maxlength="120" invalid={Boolean(errors.title)} autocomplete="off" />
        </Field>
        {#if canPin}
            <div class="pin">
                <Checkbox bind:checked={doc.pinned} label="Pin to the top of the document list" />
            </div>
        {/if}
        <RichEditor id="doc-notes" label="Document" bind:value={doc.notes} error={errors.notes} minHeight="280px" />
        <div class="actions">
            <Button type="submit" loading={busy}>{editing ? 'Save document' : 'Create document'}</Button>
            <Button variant="tertiary" onclick={cancel}>Cancel</Button>
        </div>
    </form>
{/if}

<style>
    .form {
        max-width: 56em;
    }
    .pin {
        margin: 0 0 var(--au-s4);
    }
</style>
