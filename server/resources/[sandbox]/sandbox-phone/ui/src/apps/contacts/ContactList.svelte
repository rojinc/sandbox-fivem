<script>
    import { Button, EmptyState, TextInput } from '@sandbox/ui-kit';
    import AppPage from '../../components/common/AppPage.svelte';
    import Avatar from '../../components/common/Avatar.svelte';
    import { openApp } from '../../state/router.svelte.js';
    import { contactList, sortContacts } from '../../lib/contacts.js';

    /** Every contact, favourites first, with a search over names and numbers. */
    let { app } = $props();
    let term = $state('');

    const all = $derived(sortContacts(contactList()));
    const filtered = $derived.by(() => {
        const t = term.trim().toLowerCase();
        if (!t) return all;
        const digits = t.replace(/\D/g, '');
        return all.filter((c) => String(c.name ?? '').toLowerCase().includes(t) || (digits && String(c.number ?? '').replace(/\D/g, '').includes(digits)));
    });
    const favs = $derived(filtered.filter((c) => c.favorite));
    const rest = $derived(filtered.filter((c) => !c.favorite));
</script>

{#snippet rows(list)}
    <ul class="ph-list">
        {#each list as c (c.id)}
            <li>
                <button type="button" class="ph-row" onclick={() => openApp('contacts', `view/${c.id}`)}>
                    <Avatar name={c.name} src={c.avatar} size={40} />
                    <span class="ph-row__main">
                        <span class="ph-row__title">{c.name}</span>
                        <span class="ph-row__sub au-mono">{c.number}</span>
                    </span>
                </button>
            </li>
        {/each}
    </ul>
{/snippet}

<AppPage title={app?.label ?? 'Contacts'}>
    {#snippet actions()}
        <Button size="sm" variant="secondary" onclick={() => openApp('contacts', 'add')}>New contact</Button>
    {/snippet}

    {#if all.length}
        <div class="search">
            <label class="search__label" for="contact-search">Search names or numbers</label>
            <TextInput id="contact-search" type="search" bind:value={term} />
        </div>
        {#if favs.length}
            <h2 class="ph-section">Favourites</h2>
            {@render rows(favs)}
        {/if}
        {#if rest.length}
            <h2 class="ph-section">{favs.length ? 'Everyone else' : 'All contacts'}</h2>
            {@render rows(rest)}
        {/if}
        {#if !filtered.length}
            <p class="ph-note">No contact matches "{term}". Check the spelling or search by number.</p>
        {/if}
    {:else}
        <EmptyState title="No contacts yet">
            Save the people you call and text so their names show instead of numbers.
            {#snippet actions()}
                <Button onclick={() => openApp('contacts', 'add')}>Add a contact</Button>
            {/snippet}
        </EmptyState>
    {/if}
</AppPage>

<style>
    .search {
        padding: var(--au-s3) var(--au-s4);
        border-bottom: 1px solid var(--au-border);
    }
    .search__label {
        display: block;
        margin-bottom: var(--au-s1);
        font-weight: 700;
    }
</style>
