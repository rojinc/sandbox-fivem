<script>
    import { onMount } from 'svelte';
    import { Select, Tag, uid } from '@sandbox/ui-kit';
    import { go } from '../../state/app.svelte.js';
    import { search } from '../../state/search.svelte.js';
    import { call, paged } from '../../lib/api.js';
    import { WarrantStates, warrantState } from '../../lib/data.js';
    import { formatDay, relative } from '../../lib/format.js';
    import SearchBar from '../common/SearchBar.svelte';
    import State from '../common/State.svelte';
    import Pager from '../common/Pager.svelte';

    let { params = {} } = $props();
    const s = search.warrants;
    const PER_PAGE = 15;
    const fid = uid('wstate');
    let show = $state('');

    async function run(term, page = 1) {
        s.term = term;
        s.status = 'loading';
        s.searched = term;
        const res = paged(await call('Search', { type: 'warrant', term, page, perPage: PER_PAGE }), page);
        if (!res) {
            s.status = 'error';
            return;
        }
        s.results = res.data;
        s.page = page;
        s.pages = res.pages;
        s.status = 'ready';
    }

    onMount(() => run(params.term ?? s.searched ?? '', s.page || 1));

    const shown = $derived(s.results.filter((w) => !show || w.state === show));
    const open = (w) => go('warrant', { id: w.id });
</script>

<div class="mdt-page-head">
    <div>
        <h1>Warrants</h1>
        <p>Warrants are issued from incident reports and expire after 7 days.</p>
    </div>
</div>

<SearchBar bind:value={s.term} label="Warrant number or name" placeholder="Leave empty to list every warrant" button="Search warrants" width="360px" busy={s.status === 'loading'} onsearch={(t) => run(t)}>
    <div class="filter">
        <label for={fid}>Show</label>
        <Select id={fid} bind:value={show} options={[{ value: '', label: 'Every state' }, ...WarrantStates.map((w) => ({ value: w.value, label: w.label }))]} />
    </div>
</SearchBar>

{#if s.status === 'loading' && !s.results.length}
    <State status="loading" title="Loading warrants" />
{:else if s.status === 'error'}
    <State status="error" onretry={() => run(s.searched, s.page)} />
{:else if !shown.length}
    <State title={s.searched ? `No warrants match "${s.searched}"` : show ? `No ${warrantState(show).label.toLowerCase()} warrants on this page` : 'No warrants issued'}>
        Warrants appear here when an officer issues one from an incident report.
    </State>
{:else}
    <p class="au-muted count" aria-live="polite">Showing {shown.length} of {s.results.length} warrants on page {s.page}</p>
    <table class="au-table au-table--hover au-table--dense mdt-table">
        <thead>
            <tr>
                <th scope="col">Number</th>
                <th scope="col">Warrant</th>
                <th scope="col">State</th>
                <th scope="col">Issued by</th>
                <th scope="col">Expires</th>
            </tr>
        </thead>
        <tbody>
            {#each shown as w (w.id)}
                <tr class="is-clickable" tabindex="0" onclick={() => open(w)} onkeydown={(e) => e.key === 'Enter' && open(w)}>
                    <td class="au-mono">{w.id}</td>
                    <td><strong>{w.title}</strong></td>
                    <td><Tag tone={warrantState(w.state).tone}>{warrantState(w.state).label}</Tag></td>
                    <td>{w.creatorCallsign ? `${w.creatorCallsign} ` : ''}{w.creatorName}</td>
                    <td class="nowrap">{w.state === 'active' ? relative(w.expires) : formatDay(w.expires)}</td>
                </tr>
            {/each}
        </tbody>
    </table>
    <Pager page={s.page} pages={s.pages} onpage={(p) => run(s.searched, p)} />
{/if}

<style>
    .filter {
        width: 220px;
    }
    .filter label {
        display: block;
        font-weight: 700;
        margin-bottom: var(--au-s1);
    }
    .count {
        margin: 0 0 var(--au-s2);
    }
    .nowrap {
        white-space: nowrap;
    }
</style>
