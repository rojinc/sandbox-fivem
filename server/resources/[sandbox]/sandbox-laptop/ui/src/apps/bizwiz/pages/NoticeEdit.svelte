<script>
    import { Button, Field, TextInput, Breadcrumbs, PageAlert } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import RichEditor from '../../../components/common/RichEditor.svelte';
    import { showAlert } from '../../../state/notify.svelte.js';
    import { cleanHtml, isBlank } from '../../../lib/html.js';

    /** Post a notice to everyone on duty (CreateBusinessNotice). */
    let { onnav } = $props();

    let title = $state('');
    let body = $state('');
    let errors = $state({});
    let failure = $state(null);
    let busy = $state(false);

    async function submit() {
        const e = {};
        if (!title.trim()) e.title = 'Enter a title for the notice';
        if (isBlank(body)) e.body = 'Write the notice';
        errors = e;
        failure = null;
        if (Object.keys(e).length) return;
        busy = true;
        const res = await fetchNui('CreateBusinessNotice', { doc: { title: title.trim(), description: cleanHtml(body), time: Date.now() } });
        busy = false;
        if (res) {
            showAlert('Notice posted', 'success');
            onnav('Dashboard');
        } else failure = 'The notice was not posted. You may not have permission to post notices.';
    }
</script>

<Breadcrumbs items={[{ label: 'Notice board', onclick: () => onnav('Dashboard') }, { label: 'New notice' }]} />
<h3 class="heading">Post a notice</h3>
<p class="lead">Everyone on duty at your business sees it on their notice board.</p>
{#if failure}<PageAlert type="error" compact>{failure}</PageAlert>{/if}
<form
    class="form"
    onsubmit={(e) => {
        e.preventDefault();
        submit();
    }}
>
    <Field label="Title" hint="Up to 64 characters" id="notice-title" error={errors.title}>
        <TextInput id="notice-title" bind:value={title} maxlength="64" invalid={Boolean(errors.title)} autocomplete="off" />
    </Field>
    <RichEditor id="notice-body" label="Notice" bind:value={body} error={errors.body} />
    <div class="actions">
        <Button type="submit" loading={busy}>Post notice</Button>
        <Button variant="tertiary" onclick={() => onnav('Dashboard')}>Cancel</Button>
    </div>
</form>

<style>
    .form {
        max-width: 48em;
    }
</style>
