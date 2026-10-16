<script>
    import { onMount } from 'svelte';
    import { Button, Tag, TextInput } from '@sandbox/ui-kit';
    import { go } from '../../state/app.svelte.js';
    import { toast } from '../../state/toasts.svelte.js';
    import { call, list } from '../../lib/api.js';
    import { PropertyTypes } from '../../lib/data.js';
    import { formatMoney } from '../../lib/format.js';
    import State from '../common/State.svelte';

    /** Every property on the map; set a waypoint to one. */
    let status = $state('loading');
    let props = $state([]);
    let filter = $state('');

    async function load() {
        status = 'loading';
        const res = await call('GetProperties', {});
        if (res === null) {
            status = 'error';
            return;
        }
        props = list(res);
        status = 'ready';
    }
    onMount(load);

    const shown = $derived(
        props
            .filter((p) => !filter.trim() || `${p.label} ${p.owner?.First ?? ''} ${p.owner?.Last ?? ''} ${p.owner?.SID ?? ''}`.toLowerCase().includes(filter.trim().toLowerCase()))
            .sort((a, b) => String(a.label).localeCompare(String(b.label), undefined, { numeric: true }))
            .slice(0, 200),
    );

    async function locate(p) {
        const res = await call('FindProperty', p._id ?? p.id);
        if (res) toast.success(`Waypoint set to ${p.label}`);
        else toast.error('That property has no location on the map.');
    }
</script>

<div class="mdt-page-head">
    <div>
        <h1>Properties</h1>
        <p>Search by address or owner, then set a waypoint.</p>
    </div>
</div>

<div class="filter">
    <label for="prop-filter">Address, owner or state ID</label>
    <TextInput id="prop-filter" bind:value={filter} placeholder="For example Grove Street" autocomplete="off" />
</div>

{#if status === 'loading'}
    <State status="loading" title="Loading properties" />
{:else if status === 'error'}
    <State status="error" onretry={load} />
{:else if !shown.length}
    <State title={filter ? `No properties match "${filter}"` : 'No properties found'}>Check the spelling, or search by the owner's state ID.</State>
{:else}
    <p class="au-muted count" aria-live="polite">Showing {shown.length} of {props.length}</p>
    <table class="au-table au-table--dense mdt-table">
        <thead><tr><th scope="col">Address</th><th scope="col">Type</th><th scope="col">Owner</th><th scope="col" class="mdt-num">Price</th><th scope="col"><span class="au-hidden">Actions</span></th></tr></thead>
        <tbody>
            {#each shown as p (p._id ?? p.id ?? p.label)}
                <tr>
                    <td><strong>{p.label}</strong></td>
                    <td>{PropertyTypes[p.type] ?? 'Property'}</td>
                    <td>
                        {#if p.owner?.SID}
                            <button type="button" class="mdt-link" onclick={() => go('person', { id: p.owner.SID })}>{p.owner.First} {p.owner.Last}</button>
                        {:else if p.sold}<span class="au-muted">Owner not recorded</span>{:else}<Tag>For sale</Tag>{/if}
                    </td>
                    <td class="mdt-num au-mono">{p.price ? formatMoney(p.price) : ''}</td>
                    <td class="act"><Button variant="tertiary" size="sm" onclick={() => locate(p)}>Set waypoint</Button></td>
                </tr>
            {/each}
        </tbody>
    </table>
{/if}

<style>
    .filter {
        max-width: 420px;
        margin-bottom: var(--au-s4);
    }
    .filter label {
        display: block;
        font-weight: 700;
        margin-bottom: var(--au-s1);
    }
    .count {
        margin: 0 0 var(--au-s2);
    }
    .act {
        text-align: right;
        white-space: nowrap;
    }
</style>
