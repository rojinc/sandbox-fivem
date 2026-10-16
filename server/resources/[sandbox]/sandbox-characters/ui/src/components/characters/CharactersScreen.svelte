<script>
    import { Button, Toolbar, Tag, EmptyState, PageAlert, onKey } from '@sandbox/ui-kit';
    import { faUserPlus, faUser } from '@fortawesome/free-solid-svg-icons';
    import { app } from '../../state/app.svelte.js';
    import { characters, select, selectedCharacter, canCreate } from '../../state/characters.svelte.js';
    import { playCharacter, deleteCharacter, createCharacter } from '../../lib/flows.js';
    import Frame from '../common/Frame.svelte';
    import Notice from '../common/Notice.svelte';
    import InfoColumn from '../common/InfoColumn.svelte';
    import CharacterTable from './CharacterTable.svelte';
    import CharacterDetails from './CharacterDetails.svelte';
    import CreateDialog from './CreateDialog.svelte';
    import DeleteDialog from './DeleteDialog.svelte';

    /**
     * STATE_CHARACTERS: the roster as a table with the selected character's
     * record and actions under it; create and delete happen in dialogs.
     */
    let creating = $state(false);
    let deleting = $state(null);
    let autoOpened = false;

    const list = $derived(characters.list);
    const selected = $derived(selectedCharacter());
    const allowCreate = $derived(canCreate());
    const dialogOpen = $derived(creating || Boolean(deleting));
    const keysEnabled = $derived(!app.loading && !dialogOpen);
    const hasInfo = $derived(Boolean(characters.motd || characters.changelog));
    const limitText = $derived(characters.limit >= 100 ? 'unlimited' : String(characters.limit));
    const subline = $derived(characters.limit >= 100 ? `SandboxRP · ${list.length} characters` : `SandboxRP · ${list.length} of ${characters.limit} character slots used`);

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

    onKey(['ArrowDown', 'ArrowRight'], () => (keysEnabled ? moveSelection(1) : false));
    onKey(['ArrowUp', 'ArrowLeft'], () => (keysEnabled ? moveSelection(-1) : false));
    onKey('Enter', (e) => {
        if (!keysEnabled || e.repeat) return false;
        if (selected) playCharacter(selected);
        else moveSelection(1);
    });
    onKey(['Delete', 'Backspace'], () => (keysEnabled && selected ? (deleting = selected) : false));
    onKey(['n', 'N'], () => (keysEnabled && allowCreate ? (creating = true) : false));
    onKey('Escape', () => (keysEnabled && selected ? select(null) : false));

    const hints = $derived([
        { keys: ['↑', '↓'], label: 'Select' },
        { keys: ['Enter'], label: 'Play' },
        ...(allowCreate ? [{ keys: ['N'], label: 'New character' }] : []),
        { keys: ['Del'], label: 'Delete' },
        { keys: ['Esc'], label: 'Clear selection' },
    ]);
</script>

{#snippet info()}
    <InfoColumn />
{/snippet}

<Frame title="Choose your character" {subline} {hints} side={hasInfo ? info : undefined}>
    <Notice />

    <Toolbar>
        <p class="lead">Select a character and press Play to enter Los Santos.</p>
        {#snippet right()}
            <Tag tone={allowCreate ? 'default' : 'warning'}>{list.length} of {limitText} slots used</Tag>
            <Button icon={faUserPlus} disabled={!allowCreate || app.loading} onclick={() => (creating = true)}>New character</Button>
        {/snippet}
    </Toolbar>

    {#if list.length}
        <CharacterTable rows={list} selected={characters.selected} disabled={app.loading} onselect={(c) => select(c.ID)} onplay={playCharacter} />
        {#if selected}
            <CharacterDetails character={selected} disabled={app.loading} onplay={() => playCharacter(selected)} ondelete={() => (deleting = selected)} />
        {:else}
            <p class="au-muted pick">Select a character to see their record and play.</p>
        {/if}
        {#if !allowCreate}
            <PageAlert type="warning" compact class="limit">All {characters.limit} character slots are in use. Delete a character to free a slot.</PageAlert>
        {/if}
    {:else}
        <EmptyState icon={faUser} title="You have no characters yet">
            Create your first character to enter Los Santos.
            {#snippet actions()}
                <Button icon={faUserPlus} disabled={!allowCreate} onclick={() => (creating = true)}>Create a character</Button>
            {/snippet}
        </EmptyState>
    {/if}
</Frame>

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
    .lead {
        margin: 0;
        max-width: none;
    }
    .pick {
        margin: 16px 0 0;
    }
    :global(.au-alert.limit) {
        margin-top: 24px;
    }
</style>
