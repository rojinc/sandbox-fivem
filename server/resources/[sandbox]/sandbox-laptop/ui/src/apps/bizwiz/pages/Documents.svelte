<script>
    import { Button, Field, TextInput, Tag, Spinner, PageAlert } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import { env } from '../../../state/env.svelte.js';
    import { asList } from '../../../state/data.svelte.js';
    import { hasJobPerm } from '../../../lib/perms.js';
    import { ago, person } from '../../../lib/format.js';

    /** Business documents: search by title or author; pinned documents first. */
    let { onnav } = $props();

    let term = $state('');
    let searched = $state('');
    let results = $state([]);
    let loading = $state(false);
    let failed = $state(false);
    const canCreate = $derived(hasJobPerm('TABLET_CREATE_DOCUMENT'));

    async function search(value = term) {
        loading = true;
        searched = value.trim();
        const res = await fetchNui('BusinessDocumentSearch', { term: searched });
        loading = false;
        if (res === false || res === null || typeof res !== 'object') {
            failed = true;
            results = [];
            return;
        }
        failed = false;
        results = asList(res)
            .slice()
            .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || (Number(b.time) || 0) - (Number(a.time) || 0));
    }

    search('');
</script>

<div class="section-head">
    <h3 class="heading">Documents</h3>
    {#if canCreate}<Button onclick={() => onnav('Create/Document')}>New document</Button>{/if}
</div>

<form
    class="search"
    role="search"
    onsubmit={(e) => {
        e.preventDefault();
        search();
    }}
>
    <Field label="Search documents" hint="Title, author name or State ID" id="doc-search">
        <TextInput id="doc-search" bind:value={term} autocomplete="off" />
    </Field>
    <Button type="submit" variant="secondary" icon="search">Search</Button>
    {#if searched}<Button variant="tertiary" onclick={() => ((term = ''), search(''))}>Show all</Button>{/if}
</form>

{#if loading}
    <div class="loading"><Spinner /> Searching documents</div>
{:else if failed}
    <PageAlert type="error" compact>The search did not run. You may not have permission to view documents.</PageAlert>
{:else if results.length}
    <p class="au-muted count" aria-live="polite">{results.length} {results.length === 1 ? 'document' : 'documents'}{searched ? ` matching "${searched}"` : ''}, pinned first.</p>
    <table class="au-table">
        <thead>
            <tr>
                <th scope="col">Title</th>
                <th scope="col">Author</th>
                <th scope="col">Created</th>
                <th scope="col"><span class="au-hidden">Pinned</span></th>
            </tr>
        </thead>
        <tbody>
            {#each results as d (d._id)}
                <tr>
                    <td><button type="button" class="row-link" onclick={() => onnav('View/Document', { id: d._id })}>{d.title || 'Untitled document'}</button></td>
                    <td>{person(d.author)}</td>
                    <td class="nowrap">{ago(d.time, env.now)}</td>
                    <td class="cell-actions">{#if d.pinned}<Tag>Pinned</Tag>{/if}</td>
                </tr>
            {/each}
        </tbody>
    </table>
{:else if searched}
    <div class="state">
        <strong>No documents match "{searched}"</strong>
        <p>Check the spelling, or search by the author's name instead.</p>
    </div>
{:else}
    <div class="state">
        <strong>No documents yet</strong>
        <p>Documents hold your business's procedures, price lists and records.{canCreate ? ' Create the first one.' : ''}</p>
    </div>
{/if}

<style>
    .search {
        display: flex;
        align-items: flex-end;
        gap: var(--au-s2);
        max-width: 48em;
        margin-bottom: var(--au-s4);
    }
    .search :global(.au-field) {
        flex: 1;
        margin-bottom: 3px;
    }
    .count {
        margin: 0 0 var(--au-s2);
    }
    .nowrap {
        white-space: nowrap;
    }
</style>
