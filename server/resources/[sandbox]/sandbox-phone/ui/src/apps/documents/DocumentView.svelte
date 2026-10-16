<script>
    import { onMount } from 'svelte';
    import { Button, Field, TextInput, Radio, RichText, PageAlert, Spinner } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import AppPage from '../../components/common/AppPage.svelte';
    import Sheet from '../../components/common/Sheet.svelte';
    import { data, removeData } from '../../state/data.svelte.js';
    import { openApp, navigate } from '../../state/router.svelte.js';
    import { showAlert } from '../../state/notify.svelte.js';
    import { stamp, plain } from '../../lib/format.js';

    /** One document: read it, sign it when asked, share it, edit or delete it. */
    let { doc } = $props();

    const p = $derived(data.player ?? {});
    const own = $derived(doc ? String(doc.sid) === String(p.SID) : false);
    const signedAs = $derived(`${(p.First ?? '?')[0]}. ${p.Last ?? ''}`.trim());

    let signers = $state([]);
    let loadingSigs = $state(false);
    let signing = $state(false);
    let showSigs = $state(false);
    let confirmDelete = $state(false);
    let share = $state(null); // { type, target, nearby }
    let shareError = $state('');

    async function loadSignatures() {
        if (!doc) return;
        loadingSigs = true;
        try {
            const res = await fetchNui('Documents:GetSignatures', doc.id);
            signers = Array.isArray(res) ? res : Object.values(res ?? {});
        } catch {
            signers = [];
        }
        loadingSigs = false;
    }
    onMount(loadSignatures);

    // Live signatures from Lua land on doc.signatures (bridge); merge them into the list shown.
    $effect(() => {
        for (const s of doc?.signatures ?? []) {
            const i = signers.findIndex((x) => x.sid == s.sid);
            if (i >= 0) signers[i] = { ...signers[i], ...s };
            else signers.push(s);
        }
    });

    async function sign() {
        signing = true;
        try {
            const ok = await fetchNui('SignDocument', doc.id);
            if (ok) {
                doc.signed = Math.floor(Date.now() / 1000);
                doc.signed_name = signedAs;
                showAlert('Document signed', 'success');
            } else showAlert('The document could not be signed. Try again.', 'error');
        } catch {
            showAlert('The document could not be signed. Try again.', 'error');
        }
        signing = false;
    }

    async function remove() {
        confirmDelete = false;
        try {
            const ok = await fetchNui('DeleteDocument', { id: doc.id });
            if (ok) {
                const id = doc.id;
                navigate('/apps/documents', { replace: true });
                removeData('myDocuments', id);
                showAlert('Document deleted', 'success');
            } else showAlert('The document could not be deleted. Try again.', 'error');
        } catch {
            showAlert('The document could not be deleted. Try again.', 'error');
        }
    }

    async function sendShare(e) {
        e.preventDefault();
        const target = Number(String(share.target).trim());
        if (!share.nearby && (!Number.isInteger(target) || target <= 0)) {
            shareError = 'Enter the State ID of the person, for example 4021.';
            return;
        }
        shareError = '';
        const body = { type: Number(share.type), nearby: share.nearby, target: share.nearby ? 0 : target, document: $state.snapshot(doc) };
        share = null;
        try {
            const ok = await fetchNui('ShareDocument', body);
            showAlert(ok ? 'Document shared' : 'The document could not be shared. Check the State ID and try again.', ok ? 'success' : 'error');
        } catch {
            showAlert('The document could not be shared. Try again.', 'error');
        }
    }
</script>

<AppPage title="Document">
    {#if doc}
        <h2 class="doc__title">{plain(doc.title) || 'Untitled document'}</h2>
        <dl class="ph-facts">
            <div><dt>Owner</dt><dd>{own ? 'You' : plain(doc.sharer_name) || 'Someone else'}</dd></div>
            <div><dt>Last changed</dt><dd>{stamp(doc.time)}</dd></div>
            {#if signers.length}
                <div><dt>Signatures</dt><dd>{signers.filter((s) => s.signed).length} of {signers.length} signed</dd></div>
            {/if}
        </dl>

        {#if doc.signature_required}
            <div class="ph-pad sign">
                {#if doc.signed}
                    <PageAlert type="success" title="You signed this document">Signed as {plain(doc.signed_name)} at {stamp(doc.signed)}.</PageAlert>
                {:else}
                    <PageAlert type="warning" title="Your signature is needed">{plain(doc.sharer_name) || 'The owner'} asked you to sign. Read it first; you will sign as {signedAs}.</PageAlert>
                    <Button loading={signing} onclick={sign}>Sign document</Button>
                {/if}
            </div>
        {/if}

        <div class="doc__body"><RichText text={doc.content} tag="div" allowedTags={['h3', 'h4', 'hr']} /></div>

        <div class="ph-actions">
            {#if own}<Button variant={doc.signature_required && !doc.signed ? 'secondary' : 'primary'} onclick={() => openApp('documents', `edit/${doc.id}`)}>Edit document</Button>{/if}
            <Button variant="secondary" onclick={() => (share = { type: own ? 2 : 1, target: '', nearby: false })}>Share</Button>
            <Button variant="secondary" onclick={() => (share = { type: own ? 2 : 1, target: '', nearby: true })}>Share with people nearby</Button>
            {#if signers.length}<Button variant="secondary" onclick={() => (showSigs = true)}>See signatures</Button>{/if}
            <Button variant="danger" onclick={() => (confirmDelete = true)}>{own ? 'Delete document' : 'Remove from my phone'}</Button>
        </div>
    {:else}
        <div class="ph-pad">
            <p>This document was deleted or is no longer shared with you.</p>
            <Button variant="secondary" onclick={() => openApp('documents')}>See your documents</Button>
        </div>
    {/if}
</AppPage>

<Sheet open={Boolean(share)} title={share?.nearby ? 'Share with people nearby' : 'Share this document'} onclose={() => (share = null)}>
    {#if share}
        <form id="share-form" onsubmit={sendShare} novalidate>
            <fieldset class="opts">
                <legend class="opts__label">How to share</legend>
                <Radio bind:group={share.type} value={1} name="share-type" label="Send a copy they keep" />
                <Radio bind:group={share.type} value={2} name="share-type" label="Share it, so they see your changes" disabled={!own} />
                <Radio bind:group={share.type} value={3} name="share-type" label="Share it and ask for a signature" disabled={!own} />
            </fieldset>
            {#if !share.nearby}
                <Field label="State ID" hint="The State ID of the person you are sharing with" id="share-target" error={shareError}>
                    <TextInput id="share-target" bind:value={share.target} inputmode="numeric" maxlength="6" width="50%" block={false} invalid={Boolean(shareError)} />
                </Field>
            {/if}
        </form>
    {/if}
    {#snippet actions()}
        <Button type="submit" form="share-form">Share document</Button>
        <Button variant="secondary" onclick={() => (share = null)}>Cancel</Button>
    {/snippet}
</Sheet>

<Sheet open={showSigs} title="Signatures" onclose={() => (showSigs = false)}>
    {#if loadingSigs}
        <p class="loading"><Spinner size={18} /> Loading signatures</p>
    {:else}
        <ul class="ph-list sigs">
            {#each signers as s (s.sid)}
                <li class="sig">
                    <span class="sig__name">{plain(s.signed_name)} <span class="au-muted">(State ID {s.sid})</span></span>
                    <span class:au-muted={!s.signed}>{s.signed ? `Signed ${stamp(s.signed)}` : 'Not signed yet'}</span>
                </li>
            {/each}
        </ul>
    {/if}
    {#snippet actions()}
        <Button variant="secondary" onclick={() => (showSigs = false)}>Close</Button>
    {/snippet}
</Sheet>

<Sheet open={confirmDelete} title={own ? 'Delete this document?' : 'Remove this document?'} onclose={() => (confirmDelete = false)}>
    <p>{own ? 'It is also removed from everyone you shared it with.' : 'You will need the owner to share it again to see it.'}</p>
    {#snippet actions()}
        <Button variant="danger" onclick={remove}>{own ? 'Delete document' : 'Remove document'}</Button>
        <Button variant="secondary" onclick={() => (confirmDelete = false)}>Keep it</Button>
    {/snippet}
</Sheet>

<style>
    .doc__title {
        margin: 0;
        padding: var(--au-s4) var(--au-s4) var(--au-s3);
        font-size: var(--au-fs-md);
        overflow-wrap: anywhere;
        border-bottom: 1px solid var(--au-border);
    }
    .sign {
        padding-bottom: 0;
    }
    .doc__body {
        padding: var(--au-s4);
        overflow-wrap: anywhere;
        user-select: text;
        border-bottom: 1px solid var(--au-border);
    }
    .doc__body :global(p) {
        margin: 0 0 var(--au-s3);
    }
    .opts {
        display: flex;
        flex-direction: column;
        margin: 0 0 var(--au-s3);
        padding: 0;
        border: 0;
    }
    .opts__label {
        padding: 0;
        margin-bottom: var(--au-s1);
        font-weight: 700;
    }
    .sig {
        display: flex;
        flex-direction: column;
        padding: var(--au-s2) 0;
    }
    .sig__name {
        font-weight: 700;
    }
    .loading {
        display: flex;
        align-items: center;
        gap: var(--au-s2);
    }
</style>
