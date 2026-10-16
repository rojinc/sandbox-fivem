<script>
    import { onMount } from 'svelte';
    import { Button, EmptyState, Field, Tag, TextInput } from '@sandbox/ui-kit';
    import { call, errorText } from '../../lib/api.js';
    import { CHARACTERS_PER_PAGE } from '../../lib/permissions.js';
    import { ago, asList, charName, day, jobsText, plural, text } from '../../lib/format.js';
    import { nav, openPlayer } from '../../state/nav.svelte.js';
    import Loading from '../shared/Loading.svelte';
    import Problem from '../shared/Problem.svelte';
    import ViewSelect from './ViewSelect.svelte';

    /**
     * GetAllPlayersByCharacter { term, page } -> { players, pages }. Lua puts the
     * total number of matches in `pages`, 10 characters per page.
     */
    let term = $state('');
    let searched = $state('');
    let page = $state(1);
    let total = $state(0);
    let rows = $state([]);
    let status = $state('loading');
    let error = $state('');

    const pages = $derived(Math.max(1, Math.ceil(total / CHARACTERS_PER_PAGE)));

    async function search(p = 1, q = term.trim()) {
        status = 'loading';
        try {
            const res = await call('GetAllPlayersByCharacter', { term: q, page: p });
            if (res && typeof res === 'object' && res.players !== undefined) {
                rows = asList(res.players);
                total = Number(res.pages) || rows.length;
                page = p;
                searched = q;
                status = 'ready';
            } else {
                error = res === false ? 'The search failed on the server. Check the name or state ID and search again.' : 'The server sent no results. Search again.';
                status = 'error';
            }
        } catch (e) {
            error = errorText(e);
            status = 'error';
        }
    }

    onMount(() => search(1, ''));

    function submit(e) {
        e.preventDefault();
        search(1);
    }

    function dob(v) {
        return typeof v === 'number' ? day(v) : text(v);
    }
</script>

<div class="page-head">
    <div>
        <h1>Character search</h1>
        <p aria-live="polite">
            {#if status === 'ready'}
                {searched ? `${plural(total, 'character')} match "${searched}"` : `${plural(total, 'character')} on record, newest first`}
            {:else if status === 'loading'}
                Searching
            {/if}
        </p>
    </div>
</div>

<form class="filters" onsubmit={submit}>
    <ViewSelect />
    <Field label="Name or state ID" id="char-search" class="grow">
        <TextInput id="char-search" type="search" bind:value={term} autocomplete="off" />
    </Field>
    <Button type="submit" loading={status === 'loading'}>Search characters</Button>
</form>

{#if status === 'loading' && !rows.length}
    <Loading text="Searching characters" />
{:else if status === 'error'}
    <Problem title="The search did not finish" retry={() => search(page)}>{error}</Problem>
{:else if !rows.length}
    <EmptyState title="No characters match">Search by a full or partial name, or by an exact state ID.</EmptyState>
{:else}
    <div class="table-wrap">
        <table class="au-table au-table--dense au-table--hover">
            <thead>
                <tr>
                    <th scope="col">State ID</th>
                    <th scope="col">Character</th>
                    <th scope="col">Account</th>
                    <th scope="col">Born</th>
                    <th scope="col">Jobs</th>
                    <th scope="col">Last played</th>
                    <th scope="col">Status</th>
                </tr>
            </thead>
            <tbody>
                {#each rows as c (`${c.SID}-${c.User}`)}
                    {@const online = Number(c.Online) > 0 && !c.Deleted}
                    <tr
                        class:is-clickable={online}
                        class:is-selected={online && nav.player === Number(c.Online)}
                        tabindex={online ? 0 : undefined}
                        onclick={() => online && openPlayer(c.Online)}
                        onkeydown={(e) => online && e.key === 'Enter' && openPlayer(c.Online)}
                    >
                        <td class="au-mono">{text(c.SID)}</td>
                        <td>{charName(c) || 'Unnamed'}</td>
                        <td class="au-mono">{text(c.User)}</td>
                        <td class="nowrap">{dob(c.DOB)}</td>
                        <td class="dim">{jobsText(c.Jobs) || 'No job'}</td>
                        <td class="nowrap">{ago(c.LastPlayed) || 'Never'}</td>
                        <td>
                            {#if c.Deleted}<Tag tone="error">Deleted</Tag>{:else if online}<Tag tone="success">Online as ID {c.Online}</Tag>{:else}<Tag>Offline</Tag>{/if}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
    <div class="pager">
        <Button variant="secondary" size="sm" disabled={page <= 1 || status === 'loading'} onclick={() => search(page - 1, searched)}>Previous page</Button>
        <span class="au-muted">Page {page} of {pages}</span>
        <Button variant="secondary" size="sm" disabled={page >= pages || status === 'loading'} onclick={() => search(page + 1, searched)}>Next page</Button>
        <span class="note">Only characters that are online open a player record.</span>
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
    .filters :global(.au-btn) {
        margin-bottom: 3px;
    }
    .pager {
        display: flex;
        align-items: center;
        gap: var(--au-s4);
        margin-top: var(--au-s4);
    }
    .pager .note {
        margin: 0;
    }
    .nowrap {
        white-space: nowrap;
    }
</style>
