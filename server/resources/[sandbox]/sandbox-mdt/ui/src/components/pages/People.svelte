<script>
    import { Tag } from '@sandbox/ui-kit';
    import { go } from '../../state/app.svelte.js';
    import { search } from '../../state/search.svelte.js';
    import { call, list } from '../../lib/api.js';
    import { formatDay } from '../../lib/format.js';
    import SearchBar from '../common/SearchBar.svelte';
    import State from '../common/State.svelte';

    let { params = {} } = $props();
    const s = search.people;

    async function run(term) {
        s.term = term;
        if (!term) {
            s.status = 'idle';
            s.results = [];
            return;
        }
        s.status = 'loading';
        s.searched = term;
        const res = await call('Search', { type: 'people', term });
        if (res === null || res === false) {
            s.status = 'error';
            return;
        }
        s.results = list(res);
        s.status = 'ready';
    }

    $effect.pre(() => {
        if (params.term && params.term !== s.searched) run(params.term);
    });

    const open = (p) => go('person', { id: p.SID });
</script>

<div class="mdt-page-head">
    <div>
        <h1>People</h1>
        <p>Find a person by name or state ID, then open their record.</p>
    </div>
</div>

<SearchBar bind:value={s.term} label="Name or state ID" placeholder="For example Jordan Reyes or 1042" button="Search people" busy={s.status === 'loading'} onsearch={run} />

{#if s.status === 'loading' && !s.results.length}
    <State status="loading" title="Searching people" />
{:else if s.status === 'error'}
    <State status="error" onretry={() => run(s.searched)} />
{:else if s.status === 'idle'}
    <State title="No search yet">Search by first name, last name or state ID. Results show up to 12 people.</State>
{:else if !s.results.length}
    <State title={`No people match "${s.searched}"`}>Check the spelling, or search by state ID instead.</State>
{:else}
    <p class="au-muted count" aria-live="polite">{s.results.length === 1 ? '1 person' : `${s.results.length} people`} found for "{s.searched}"</p>
    <table class="au-table au-table--hover au-table--dense mdt-table">
        <thead>
            <tr>
                <th scope="col">State ID</th>
                <th scope="col">Name</th>
                <th scope="col">Date of birth</th>
                <th scope="col">Sex</th>
                <th scope="col">Phone</th>
                <th scope="col">Flags</th>
            </tr>
        </thead>
        <tbody>
            {#each s.results as p (p.SID)}
                <tr class="is-clickable" tabindex="0" onclick={() => open(p)} onkeydown={(e) => e.key === 'Enter' && open(p)}>
                    <td class="au-mono">{p.SID}</td>
                    <td><strong>{p.First} {p.Last}</strong></td>
                    <td>{formatDay(p.DOB)}</td>
                    <td>{p.Gender ? 'Female' : 'Male'}</td>
                    <td>{#if p.Phone}<span class="au-mono">{p.Phone}</span>{:else}<span class="au-muted">None</span>{/if}</td>
                    <td>
                        <span class="mdt-tags">
                            {#if p.Flags?.Violent}<Tag tone="error">Violent</Tag>{/if}
                            {#if p.Licenses?.Drivers?.Suspended}<Tag tone="warning">Licence suspended</Tag>{/if}
                            {#if p.Attorney}<Tag tone="info">Attorney</Tag>{/if}
                            {#if !p.Flags?.Violent && !p.Licenses?.Drivers?.Suspended && !p.Attorney}<span class="au-muted">None</span>{/if}
                        </span>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
{/if}

<style>
    .count {
        margin: 0 0 var(--au-s2);
    }
</style>
