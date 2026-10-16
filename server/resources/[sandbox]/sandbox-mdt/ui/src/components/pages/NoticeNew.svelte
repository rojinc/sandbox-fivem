<script>
    import { Button, Field, PageAlert, Select, TextInput, Textarea } from '@sandbox/ui-kit';
    import { app, go, back } from '../../state/app.svelte.js';
    import { store } from '../../state/data.svelte.js';
    import { toast } from '../../state/toasts.svelte.js';
    import { call } from '../../lib/api.js';
    import { textToHtml } from '../../lib/notes.js';

    const audiences = [
        { value: 'public', label: 'Everyone, including the public' },
        { value: 'government', label: 'Every government department' },
        ...(app.job?.Id && app.job.Id !== 'government' ? [{ value: app.job.Id, label: `${app.job.Name ?? app.job.Id} only` }] : []),
    ];
    let form = $state({ title: '', restricted: audiences.at(-1).value, text: '' });
    let errors = $state({});
    let busy = $state(false);

    async function submit(e) {
        e.preventDefault();
        errors = {};
        if (!form.title.trim()) errors.title = 'Enter a title for the notice';
        if (!form.text.trim()) errors.text = 'Write the notice';
        if (Object.keys(errors).length) return;
        busy = true;
        const res = await call('Create', { type: 'notice', doc: { title: form.title.trim(), description: textToHtml(form.text), restricted: form.restricted } });
        busy = false;
        if (res) {
            store.homeLastFetch = 0;
            toast.success('Notice posted');
            go('dashboard', {}, { replace: true });
        } else errors = { form: 'The notice was not posted. Only command staff can post notices.' };
    }
</script>

<div class="mdt-back"><Button variant="tertiary" size="sm" icon="arrow-left" onclick={() => back('dashboard')}>Back to the dashboard</Button></div>
<div class="mdt-page-head"><div><h1>Post a notice</h1><p>Notices show on the dashboard until someone removes them.</p></div></div>

<form class="form" onsubmit={submit} novalidate>
    {#if errors.form}<div class="block"><PageAlert type="error">{errors.form}</PageAlert></div>{/if}
    <Field label="Title" id="n-title" error={errors.title}><TextInput id="n-title" bind:value={form.title} /></Field>
    <Field label="Who can read it" id="n-aud"><Select id="n-aud" bind:value={form.restricted} options={audiences} /></Field>
    <Field label="Notice" hint="Leave a blank line between paragraphs." id="n-text" error={errors.text}><Textarea id="n-text" rows={8} bind:value={form.text} /></Field>
    <div class="actions">
        <Button type="submit" loading={busy}>Post notice</Button>
        <Button variant="secondary" onclick={() => back('dashboard')}>Cancel</Button>
    </div>
</form>

<style>
    .form {
        max-width: 720px;
    }
    .actions {
        display: flex;
        gap: var(--au-s3);
    }
    .block {
        margin-bottom: var(--au-s4);
    }
</style>
