<script>
    import { Tag } from '@sandbox/ui-kit';
    import RepMeter from './RepMeter.svelte';
    import { asList } from '../../state/data.svelte.js';

    /**
     * Chop lists: the shared public list, the private list from Chopping rank 5,
     * and personal lists from chop list items. Pick one to see its vehicles.
     */
    let { chopList = null, reputations = [] } = $props();

    const lists = $derived(
        Object.entries(chopList ?? {})
            .filter(([, v]) => v && typeof v === 'object')
            .map(([key, v]) => ({
                key,
                name: v.id !== undefined ? `Personal list ${v.id}` : `${key} list`,
                kind: v.public ? 'Shared' : v.id !== undefined ? 'Personal' : 'Shared',
                vehicles: asList(v.list),
            })),
    );
    let selected = $state(null);
    const current = $derived(lists.find((l) => l.key === selected) ?? lists[0] ?? null);
    const vehicles = $derived(current ? [...current.vehicles].sort((a, b) => Number(Boolean(b.hv)) - Number(Boolean(a.hv))) : []);
    const chopRep = $derived(reputations.find((r) => r.id === 'Chopping'));
</script>

{#if !chopList}
    <section class="section">
        <h3 class="heading">Chop lists are locked</h3>
        <p class="lead">Chop lists open at Chopping rank 3. The private list opens at rank 5.</p>
        {#if chopRep}
            <div class="narrow">
                <h4 class="subheading">Your chopping rank</h4>
                <RepMeter rep={chopRep} />
            </div>
        {/if}
    </section>
{:else if !lists.length}
    <div class="state">
        <strong>No chop lists right now</strong>
        <p>A new public list goes up regularly. LS Underground sends you a notification when it does.</p>
    </div>
{:else}
    <div class="split split--even">
        <section class="section" aria-labelledby="lists-h">
            <h3 class="heading" id="lists-h">Chop lists</h3>
            <table class="au-table">
                <thead>
                    <tr>
                        <th scope="col">List</th>
                        <th scope="col">Type</th>
                        <th scope="col" class="is-numeric">Vehicles left</th>
                    </tr>
                </thead>
                <tbody>
                    {#each lists as l (l.key)}
                        <tr class:is-selected={current?.key === l.key}>
                            <td><button type="button" class="row-link" aria-pressed={current?.key === l.key} onclick={() => (selected = l.key)}>{l.name}</button></td>
                            <td>{l.kind}</td>
                            <td class="is-numeric">{l.vehicles.length}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </section>
        <section class="section detail" aria-labelledby="veh-h">
            <h3 class="heading" id="veh-h">{current.name}</h3>
            {#if vehicles.length}
                <table class="au-table">
                    <thead>
                        <tr>
                            <th scope="col">Vehicle</th>
                            <th scope="col">Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each vehicles as v, i (i)}
                            <tr>
                                <td>{v.name}</td>
                                <td>{#if v.hv}<Tag tone="warning">High value</Tag>{:else}<span class="au-muted">Standard</span>{/if}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            {:else}
                <p class="au-muted">Every vehicle on this list has been chopped.</p>
            {/if}
        </section>
    </div>
{/if}

<style>
    .narrow {
        max-width: 28em;
    }
    .detail {
        margin-top: 0 !important;
    }
</style>
