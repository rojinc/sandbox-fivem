<script>
    import { Button, Field, TextInput, Checkbox } from '@sandbox/ui-kit';
    import { maskPhone, fullPhone } from '../../lib/format.js';

    /** Name, number, picture link and favourite, checked on submit. */
    let { values = $bindable(), errors = {}, saving = false, submitLabel = 'Save contact', onsubmit, oncancel } = $props();

    let local = $state({});
    const shown = $derived({ ...errors, ...local });

    function submit(e) {
        e.preventDefault();
        const next = {};
        const name = String(values.name ?? '').trim();
        const number = fullPhone(values.number);
        const avatar = String(values.avatar ?? '').trim();
        if (!name) next.name = 'Enter a name for this contact.';
        if (!number) next.number = 'Enter all 10 digits of the number, for example 555-010-0100.';
        if (avatar && !/^https:\/\/\S+$/i.test(avatar)) next.avatar = 'Enter a link that starts with https://, or leave it empty.';
        local = next;
        if (Object.keys(next).length) return;
        onsubmit?.({ name: name.slice(0, 64), number, avatar, favorite: Boolean(values.favorite) });
    }
</script>

<form class="cf" onsubmit={submit} novalidate>
    <Field label="Name" id="cf-name" error={shown.name}>
        <TextInput id="cf-name" bind:value={values.name} maxlength="64" autocomplete="off" invalid={Boolean(shown.name)} />
    </Field>
    <Field label="Number" id="cf-number" error={shown.number}>
        <TextInput
            id="cf-number"
            mono
            inputmode="numeric"
            value={values.number}
            oninput={(e) => {
                values.number = maskPhone(e.currentTarget.value);
                e.currentTarget.value = values.number;
            }}
            invalid={Boolean(shown.number)}
        />
    </Field>
    <Field label="Picture link (optional)" hint="A link to an image, starting with https://" id="cf-avatar" error={shown.avatar}>
        <TextInput id="cf-avatar" bind:value={values.avatar} autocomplete="off" invalid={Boolean(shown.avatar)} />
    </Field>
    <Checkbox bind:checked={values.favorite} label="Favourite (show at the top of your contacts)" />
    <div class="cf__actions">
        <Button type="submit" loading={saving}>{submitLabel}</Button>
        {#if oncancel}<Button variant="secondary" onclick={oncancel}>Cancel</Button>{/if}
    </div>
</form>

<style>
    .cf__actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--au-s3);
        margin-top: var(--au-s4);
        padding-bottom: var(--au-s3);
    }
</style>
