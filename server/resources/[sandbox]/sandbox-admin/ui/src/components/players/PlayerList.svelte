<script>
    import { Button, Checkbox, EmptyState, Field, Tag, TextInput } from '@sandbox/ui-kit';
    import { call, errorText } from '../../lib/api.js';
    import { asList, charName, plural, text, when } from '../../lib/format.js';
    import { nav, openPlayer } from '../../state/nav.svelte.js';
    import Loading from '../shared/Loading.svelte';
    import Problem from '../shared/Problem.svelte';
    import ViewSelect from './ViewSelect.svelte';

    /** view: online | disconnected. GetPlayerList { disconnected } answers an array, or false for non-staff. */
    let { view = 'online' } = $props();

    const disconnected = $derived(view === 'disconnected');
    let rows = $state([]);
    let status = $state('loading');
    let error = $state('');
    let term = $state('');
    let withCharacter = $state(true);

    async function load() {
        status = 'loading';
        try {
            const res = await call('GetPlayerList', { disconnected });
            if (res === false) {
                error = 'The server did not accept your staff permission. Close the console and open it again.';
                status = 'error';
                return;
            }
            rows = asList(res);
            status = 'ready';
        } catch (e) {
            error = errorText(e);
            status = 'error';
        }
    }

    // First load, and again after a kick or ban changes who is online.
    $effect(() => {
        void nav.reload;
        load();
    });

    function matches(p, q) {
        if (!q) return true;
        const n = Number.parseInt(q, 10);
        const name = charName(p.Character).toLowerCase();
        return (
            String(p.Name ?? '').toLowerCase().includes(q) ||
            (name && name.includes(q)) ||
            (Number.isFinite(n) && [p.Source, p.AccountID, p.Character?.SID].some((v) => Number(v) === n))
        );
    }

    const shown = $derived.by(() => {
        const q = term.trim().toLowerCase();
        const list = rows.filter((p) => matches(p, q) && (disconnected || !withCharacter || Boolean(p.Character)));
        return disconnected
            ? list.sort((a, b) => (Number(b.DisconnectedTime) || 0) - (Number(a.DisconnectedTime) || 0))
            : list.sort((a, b) => (Number(a.Source) || 0) - (Number(b.Source) || 0));
    });
    // Groups and ping arrive from newer servers only; hide the columns when no row has them.
    const hasGroups = $derived(rows.some((p) => Array.isArray(p.Groups) || (p.Groups && typeof p.Groups === 'object')));
    const hasPing = $derived(!disconnected && rows.some((p) => typeof p.Ping === 'number'));
    const filtered = $derived(term.trim() !== '' || (!disconnected && withCharacter));

    function open(p) {
        openPlayer(p.Source);
    }
</script>

<div class="page-head">
    <div>
        <h1>{disconnected ? 'Players who left recently' : 'Players online now'}</h1>
        <p aria-live="polite">
            {#if status === 'ready'}
                {filtered ? `Showing ${shown.length} of ${plural(rows.length, 'player')}` : plural(rows.length, 'player')}{disconnected ? '. The server keeps the last 60.' : ''}
            {:else if status === 'loading'}
                Loading the list
            {/if}
        </p>
    </div>
    <Button variant="secondary" onclick={load} loading={status === 'loading'}>Refresh list</Button>
</div>

<div class="filters">
    <ViewSelect />
    <Field label="Search" id="players-search" class="grow">
        <TextInput id="players-search" type="search" bind:value={term} placeholder="Name, server ID, account or state ID" autocomplete="off" />
    </Field>
    {#if !disconnected}
        <div class="check"><Checkbox bind:checked={withCharacter} label="Only players with a character" /></div>
    {/if}
</div>

{#if status === 'loading'}
    <Loading text="Loading players" />
{:else if status === 'error'}
    <Problem title="The player list did not load" retry={load}>{error}</Problem>
{:else if !rows.length}
    <EmptyState title={disconnected ? 'Nobody has left since the server started' : 'Nobody is online'}>
        {disconnected ? 'Players who disconnect appear here with the reason they dropped.' : 'Players appear here as soon as they connect.'}
        {#snippet actions()}
            <Button variant="secondary" onclick={load}>Refresh list</Button>
        {/snippet}
    </EmptyState>
{:else if !shown.length}
    <EmptyState title="No players match">
        Check the spelling, search by server ID or state ID{!disconnected && withCharacter ? ', or include players who have not picked a character' : ''}.
        {#snippet actions()}
            <Button
                variant="secondary"
                onclick={() => {
                    term = '';
                    withCharacter = false;
                }}>Clear filters</Button
            >
        {/snippet}
    </EmptyState>
{:else}
    <div class="table-wrap">
        <table class="au-table au-table--dense au-table--hover">
            <thead>
                <tr>
                    <th scope="col">{disconnected ? 'Last ID' : 'ID'}</th>
                    <th scope="col">Name</th>
                    <th scope="col">Character</th>
                    <th scope="col">State ID</th>
                    <th scope="col">Account</th>
                    {#if disconnected}
                        <th scope="col">Left</th>
                        <th scope="col">Reason</th>
                    {:else}
                        {#if hasGroups}<th scope="col">Groups</th>{/if}
                        {#if hasPing}<th scope="col" class="num">Ping</th>{/if}
                    {/if}
                </tr>
            </thead>
            <tbody>
                {#each shown as p (disconnected ? `${p.Source}-${p.DisconnectedTime}` : p.Source)}
                    <tr
                        class="is-clickable"
                        class:is-selected={nav.player === Number(p.Source)}
                        aria-selected={nav.player === Number(p.Source)}
                        tabindex="0"
                        onclick={() => open(p)}
                        onkeydown={(e) => e.key === 'Enter' && open(p)}
                    >
                        <td class="au-mono">{text(p.Source)}</td>
                        <td>{text(p.Name, 'Unknown')}</td>
                        <td>{#if charName(p.Character)}{charName(p.Character)}{:else}<span class="dim">No character</span>{/if}</td>
                        <td class="au-mono">{text(p.Character?.SID)}</td>
                        <td class="au-mono">{text(p.AccountID)}</td>
                        {#if disconnected}
                            <td class="nowrap">{when(p.DisconnectedTime)}</td>
                            <td class="reason dim au-truncate" title={text(p.Reason)}>{text(p.Reason, 'No reason recorded')}</td>
                        {:else}
                            {#if hasGroups}
                                <td><span class="tags">{#each asList(p.Groups) as g (String(g))}<Tag>{String(g)}</Tag>{/each}</span></td>
                            {/if}
                            {#if hasPing}<td class="num au-mono">{typeof p.Ping === 'number' ? `${p.Ping} ms` : ''}</td>{/if}
                        {/if}
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
{/if}

<style>
    .filters {
        display: flex;
        align-items: flex-end;
        gap: var(--au-s4);
        margin-bottom: var(--au-s5);
    }
    .filters :global(.au-field) {
        margin: 0;
        min-width: 260px;
    }
    .filters :global(.grow) {
        flex: 1;
    }
    .check {
        padding-bottom: 4px;
    }
    .nowrap {
        white-space: nowrap;
    }
</style>
