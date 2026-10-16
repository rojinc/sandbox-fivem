<script>
    import { onMount } from 'svelte';
    import { Button, PageAlert } from '@sandbox/ui-kit';
    import { call, list } from '../../lib/api.js';
    import { relative } from '../../lib/format.js';
    import State from '../common/State.svelte';

    /** The public kiosk in the Bolingbroke lobby (SET_DATA prison = true). */
    let status = $state('loading');
    let prisoners = $state([]);
    let result = $state(null); // { type, text }
    let busy = $state(null);

    async function load() {
        status = 'loading';
        const res = await call('DOCGetPrisoners', {});
        if (res === null || res === false) {
            status = 'error';
            return;
        }
        prisoners = list(res).sort((a, b) => String(a.Last).localeCompare(String(b.Last)));
        status = 'ready';
    }
    onMount(load);

    async function request(p) {
        busy = p.SID;
        const res = await call('DOCRequestVisitation', { SID: p.SID });
        busy = null;
        if (res?.success) result = { type: 'success', text: `Visit requested for ${p.First} ${p.Last}. Wait in the lobby for an officer.` };
        else result = { type: 'error', text: res?.message ?? 'The visit was not requested. Try again in a few minutes.' };
    }
</script>

<div class="mdt-page-head">
    <div>
        <h1>Visit an inmate</h1>
        <p>Choose who you came to see. An officer meets you in the lobby.</p>
    </div>
</div>

{#if result}<div class="block"><PageAlert type={result.type}>{result.text}</PageAlert></div>{/if}

{#if status === 'loading'}
    <State status="loading" title="Loading inmates" />
{:else if status === 'error'}
    <State status="error" onretry={load} />
{:else if !prisoners.length}
    <State title="Nobody is held here right now">There is nobody to visit.</State>
{:else}
    <table class="au-table au-table--dense mdt-table">
        <thead><tr><th scope="col">Inmate</th><th scope="col">Release</th><th scope="col"><span class="au-hidden">Actions</span></th></tr></thead>
        <tbody>
            {#each prisoners as p (p.SID)}
                <tr>
                    <td><strong>{p.First} {p.Last}</strong></td>
                    <td>{p.Jailed?.Release ? relative(p.Jailed.Release) : 'Unknown'}</td>
                    <td class="act"><Button variant="secondary" size="sm" loading={busy === p.SID} onclick={() => request(p)}>Request a visit</Button></td>
                </tr>
            {/each}
        </tbody>
    </table>
{/if}

<style>
    .act {
        text-align: right;
    }
    .block {
        margin-bottom: var(--au-s4);
    }
</style>
