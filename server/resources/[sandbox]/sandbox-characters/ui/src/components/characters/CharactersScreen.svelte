<script>
    import { Button, PageAlert, onKey } from '@sandbox/ui-kit';
    import { app } from '../../state/app.svelte.js';
    import { characters, select, selectedCharacter, canCreate } from '../../state/characters.svelte.js';
    import { playCharacter, deleteCharacter, createCharacter } from '../../lib/flows.js';
    import Dock from '../common/Dock.svelte';
    import Notice from '../common/Notice.svelte';
    import InfoColumn from '../common/InfoColumn.svelte';
    import CharacterTable from './CharacterTable.svelte';
    import CharacterDetails from './CharacterDetails.svelte';
    import CreateDialog from './CreateDialog.svelte';
    import DeleteDialog from './DeleteDialog.svelte';

    /**
     * STATE_CHARACTERS: the roster as a table in the docked panel, news below
     * it, and the selected character's record with Play / Delete pinned at
     * the foot. Create and delete happen in modals.
     */
    let creating = $state(false);
    let deleting = $state(null);
    let autoOpened = false;

    const list = $derived(characters.list);
    const selected = $derived(selectedCharacter());
    const allowCreate = $derived(canCreate());
    const unlimited = $derived(characters.limit >= 100);
    const dialogOpen = $derived(creating || Boolean(deleting));
    const keysEnabled = $derived(!app.loading && !dialogOpen);
    const slots = $derived(unlimited ? `${list.length} ${list.length === 1 ? 'character' : 'characters'}` : `${list.length} of ${characters.limit} slots used`);

    // A player with no characters lands straight in the creation form.
    $effect(() => {
        if (list.length === 0 && allowCreate && !app.loading && !autoOpened) {
            autoOpened = true;
            creating = true;
        }
        if (list.length > 0) autoOpened = false;
    });

    function moveSelection(delta) {
        if (!list.length) return;
        const i = list.findIndex((c) => c.ID === characters.selected);
        const next = i < 0 ? (delta > 0 ? 0 : list.length - 1) : (i + delta + list.length) % list.length;
        select(list[next].ID);
    }

    onKey('ArrowDown', () => (keysEnabled ? moveSelection(1) : false));
    onKey('ArrowUp', () => (keysEnabled ? moveSelection(-1) : false));
    onKey('Enter', (e) => {
        if (!keysEnabled || e.repeat || !selected) return false;
        playCharacter(selected);
    });
</script>

{#snippet foot()}
    {#if selected}
        <CharacterDetails character={selected} disabled={app.loading} onplay={() => playCharacter(selected)} ondelete={() => (deleting = selected)} />
    {:else}
        <p class="pick au-muted">Select a character in the table to play.</p>
    {/if}
{/snippet}

<Dock title="Choose a character" subline="Connected to {characters.serverName}" footer={list.length ? foot : undefined}>
    <div class="cs-section-head">
        <h2>Your characters</h2>
        <span class="cs-meta">{slots}</span>
        {#if allowCreate && list.length}
            <div class="cs-push">
                <Button variant="secondary" size="sm" disabled={app.loading} onclick={() => (creating = true)}>Create character</Button>
            </div>
        {/if}
    </div>

    <Notice />

    {#if list.length}
        <CharacterTable rows={list} selected={characters.selected} disabled={app.loading} onselect={(c) => select(c.ID)} onplay={playCharacter} />
        {#if !allowCreate}
            <PageAlert type="neutral" compact class="limit">All {characters.limit} character slots are in use. Delete a character to make room for a new one.</PageAlert>
        {/if}
    {:else}
        <div class="empty">
            <p>Your characters appear here. You have none yet, so create one to start playing.</p>
            <Button disabled={!allowCreate || app.loading} onclick={() => (creating = true)}>Create character</Button>
        </div>
    {/if}

    <InfoColumn />
</Dock>

{#if creating}
    <CreateDialog
        slot={list.length + 1}
        limit={characters.limit}
        oncancel={() => (creating = false)}
        onsubmit={(body) => {
            creating = false;
            createCharacter(body);
        }}
    />
{/if}

{#if deleting}
    <DeleteDialog
        character={deleting}
        oncancel={() => (deleting = null)}
        onconfirm={(c) => {
            deleting = null;
            deleteCharacter(c);
        }}
    />
{/if}

<style>
    .pick {
        margin: 0;
        max-width: none;
    }
    .empty {
        padding: 20px 0 4px;
    }
    .empty p {
        margin: 0 0 16px;
        max-width: none;
        color: var(--au-muted);
    }
    :global(.au-alert.limit) {
        margin: 16px 0 0;
    }
</style>
