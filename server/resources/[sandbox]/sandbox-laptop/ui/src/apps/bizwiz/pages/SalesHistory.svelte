<script>
    import { untrack } from 'svelte';
    import { Button, Field, TextInput, Select, Modal, Spinner, PageAlert } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import { env } from '../../../state/env.svelte.js';
    import { asList } from '../../../state/data.svelte.js';
    import { ago, money, person, formatDateTime } from '../../../lib/format.js';
    import { CATEGORIES, categoryLabel } from '../dealer.js';

    /**
     * Vehicles the dealership sold (PDMGetHistory, 6 a page, newest first).
     * Open a sale for its details; look up who owns the vehicle now (PDMGetOwner).
     */
    let category = $state('all');
    let term = $state('');
    let searched = $state('');
    let page = $state(1);
    let more = $state(false);
    let rows = $state([]);
    let loading = $state(false);
    let failed = $state(false);

    async function load(p = 1) {
        loading = true;
        const res = await fetchNui('PDMGetHistory', { value: searched, category, page: p });
        loading = false;
        if (res && typeof res === 'object' && res.data !== undefined) {
            rows = asList(res.data);
            more = Boolean(res.more);
            page = p;
            failed = false;
        } else {
            failed = true;
            rows = [];
            more = false;
        }
    }

    $effect(() => {
        void category;
        void searched;
        untrack(() => load(1));
    });

    let open = $state(null);
    let owner = $state(null);
    let ownerBusy = $state(false);
    let ownerFailed = $state(false);

    async function lookUp(vin) {
        ownerBusy = true;
        ownerFailed = false;
        const res = await fetchNui('PDMGetOwner', { VIN: vin });
        ownerBusy = false;
        if (res && typeof res === 'object') owner = res;
        else ownerFailed = true;
    }

    function show(sale) {
        owner = null;
        ownerFailed = false;
        open = sale;
    }

    const vehicleName = (s) => `${s.vehicle?.data?.make ?? ''} ${s.vehicle?.data?.model ?? ''}`.trim() || 'Unknown vehicle';
</script>

<h3 class="heading">Sales history</h3>
<form
    class="filters"
    onsubmit={(e) => {
        e.preventDefault();
        searched = term.trim();
    }}
>
    <Field label="Category" id="hist-cat">
        <Select id="hist-cat" bind:value={category} options={CATEGORIES} />
    </Field>
    <Field label="Search sales" hint="Vehicle, buyer or seller" id="hist-term">
        <TextInput id="hist-term" bind:value={term} autocomplete="off" />
    </Field>
    <div class="filters__go"><Button type="submit" variant="secondary" icon="search">Search</Button></div>
</form>

{#if loading && !rows.length}
    <div class="loading"><Spinner /> Loading sales</div>
{:else if failed}
    <PageAlert type="error" compact>The sales history did not load. You need dealership management access.</PageAlert>
{:else if rows.length}
    <table class="au-table">
        <thead>
            <tr>
                <th scope="col">Vehicle</th>
                <th scope="col">Payment</th>
                <th scope="col" class="is-numeric">Price</th>
                <th scope="col">Seller</th>
                <th scope="col">Buyer</th>
                <th scope="col">Sold</th>
            </tr>
        </thead>
        <tbody>
            {#each rows as s, i (s._id ?? i)}
                <tr>
                    <td><button type="button" class="row-link" onclick={() => show(s)}>{vehicleName(s)}</button></td>
                    <td>{s.type === 'loan' ? 'Loan' : 'Cash'}</td>
                    <td class="is-numeric">{money(s.salePrice)}</td>
                    <td>{person(s.seller)}</td>
                    <td>{person(s.buyer)}</td>
                    <td class="nowrap">{ago(s.time, env.now)}</td>
                </tr>
            {/each}
        </tbody>
    </table>
    <div class="pager">
        <span class="au-muted">Page {page}</span>
        <div class="actions">
            <Button variant="secondary" size="sm" disabled={page <= 1 || loading} onclick={() => load(page - 1)}>Newer sales</Button>
            <Button variant="secondary" size="sm" disabled={!more || loading} onclick={() => load(page + 1)}>Older sales</Button>
        </div>
    </div>
{:else}
    <div class="state">
        <strong>{searched || category !== 'all' ? 'No sales match' : 'No sales yet'}</strong>
        <p>{searched || category !== 'all' ? 'Choose another category or change the search.' : 'Every vehicle the dealership sells is recorded here.'}</p>
    </div>
{/if}

{#if open}
    <Modal title={vehicleName(open)} eyebrow="Sale" onclose={() => (open = null)} width="620px">
        <dl class="facts">
            <div><dt>Class</dt><dd>{open.vehicle?.data?.class ?? 'Unknown'}, {categoryLabel(open.vehicle?.data?.category)}</dd></div>
            <div><dt>Payment</dt><dd>{open.type === 'loan' ? 'Loan' : 'Cash'}</dd></div>
            <div><dt>Sale price</dt><dd>{money(open.salePrice)}</dd></div>
            <div><dt>Commission</dt><dd>{money(open.commission)}</dd></div>
            <div><dt>Seller</dt><dd>{person(open.seller)} ({open.seller?.SID ?? '?'})</dd></div>
            <div><dt>Buyer</dt><dd>{person(open.buyer)} ({open.buyer?.SID ?? '?'})</dd></div>
            <div><dt>VIN</dt><dd class="au-mono">{open.vehicle?.VIN ?? 'Unknown'}</dd></div>
            <div><dt>Sold</dt><dd>{formatDateTime(open.time)}</dd></div>
            {#if owner}
                <div><dt>Owner now</dt><dd>{owner.OwnerName ?? 'Unknown'}</dd></div>
            {/if}
        </dl>
        {#if ownerFailed}<PageAlert type="error" compact>The current owner could not be found. The vehicle may have been scrapped.</PageAlert>{/if}
        {#snippet actions()}
            {#if !owner && open.vehicle?.VIN}<Button variant="secondary" loading={ownerBusy} onclick={() => lookUp(open.vehicle.VIN)}>Find current owner</Button>{/if}
            <Button onclick={() => (open = null)}>Close</Button>
        {/snippet}
    </Modal>
{/if}

<style>
    .filters {
        display: grid;
        grid-template-columns: 16em minmax(0, 24em) auto;
        gap: 0 var(--au-s4);
        align-items: end;
    }
    .filters__go {
        padding-bottom: var(--au-s4);
    }
    .nowrap {
        white-space: nowrap;
    }
    .pager {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: var(--au-s4);
    }
</style>
