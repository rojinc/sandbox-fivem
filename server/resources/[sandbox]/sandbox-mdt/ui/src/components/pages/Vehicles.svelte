<script>
    import { onMount } from 'svelte';
    import { Tag } from '@sandbox/ui-kit';
    import { go } from '../../state/app.svelte.js';
    import { search } from '../../state/search.svelte.js';
    import { call, paged, list } from '../../lib/api.js';
    import { VehicleTypes, vehicleFlag } from '../../lib/data.js';
    import SearchBar from '../common/SearchBar.svelte';
    import State from '../common/State.svelte';
    import Pager from '../common/Pager.svelte';

    let { params = {} } = $props();
    const s = search.vehicles;
    const PER_PAGE = 12;

    async function run(term, page = 1) {
        s.term = term;
        if (!term) {
            s.status = 'idle';
            s.results = [];
            return;
        }
        s.status = 'loading';
        s.searched = term;
        const res = paged(await call('Search', { type: 'vehicle', term, page, perPage: PER_PAGE }), page);
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
        if (params.term && params.term !== s.searched) run(params.term);
    });

    const open = (v) => go('vehicle', { id: v.VIN });
    const owner = (v) => (v.Owner?.Type === 0 ? `State ID ${v.Owner.Id}` : v.Owner ? 'Business or fleet' : 'Unknown');
</script>

<div class="mdt-page-head">
    <div>
        <h1>Vehicles</h1>
        <p>Find a vehicle by plate, VIN or make and model.</p>
    </div>
</div>

<SearchBar bind:value={s.term} label="Plate, VIN or make and model" placeholder="For example 46EEK572" button="Search vehicles" busy={s.status === 'loading'} onsearch={(t) => run(t)} />

{#if s.status === 'loading' && !s.results.length}
    <State status="loading" title="Searching vehicles" />
{:else if s.status === 'error'}
    <State status="error" onretry={() => run(s.searched, s.page)} />
{:else if s.status === 'idle'}
    <State title="No search yet">Search by part of a plate, the full VIN, or a make and model such as "Bravado Buffalo".</State>
{:else if !s.results.length}
    <State title={`No vehicles match "${s.searched}"`}>Plates are 8 characters. Check for O and 0, or I and 1.</State>
{:else}
    <table class="au-table au-table--hover au-table--dense mdt-table">
        <thead>
            <tr>
                <th scope="col">Plate</th>
                <th scope="col">Vehicle</th>
                <th scope="col">Type</th>
                <th scope="col">Owner</th>
                <th scope="col">VIN</th>
                <th scope="col">Flags</th>
            </tr>
        </thead>
        <tbody>
            {#each s.results as v (v.VIN)}
                {@const flags = list(v.Flags)}
                <tr class="is-clickable" tabindex="0" onclick={() => open(v)} onkeydown={(e) => e.key === 'Enter' && open(v)}>
                    <td class="au-mono"><strong>{v.RegisteredPlate ?? 'None'}</strong></td>
                    <td>{v.Make} {v.Model}</td>
                    <td>{VehicleTypes[v.Type] ?? 'Car'}</td>
                    <td>{owner(v)}</td>
                    <td class="au-mono">{v.VIN}</td>
                    <td>
                        <span class="mdt-tags">
                            {#each flags as f (f.Type)}<Tag tone={vehicleFlag(f.Type).tone}>{vehicleFlag(f.Type).label}</Tag>{/each}
                            {#if v.Storage?.Type === 0}<Tag tone="warning">Impounded</Tag>{/if}
                            {#if !flags.length && v.Storage?.Type !== 0}<span class="au-muted">None</span>{/if}
                        </span>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
    <Pager page={s.page} pages={s.pages} onpage={(p) => run(s.searched, p)} />
{/if}
