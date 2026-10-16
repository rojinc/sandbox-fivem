<script>
    import { Button, EmptyState, PageAlert, onKey } from '@sandbox/ui-kit';
    import { app } from '../../state/app.svelte.js';
    import { characters, select, selectedCharacter, canCreate } from '../../state/characters.svelte.js';
    import { playCharacter, deleteCharacter, createCharacter } from '../../lib/flows.js';
    import Page from '../common/Page.svelte';
    import Notice from '../common/Notice.svelte';
    import InfoColumn from '../common/InfoColumn.svelte';
    import CharacterTable from './CharacterTable.svelte';
    import CharacterDetails from './CharacterDetails.svelte';
    import CreateDialog from './CreateDialog.svelte';
    import DeleteDialog from './DeleteDialog.svelte';

    /**
     * STATE_CHARACTERS: the roster as a table, the selected character's
     * record and actions under it, news on the right. Create and delete
     * happen in dialogs.
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

{#snippet info()}
    <InfoColumn />
{/snippet}

<Page title="Choose a character" subline="Connected to {characters.serverName}" side={info}>
    <div class="cs-section-head">
        <h2>Your characters</h2>
        <span class="cs-meta">{slots}</span>
        <div class="cs-push">
            <Button variant="secondary" icon="user-plus" disabled={!allowCreate || app.loading} onclick={() => (creating = true)}>New character</Button>
        </div>
    </div>

    <Notice />

    {#if list.length}
        <div class="roster">
            <CharacterTable rows={list} selected={characters.selected} disabled={app.loading} onselect={(c) => select(c.ID)} onplay={playCharacter} />
        </div>
        {#if selected}
            <CharacterDetails character={selected} disabled={app.loading} onplay={() => playCharacter(selected)} ondelete={() => (deleting = selected)} />
        {:else}
            <p class="pick au-muted">Select a character to play.</p>
        {/if}
        {#if !allowCreate}
            <PageAlert type="neutral" compact class="limit">All {characters.limit} character slots are in use. Delete a character to make room for a new one.</PageAlert>
        {/if}
    {:else}
        <div class="empty">
            <EmptyState icon="users" title="You have no characters yet">
                Create your first character to start playing.
                {#snippet actions()}
                    <Button icon="user-plus" disabled={!allowCreate || app.loading} onclick={() => (creating = true)}>Create a character</Button>
                {/snippet}
            </EmptyState>
        </div>
    {/if}
</Page>

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
    .roster {
        flex: 0 1 auto;
        min-height: 0;
        overflow: auto;
        border: 1px solid var(--au-border);
        border-radius: var(--au-radius-lg);
    }
    .roster :global(.au-table) {
        margin: 0;
    }
    .roster :global(.au-table tbody tr:last-child td) {
        border-bottom: 0;
    }
    .roster :global(.au-table thead th) {
        position: sticky;
        top: 0;
        background: var(--au-bg);
        z-index: 1;
    }
    .pick {
        margin: 24px 0 0;
    }
    .empty {
        border: 1px dashed var(--au-border-strong);
        border-radius: var(--au-radius-lg);
        padding: 32px 0;
    }
    :global(.au-alert.limit) {
        margin: 16px 0 0;
    }
</style>
