<script>
    import { Button, Modal, Breadcrumbs, Tag, Spinner } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import { showAlert } from '../../../state/notify.svelte.js';
    import { hasJobPerm } from '../../../lib/perms.js';
    import { formatDateTime, person } from '../../../lib/format.js';
    import { cleanHtml } from '../../../lib/html.js';

    /** One business document (BusinessDocumentView). */
    let { params = {}, onnav } = $props();

    let doc = $state(null);
    let loading = $state(true);
    let deleting = $state(false);
    let busy = $state(false);
    const canEdit = $derived(hasJobPerm('TABLET_CREATE_DOCUMENT'));
    const canDelete = $derived(hasJobPerm('TABLET_DELETE_DOCUMENT'));

    async function load() {
        loading = true;
        const res = params.id ? await fetchNui('BusinessDocumentView', { id: params.id }) : null;
        doc = res && typeof res === 'object' && !Array.isArray(res) && res._id !== undefined ? res : null;
        loading = false;
    }

    async function remove() {
        busy = true;
        const res = await fetchNui('BusinessDocumentDelete', { id: doc._id });
        busy = false;
        deleting = false;
        if (res === true) {
            showAlert('Document deleted', 'success');
            onnav('Search/Document');
        } else showAlert('The document was not deleted. Try again.', 'error');
    }

    load();
</script>

<Breadcrumbs items={[{ label: 'Documents', onclick: () => onnav('Search/Document') }, { label: doc?.title || 'Document' }]} />

{#if loading}
    <div class="loading"><Spinner /> Loading document</div>
{:else if !doc}
    <div class="state">
        <strong>This document could not be opened</strong>
        <p>It may have been deleted, or you may not have permission to view documents.</p>
        <Button variant="secondary" onclick={() => onnav('Search/Document')}>Back to documents</Button>
    </div>
{:else}
    <div class="section-head">
        <h3 class="heading">{doc.title || 'Untitled document'} {#if doc.pinned}<Tag>Pinned</Tag>{/if}</h3>
        <div class="actions">
            {#if canEdit}<Button onclick={() => onnav('Create/Document', { id: doc._id })}>Edit document</Button>{/if}
            {#if canDelete}<Button variant="secondary" onclick={() => (deleting = true)}>Delete document</Button>{/if}
        </div>
    </div>
    <dl class="facts">
        <div><dt>Created</dt><dd>{formatDateTime(doc.time)} by {person(doc.author)}{doc.author?.SID ? ` (State ID ${doc.author.SID})` : ''}</dd></div>
        {#if doc.lastUpdated}
            <div><dt>Last updated</dt><dd>{formatDateTime(doc.lastUpdated.Time)} by {person(doc.lastUpdated)}</dd></div>
        {/if}
    </dl>
    <div class="user-html">{@html cleanHtml(doc.notes)}</div>
{/if}

{#if deleting && doc}
    <Modal title="Delete this document?" onclose={() => (deleting = false)} width="460px">
        <p class="modal-text">"{doc.title}" is deleted for everyone at your business. This cannot be undone.</p>
        {#snippet actions()}
            <Button variant="secondary" onclick={() => (deleting = false)}>Keep document</Button>
            <Button variant="danger" loading={busy} onclick={remove}>Delete document</Button>
        {/snippet}
    </Modal>
{/if}

<style>
    .heading :global(.au-tag) {
        vertical-align: middle;
        margin-left: var(--au-s2);
    }
    .modal-text {
        margin: 0;
    }
</style>
