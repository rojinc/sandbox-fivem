<script>
    import { onMount } from 'svelte';
    import { Button, Select, Checkbox, uid } from '@sandbox/ui-kit';
    import { app, go, hasPerm, hasJob } from '../../state/app.svelte.js';
    import { search } from '../../state/search.svelte.js';
    import { call, paged } from '../../lib/api.js';
    import { ReportTypes, reportTypeLabel } from '../../lib/data.js';
    import { formatDateTime } from '../../lib/format.js';
    import SearchBar from '../common/SearchBar.svelte';
    import State from '../common/State.svelte';
    import Pager from '../common/Pager.svelte';

    let { params = {} } = $props();
    const s = search.reports;
    const PER_PAGE = 12;
    const tid = uid('rtype');

    const isAttorney = $derived(app.attorney || hasJob('government', 'publicdefenders'));
    const viewable = $derived(ReportTypes.filter((t) => (t.view ? hasPerm(t.view) : true) || (t.attorney && isAttorney)));
    const creatable = $derived(ReportTypes.filter((t) => t.create && hasPerm(t.create)));
    let evidence = $state(false);

    $effect.pre(() => {
        if (viewable.length && !viewable.some((t) => t.value == s.type)) s.type = viewable[0].value;
    });

    async function run(term, page = 1) {
        s.term = term;
        s.status = 'loading';
        s.searched = term;
        const res = paged(await call('Search', { type: 'report', term, page, perPage: PER_PAGE, reportType: Number(s.type), isAttorney, evidence }), page);
        if (!res) {
            s.status = 'error';
            return;
        }
        s.results = res.data;
        s.page = page;
        s.pages = res.pages;
        s.status = 'ready';
    }

    onMount(() => {
        if (params.term && params.term !== s.searched) {
            s.type = 0;
            run(params.term);
        } else if (s.status === 'idle' && viewable.length) run('');
    });

    const open = (r) => go('report', { id: r.id });
</script>

<div class="mdt-page-head">
    <div>
        <h1>Reports</h1>
        <p>Search filed reports by number, title or officer. Search "suspect: 2207" for reports naming a state ID.</p>
    </div>
    {#if creatable.length}
        <div class="mdt-page-head__actions">
            <Button onclick={() => go('report-edit', { type: creatable.some((t) => t.value == s.type) ? Number(s.type) : creatable[0].value })}>Write a report</Button>
        </div>
    {/if}
</div>

{#if !viewable.length}
    <State title="You cannot read reports">Your rank has no permission to view reports.</State>
{:else}
    <SearchBar bind:value={s.term} label={evidence ? 'Evidence value' : 'Report number, title or officer'} placeholder={evidence ? 'For example CAS-90218' : 'Leave empty to list the latest'} button="Search reports" width="360px" busy={s.status === 'loading'} onsearch={(t) => run(t)}>
        <div class="type">
            <label for={tid}>Report type</label>
            <Select id={tid} bind:value={s.type} options={viewable.map((t) => ({ value: t.value, label: t.label }))} onchange={() => run(s.term)} />
        </div>
        <div class="ev"><Checkbox bind:checked={evidence} label="Search evidence" /></div>
    </SearchBar>

    {#if s.status === 'loading' && !s.results.length}
        <State status="loading" title="Searching reports" />
    {:else if s.status === 'error'}
        <State status="error" onretry={() => run(s.searched, s.page)} />
    {:else if !s.results.length}
        <State title={s.searched ? `No ${reportTypeLabel(s.type).toLowerCase()}s match "${s.searched}"` : `No ${reportTypeLabel(s.type).toLowerCase()}s filed yet`}>
            {#if evidence}Evidence searches need at least 4 characters of the exact value.{:else}Try the report number, or an officer's callsign.{/if}
        </State>
    {:else}
        <table class="au-table au-table--hover au-table--dense mdt-table">
            <thead>
                <tr>
                    <th scope="col">Number</th>
                    <th scope="col">Title</th>
                    <th scope="col">Filed by</th>
                    <th scope="col">Filed</th>
                </tr>
            </thead>
            <tbody>
                {#each s.results as r (r.id)}
                    <tr class="is-clickable" tabindex="0" onclick={() => open(r)} onkeydown={(e) => e.key === 'Enter' && open(r)}>
                        <td class="au-mono">{r.id}</td>
                        <td><strong>{r.title}</strong></td>
                        <td>{r.creatorCallsign ? `${r.creatorCallsign} ` : ''}{r.creatorName}</td>
                        <td class="nowrap">{formatDateTime(r.created)}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
        <Pager page={s.page} pages={s.pages} onpage={(p) => run(s.searched, p)} />
    {/if}
{/if}

<style>
    .type {
        width: 280px;
    }
    .type label {
        display: block;
        font-weight: 700;
        margin-bottom: var(--au-s1);
    }
    .ev {
        padding-bottom: 8px;
    }
    .nowrap {
        white-space: nowrap;
    }
</style>
