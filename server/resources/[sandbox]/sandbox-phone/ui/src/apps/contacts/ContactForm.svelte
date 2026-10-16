<script>
    import { Button } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import AppPage from '../../components/common/AppPage.svelte';
    import ContactFields from './ContactFields.svelte';
    import { addData } from '../../state/data.svelte.js';
    import { navigate, openApp } from '../../state/router.svelte.js';
    import { showAlert } from '../../state/notify.svelte.js';
    import { call } from '../../state/call.svelte.js';
    import { callNumber, contactList } from '../../lib/contacts.js';
    import { fullPhone, maskPhone } from '../../lib/format.js';

    /**
     * New contact. Opened from an unknown number (caller), it offers a call or
     * a text first and has the number filled in.
     */
    let { number = '', caller = false, missing = false } = $props();

    let values = $state({ name: '', number: '', avatar: '', favorite: false });
    let errors = $state({});
    let saving = $state(false);

    $effect.pre(() => {
        values.number = maskPhone(number);
    });

    const known = $derived(fullPhone(number));

    async function save(v) {
        const dupe = contactList().find((c) => c.number === v.number);
        if (dupe) {
            errors = { number: `${dupe.name} already has this number.` };
            return;
        }
        errors = {};
        saving = true;
        const body = { name: v.name, number: v.number, avatar: v.avatar || null, favorite: v.favorite };
        try {
            const id = await fetchNui('CreateContact', body);
            if (id) {
                addData('contacts', { ...body, id });
                showAlert('Contact saved', 'success');
                navigate(`/apps/contacts/view/${id}`, { replace: true });
            } else {
                showAlert('The contact could not be saved. Try again.', 'error');
            }
        } catch {
            showAlert('The contact could not be saved. Try again.', 'error');
        }
        saving = false;
    }
</script>

<AppPage title={caller && known ? known : 'New contact'}>
    {#if missing}
        <p class="ph-note">That contact no longer exists. You can add it again below.</p>
    {/if}
    {#if caller && known}
        <div class="ph-actions">
            <Button variant="secondary" icon="phone" disabled={Boolean(call.current)} onclick={() => callNumber(known)}>Call</Button>
            <Button variant="secondary" onclick={() => openApp('messages', `convo/${encodeURIComponent(known)}`)}>Send text</Button>
        </div>
        <h2 class="ph-section">Save as a contact</h2>
    {/if}
    <div class="ph-form">
        <ContactFields bind:values {errors} {saving} submitLabel="Save contact" onsubmit={save} />
    </div>
</AppPage>
