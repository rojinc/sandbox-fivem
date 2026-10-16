<script>
    import { Button, Field, TextInput, Textarea } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import AppPage from '../../components/common/AppPage.svelte';
    import { addData, updateData } from '../../state/data.svelte.js';
    import { navigate } from '../../state/router.svelte.js';
    import { showAlert } from '../../state/notify.svelte.js';
    import { htmlToText, textToHtml } from '../../lib/text.js';

    /** Write a new document or change one of yours. */
    let { doc = null } = $props();

    let title = $state('');
    let body = $state('');
    let errors = $state({});
    let saving = $state(false);
    $effect.pre(() => {
        title = doc?.title ?? '';
        body = htmlToText(doc?.content ?? '');
    });

    async function submit(e) {
        e.preventDefault();
        const next = {};
        if (!title.trim()) next.title = 'Enter a title.';
        if (!body.trim()) next.body = 'Write the text of the document.';
        errors = next;
        if (Object.keys(next).length) return;
        saving = true;
        const payload = { title: title.trim().slice(0, 64), content: textToHtml(body.slice(0, 10000)) };
        try {
            if (doc) {
                const ok = await fetchNui('EditDocument', { id: doc.id, data: payload });
                if (ok) {
                    updateData('myDocuments', doc.id, { ...payload, time: Math.floor(Date.now() / 1000) });
                    showAlert('Document saved', 'success');
                    navigate(`/apps/documents/view/${doc.id}`, { replace: true });
                } else showAlert('The document could not be saved. Try again.', 'error');
            } else {
                const res = await fetchNui('CreateDocument', payload);
                if (res && res.id !== undefined) {
                    addData('myDocuments', res);
                    showAlert('Document created', 'success');
                    navigate(`/apps/documents/view/${res.id}`, { replace: true });
                } else showAlert('The document could not be created. Try again.', 'error');
            }
        } catch {
            showAlert('The document could not be saved. Try again.', 'error');
        }
        saving = false;
    }
</script>

<AppPage title={doc ? 'Edit document' : 'New document'}>
    <form class="ph-form" onsubmit={submit} novalidate>
        <Field label="Title" id="doc-title" error={errors.title}>
            <TextInput id="doc-title" bind:value={title} maxlength="64" invalid={Boolean(errors.title)} />
        </Field>
        <Field label="Text" hint="Leave an empty line between paragraphs" id="doc-body" error={errors.body}>
            <Textarea id="doc-body" rows={10} bind:value={body} maxlength="10000" invalid={Boolean(errors.body)} />
        </Field>
        <Button type="submit" loading={saving}>{doc ? 'Save document' : 'Create document'}</Button>
    </form>
</AppPage>
