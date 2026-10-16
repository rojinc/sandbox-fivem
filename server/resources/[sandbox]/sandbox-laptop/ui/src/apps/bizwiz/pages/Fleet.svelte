<script>
    import { Button, Field, TextInput, Spinner, PageAlert } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import { asList } from '../../../state/data.svelte.js';
    import { showAlert } from '../../../state/notify.svelte.js';
    import { formatDay } from '../../../lib/format.js';

    /** Business-owned vehicles (ViewVehicleFleet); mark one on the GPS (TrackFleetVehicle). */
    let vehicles = $state([]);
    let loading = $state(true);
    let failed = $state(false);
    let filter = $state('');
    let tracking = $state(null);

    async function load() {
        loading = true;
        const res = await fetchNui('ViewVehicleFleet', {});
        loading = false;
        if (res === false || res === null || typeof res !== 'object') {
            failed = true;
            return;
        }
        failed = false;
        vehicles = asList(res).sort((a, b) => (Number(a.RegistrationDate) || 0) - (Number(b.RegistrationDate) || 0));
    }

    async function track(v) {
        tracking = v.VIN;
        const res = await fetchNui('TrackFleetVehicle', { vehicle: v.VIN });
        tracking = null;
        if (res === true) showAlert(`${v.RegisteredPlate ?? 'Vehicle'} marked on your GPS`, 'success');
        else showAlert('That vehicle could not be found. It may be stored or destroyed.', 'error');
    }

    const shown = $derived.by(() => {
        const q = filter.trim().toLowerCase();
        if (!q) return vehicles;
        return vehicles.filter((v) => `${v.VIN} ${v.RegisteredPlate} ${v.Make} ${v.Model}`.toLowerCase().includes(q));
    });

    load();
</script>

<div class="section-head">
    <h3 class="heading">Fleet</h3>
    <Button variant="secondary" loading={loading} onclick={load}>Refresh list</Button>
</div>
<div class="filter">
    <Field label="Find a vehicle" hint="Plate, VIN, make or model" id="fleet-filter">
        <TextInput id="fleet-filter" bind:value={filter} autocomplete="off" />
    </Field>
</div>

{#if loading && !vehicles.length}
    <div class="loading"><Spinner /> Loading fleet</div>
{:else if failed}
    <PageAlert type="error" compact>The fleet did not load. You need fleet access at your business.</PageAlert>
{:else if shown.length}
    <table class="au-table">
        <thead>
            <tr>
                <th scope="col">Plate</th>
                <th scope="col">Vehicle</th>
                <th scope="col">Stored at</th>
                <th scope="col">Registered</th>
                <th scope="col">VIN</th>
                <th scope="col" class="cell-actions"><span class="au-hidden">Actions</span></th>
            </tr>
        </thead>
        <tbody>
            {#each shown as v (v.VIN)}
                <tr>
                    <td class="au-mono">{v.RegisteredPlate ?? 'None'}</td>
                    <td>{[v.Make, v.Model].filter(Boolean).join(' ') || 'Unknown'}</td>
                    <td>{v.Storage?.Name ?? 'Out of storage'}</td>
                    <td class="nowrap">{v.RegistrationDate ? formatDay(v.RegistrationDate) : 'Unknown'}</td>
                    <td class="au-mono">{v.VIN}</td>
                    <td class="cell-actions"><Button variant="secondary" size="sm" loading={tracking === v.VIN} onclick={() => track(v)}>Mark on GPS</Button></td>
                </tr>
            {/each}
        </tbody>
    </table>
{:else if filter.trim()}
    <p class="au-muted">No vehicle matches "{filter.trim()}".</p>
{:else}
    <div class="state">
        <strong>No fleet vehicles</strong>
        <p>Vehicles the business owns show here once they are bought in its name.</p>
    </div>
{/if}

<style>
    .filter {
        max-width: 28em;
    }
    .nowrap {
        white-space: nowrap;
    }
</style>
