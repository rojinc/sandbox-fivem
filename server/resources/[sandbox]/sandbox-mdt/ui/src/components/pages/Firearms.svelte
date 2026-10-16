<script>
    import { onMount } from 'svelte';
    import { go } from '../../state/app.svelte.js';
    import { search } from '../../state/search.svelte.js';
    import { call, list } from '../../lib/api.js';
    import SearchBar from '../common/SearchBar.svelte';
    import State from '../common/State.svelte';

    let { params = {} } = $props();
    const s = search.firearms;

    async function run(term) {
        s.term = term;
        if (!term) {
            s.status = 'idle';
            s.results = [];
            return;
        }
        s.status = 'loading';
        s.searched = term;
        const res = await call('Search', { type: 'firearm', term });
        if (res === null || res === false) {
            s.status = 'error';
            return;
        }
        s.results = list(res);
        s.status = 'ready';
    }

    onMount(() => {
        if (params.term && params.term !== s.searched) run(params.term);
    });

    const open = (f) => go('firearm', { id: f.serial });
</script>

<div class="mdt-page-head">
    <div>
        <h1>Firearms</h1>
        <p>Registered firearms by serial number or owner. Scratched serials are not on record.</p>
    </div>
</div>

<SearchBar bind:value={s.term} label="Serial number, owner name or state ID" placeholder="For example SBR-20931" button="Search firearms" busy={s.status === 'loading'} onsearch={run} />

{#if s.status === 'loading' && !s.results.length}
    <State status="loading" title="Searching firearms" />
{:else if s.status === 'error'}
    <State status="error" onretry={() => run(s.searched)} />
{:else if s.status === 'idle'}
    <State title="No search yet">A serial number must match exactly. Owner names can be partial.</State>
{:else if !s.results.length}
    <State title={`No firearms match "${s.searched}"`}>Check the serial number for O and 0, or search by the owner's state ID.</State>
{:else}
    <table class="au-table au-table--hover au-table--dense mdt-table">
        <thead><tr><th scope="col">Serial number</th><th scope="col">Model</th><th scope="col">Owner</th><th scope="col">Owner state ID</th></tr></thead>
        <tbody>
            {#each s.results as f (f.serial)}
                <tr class="is-clickable" tabindex="0" onclick={() => open(f)} onkeydown={(e) => e.key === 'Enter' && open(f)}>
                    <td class="au-mono"><strong>{f.serial}</strong></td>
                    <td>{f.model}</td>
                    <td>{f.owner_name ?? 'Unknown'}</td>
                    <td class="au-mono">{f.owner_sid ?? ''}</td>
                </tr>
            {/each}
        </tbody>
    </table>
{/if}
