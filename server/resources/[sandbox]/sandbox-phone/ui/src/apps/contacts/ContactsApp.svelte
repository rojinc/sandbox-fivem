<script>
    import ContactList from './ContactList.svelte';
    import ContactView from './ContactView.svelte';
    import ContactForm from './ContactForm.svelte';
    import { contactList } from '../../lib/contacts.js';

    /**
     * Contacts: the list (root), one contact (view/:id), a new contact
     * (add/:number?) and an unknown number (caller/:number).
     */
    let { app, segs = [] } = $props();

    const viewed = $derived(segs[0] === 'view' ? (contactList().find((c) => String(c.id) === String(segs[1])) ?? null) : null);
</script>

{#if segs[0] === 'view' && viewed}
    {#key viewed.id}<ContactView contact={viewed} />{/key}
{:else if segs[0] === 'view'}
    <ContactForm number="" missing />
{:else if segs[0] === 'add' || segs[0] === 'caller'}
    <ContactForm number={segs[1] ?? ''} caller={segs[0] === 'caller'} />
{:else}
    <ContactList {app} />
{/if}
