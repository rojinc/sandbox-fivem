<script>
    import { Button } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import AppPage from '../../components/common/AppPage.svelte';
    import Avatar from '../../components/common/Avatar.svelte';
    import Sheet from '../../components/common/Sheet.svelte';
    import ContactFields from './ContactFields.svelte';
    import { removeData, updateData } from '../../state/data.svelte.js';
    import { openApp, back } from '../../state/router.svelte.js';
    import { showAlert } from '../../state/notify.svelte.js';
    import { call } from '../../state/call.svelte.js';
    import { callNumber, contactList } from '../../lib/contacts.js';

    /** One contact: call or text them, edit their details, or delete them. */
    let { contact } = $props();

    let editing = $state(false);
    let confirmDelete = $state(false);
    let saving = $state(false);
    let form = $state({ name: '', number: '', avatar: '', favorite: false });
    let errors = $state({});

    function startEdit() {
        form = { name: contact.name ?? '', number: contact.number ?? '', avatar: contact.avatar ?? '', favorite: Boolean(contact.favorite) };
        errors = {};
        editing = true;
    }

    async function save(values) {
        const dupe = contactList().find((c) => c.number === values.number && c.id !== contact.id);
        if (dupe) {
            errors = { number: `${dupe.name} already has this number.` };
            return;
        }
        saving = true;
        const body = { id: contact.id, name: values.name, number: values.number, avatar: values.avatar || null, color: contact.color ?? null, favorite: values.favorite };
        try {
            const ok = await fetchNui('UpdateContact', body);
            if (ok) {
                updateData('contacts', contact.id, body);
                showAlert('Contact updated', 'success');
                editing = false;
            } else {
                showAlert('The contact could not be updated. Try again.', 'error');
            }
        } catch {
            showAlert('The contact could not be updated. Try again.', 'error');
        }
        saving = false;
    }

    async function remove() {
        confirmDelete = false;
        try {
            const ok = await fetchNui('DeleteContact', contact.id);
            if (ok) {
                const id = contact.id;
                back();
                removeData('contacts', id);
                showAlert('Contact deleted', 'success');
            } else {
                showAlert('The contact could not be deleted. Try again.', 'error');
            }
        } catch {
            showAlert('The contact could not be deleted. Try again.', 'error');
        }
    }
</script>

<AppPage title={contact.name}>
    <div class="who">
        <Avatar name={contact.name} src={contact.avatar} size={72} />
        <div class="who__text">
            <h2 class="who__name">{contact.name}</h2>
            <div class="au-mono">{contact.number}</div>
        </div>
    </div>
    <div class="ph-actions">
        <Button icon="phone" disabled={Boolean(call.current)} onclick={() => callNumber(contact.number)}>Call</Button>
        <Button variant="secondary" onclick={() => openApp('messages', `convo/${encodeURIComponent(contact.number)}`)}>Send text</Button>
    </div>
    <dl class="ph-facts">
        <div><dt>Number</dt><dd class="au-mono">{contact.number}</dd></div>
        <div><dt>Favourite</dt><dd>{contact.favorite ? 'Yes, shown at the top of your list' : 'No'}</dd></div>
    </dl>
    <div class="ph-actions">
        <Button variant="secondary" onclick={startEdit}>Edit contact</Button>
        <Button variant="danger" onclick={() => (confirmDelete = true)}>Delete contact</Button>
    </div>
</AppPage>

<Sheet open={editing} title="Edit contact" onclose={() => (editing = false)}>
    <ContactFields bind:values={form} {errors} {saving} submitLabel="Save changes" onsubmit={save} oncancel={() => (editing = false)} />
</Sheet>

<Sheet open={confirmDelete} title="Delete {contact.name}?" onclose={() => (confirmDelete = false)}>
    <p>Their number stays in your calls and messages, without the name.</p>
    {#snippet actions()}
        <Button variant="danger" onclick={remove}>Delete contact</Button>
        <Button variant="secondary" onclick={() => (confirmDelete = false)}>Keep contact</Button>
    {/snippet}
</Sheet>

<style>
    .who {
        display: flex;
        align-items: center;
        gap: var(--au-s4);
        padding: var(--au-s5) var(--au-s4) var(--au-s1);
    }
    .who__text {
        min-width: 0;
    }
    .who__name {
        margin: 0;
        font-size: var(--au-fs-md);
        overflow-wrap: anywhere;
    }
</style>
