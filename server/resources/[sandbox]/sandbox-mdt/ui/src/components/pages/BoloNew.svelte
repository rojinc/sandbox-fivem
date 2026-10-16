<script>
    import { Button, Field, PageAlert, Radio, TextInput, Textarea } from '@sandbox/ui-kit';
    import { go, back } from '../../state/app.svelte.js';
    import { toast } from '../../state/toasts.svelte.js';
    import { call } from '../../lib/api.js';
    import { BOLOTypes } from '../../lib/data.js';

    let form = $state({ type: 'car', title: '', summary: '', description: '' });
    let errors = $state({});
    let busy = $state(false);

    async function submit(e) {
        e.preventDefault();
        errors = {};
        if (!form.title.trim()) errors.title = 'Enter a title, for example the vehicle and plate';
        if (!form.summary.trim()) errors.summary = 'Enter a one-line summary';
        if (Object.keys(errors).length) return;
        busy = true;
        const res = await call('Create', { type: 'BOLO', doc: { type: form.type, title: form.title.trim(), summary: form.summary.trim(), description: form.description.trim(), time: Date.now() } });
        busy = false;
        if (res) {
            toast.success('BOLO issued to every officer on duty');
            go('bolos');
        } else errors = { form: 'The BOLO was not issued. Only police can issue BOLOs.' };
    }
</script>

<div class="mdt-back"><Button variant="tertiary" size="sm" icon="arrow-left" onclick={() => back('bolos')}>Back</Button></div>
<div class="mdt-page-head"><div><h1>Issue a BOLO</h1><p>Every officer on duty sees it on their dashboard.</p></div></div>

<form class="form" onsubmit={submit} novalidate>
    {#if errors.form}<div class="block"><PageAlert type="error">{errors.form}</PageAlert></div>{/if}
    <fieldset>
        <legend>Looking for</legend>
        <div class="radios">
            {#each BOLOTypes as t (t.value)}<Radio bind:group={form.type} value={t.value} label={t.label} name="bolo-type" />{/each}
        </div>
    </fieldset>
    <Field label="Title" id="b-title" error={errors.title}><TextInput id="b-title" bind:value={form.title} /></Field>
    <Field label="Summary" hint="One line officers read on the dashboard." id="b-summary" error={errors.summary}><TextInput id="b-summary" bind:value={form.summary} /></Field>
    <Field label="Description (optional)" hint="Clothing, damage, direction of travel." id="b-desc"><Textarea id="b-desc" rows={5} bind:value={form.description} /></Field>
    <div class="actions">
        <Button type="submit" loading={busy}>Issue BOLO</Button>
        <Button variant="secondary" onclick={() => back('bolos')}>Cancel</Button>
    </div>
</form>

<style>
    .form {
        max-width: 720px;
    }
    fieldset {
        border: 0;
        padding: 0;
        margin: 0 0 var(--au-s4);
    }
    legend {
        font-weight: 700;
        margin-bottom: var(--au-s1);
    }
    .radios {
        display: flex;
        gap: var(--au-s6);
    }
    .actions {
        display: flex;
        gap: var(--au-s3);
    }
    .block {
        margin-bottom: var(--au-s4);
    }
</style>
