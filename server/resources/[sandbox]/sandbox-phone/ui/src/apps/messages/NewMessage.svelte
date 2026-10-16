<script>
    import { Button, Field, TextInput } from '@sandbox/ui-kit';
    import AppPage from '../../components/common/AppPage.svelte';
    import Avatar from '../../components/common/Avatar.svelte';
    import { navigate } from '../../state/router.svelte.js';
    import { contactList, sortContacts } from '../../lib/contacts.js';
    import { fullPhone } from '../../lib/format.js';

    /** Start a text: type a number, or pick a contact by name. */
    let to = $state('');
    let error = $state('');

    const matches = $derived.by(() => {
        const t = to.trim().toLowerCase();
        const all = sortContacts(contactList());
        if (!t) return all;
        const digits = t.replace(/\D/g, '');
        return all.filter((c) => String(c.name ?? '').toLowerCase().includes(t) || (digits && String(c.number ?? '').replace(/\D/g, '').includes(digits)));
    });

    function go(number) {
        navigate(`/apps/messages/convo/${encodeURIComponent(number)}`, { replace: true });
    }
    function submit(e) {
        e.preventDefault();
        const n = fullPhone(to);
        if (n) go(n);
        else if (matches.length === 1) go(matches[0].number);
        else error = 'Enter all 10 digits of a number, or pick a contact from the list.';
    }
</script>

<AppPage title="New message">
    <form class="ph-form" onsubmit={submit} novalidate>
        <Field label="To" hint="A phone number or a contact's name" id="nm-to" error={error}>
            <TextInput id="nm-to" bind:value={to} autocomplete="off" invalid={Boolean(error)} oninput={() => (error = '')} />
        </Field>
        <Button type="submit">Write message</Button>
    </form>
    {#if matches.length}
        <h2 class="ph-section">{to.trim() ? 'Matching contacts' : 'Contacts'}</h2>
        <ul class="ph-list">
            {#each matches as c (c.id)}
                <li>
                    <button type="button" class="ph-row" onclick={() => go(c.number)}>
                        <Avatar name={c.name} src={c.avatar} size={36} />
                        <span class="ph-row__main">
                            <span class="ph-row__title">{c.name}</span>
                            <span class="ph-row__sub au-mono">{c.number}</span>
                        </span>
                    </button>
                </li>
            {/each}
        </ul>
    {:else if to.trim()}
        <p class="ph-note">No contact matches. Type the full number to text it.</p>
    {/if}
</AppPage>
