<script>
    import { Button, Spinner, PageAlert } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import { env } from '../../../state/env.svelte.js';
    import { asList } from '../../../state/data.svelte.js';
    import { ago, person, sentence } from '../../../lib/format.js';

    /** The casino's recent big wins (CasinoGetBigWins), newest first. */
    let wins = $state([]);
    let loading = $state(true);
    let failed = $state(false);

    async function load() {
        loading = true;
        const res = await fetchNui('CasinoGetBigWins', {});
        loading = false;
        if (res === false || res === null || typeof res !== 'object') {
            failed = true;
            return;
        }
        failed = false;
        wins = asList(res).sort((a, b) => (Number(b.Time) || 0) - (Number(a.Time) || 0));
    }

    load();
</script>

<div class="section-head">
    <h3 class="heading">Big wins</h3>
    <Button variant="secondary" loading={loading} onclick={load}>Refresh list</Button>
</div>

{#if loading && !wins.length}
    <div class="loading"><Spinner /> Loading wins</div>
{:else if failed}
    <PageAlert type="error" compact>The wins did not load. Only casino management can see them.</PageAlert>
{:else if wins.length}
    <table class="au-table">
        <thead>
            <tr>
                <th scope="col">Game</th>
                <th scope="col">Prize</th>
                <th scope="col">Winner</th>
                <th scope="col">When</th>
            </tr>
        </thead>
        <tbody>
            {#each wins as w, i (i)}
                <tr>
                    <td>{sentence(String(w.Type ?? 'Unknown'))}</td>
                    <td>{w.Prize}</td>
                    <td>{person(w.Winner)}{w.Winner?.SID ? ` (${w.Winner.SID})` : ''}</td>
                    <td class="nowrap">{ago(w.Time, env.now)}</td>
                </tr>
            {/each}
        </tbody>
    </table>
{:else}
    <div class="state">
        <strong>No big wins yet</strong>
        <p>Large wins at the tables and machines show here.</p>
    </div>
{/if}

<style>
    .nowrap {
        white-space: nowrap;
    }
</style>
