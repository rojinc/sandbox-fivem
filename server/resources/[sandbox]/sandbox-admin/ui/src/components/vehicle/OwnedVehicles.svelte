<script>
    import { onMount } from 'svelte';
    import { Button, EmptyState, Field, TextInput } from '@sandbox/ui-kit';
    import { call, errorText } from '../../lib/api.js';
    import { asList, plural, text, vehicleName } from '../../lib/format.js';
    import { nav } from '../../state/nav.svelte.js';
    import Loading from '../shared/Loading.svelte';
    import Problem from '../shared/Problem.svelte';
    import VehicleRecord from './VehicleRecord.svelte';

    /** GetVehicleList -> [{ Entity, VIN, Plate, Make, Model, OwnerId }] or false. */
    let rows = $state([]);
    let status = $state('loading');
    let error = $state('');
    let term = $state('');

    async function load() {
        status = 'loading';
        try {
            const res = await call('GetVehicleList', {});
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

    onMount(load);

    const shown = $derived.by(() => {
        const q = term.trim().toLowerCase();
        return rows
            .filter((v) => !q || vehicleName(v).toLowerCase().includes(q) || String(v.Plate ?? '').toLowerCase().includes(q) || String(v.VIN ?? '').toLowerCase() === q || String(v.OwnerId ?? '') === q)
            .sort((a, b) => (Number(a.Entity) || 0) - (Number(b.Entity) || 0));
    });

    function open(v) {
        nav.vehicle = Number(v.Entity);
    }

    function removed() {
        nav.vehicle = null;
        load();
    }
</script>

<div class="split">
    <div class="split__list">
        <div class="page-head">
            <div>
                <h1>Owned vehicles out in the world</h1>
                <p aria-live="polite">
                    {#if status === 'ready'}{term.trim() ? `Showing ${shown.length} of ${plural(rows.length, 'vehicle')}` : plural(rows.length, 'vehicle')}{:else if status === 'loading'}Loading the list{/if}
                </p>
            </div>
            <Button variant="secondary" onclick={load} loading={status === 'loading'}>Refresh list</Button>
        </div>

        <div class="filters">
            <Field label="Search" id="veh-search">
                <TextInput id="veh-search" type="search" bind:value={term} placeholder="Plate, make, model, exact VIN or owner ID" autocomplete="off" />
            </Field>
        </div>

        {#if status === 'loading'}
            <Loading text="Loading vehicles" />
        {:else if status === 'error'}
            <Problem title="The vehicle list did not load" retry={load}>{error}</Problem>
        {:else if !rows.length}
            <EmptyState title="No owned vehicles are out">Vehicles taken out of a garage appear here while they exist in the world.</EmptyState>
        {:else if !shown.length}
            <EmptyState title="No vehicles match">
                Search by plate, make or model, an exact VIN or an owner ID.
                {#snippet actions()}
                    <Button variant="secondary" onclick={() => (term = '')}>Clear search</Button>
                {/snippet}
            </EmptyState>
        {:else}
            <table class="au-table au-table--dense au-table--hover">
                <thead>
                    <tr>
                        <th scope="col">Plate</th>
                        <th scope="col">Vehicle</th>
                        <th scope="col">VIN</th>
                        <th scope="col">Owner ID</th>
                        <th scope="col">Entity</th>
                    </tr>
                </thead>
                <tbody>
                    {#each shown as v (v.Entity)}
                        <tr class="is-clickable" class:is-selected={nav.vehicle === Number(v.Entity)} aria-selected={nav.vehicle === Number(v.Entity)} tabindex="0" onclick={() => open(v)} onkeydown={(e) => e.key === 'Enter' && open(v)}>
                            <td class="au-mono">{text(v.Plate, 'None')}</td>
                            <td>{vehicleName(v)}</td>
                            <td class="au-mono dim">{text(v.VIN, 'Unknown')}</td>
                            <td class="au-mono">{text(v.OwnerId, 'Unknown')}</td>
                            <td class="au-mono dim">{text(v.Entity)}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {/if}
    </div>
    <aside class="split__record" aria-label="Vehicle record">
        {#if nav.vehicle}
            {#key nav.vehicle}
                <VehicleRecord entity={nav.vehicle} onremoved={removed} />
            {/key}
        {:else}
            <h2 class="empty-title">No vehicle selected</h2>
            <p class="note">Select a vehicle in the table to see its details and condition, and the actions you can use on it.</p>
        {/if}
    </aside>
</div>

<style>
    .filters {
        margin-bottom: var(--au-s5);
        max-width: 560px;
    }
    .filters :global(.au-field) {
        margin: 0;
    }
    .empty-title {
        margin: 0;
        font-size: var(--au-fs-md);
    }
</style>
