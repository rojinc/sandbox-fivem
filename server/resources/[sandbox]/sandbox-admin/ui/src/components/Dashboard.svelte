<script>
    import { onMount } from 'svelte';
    import { Button, EmptyState } from '@sandbox/ui-kit';
    import { call, errorText } from '../lib/api.js';
    import { asList, charName, clock, percent, text, when } from '../lib/format.js';
    import { openPlayer } from '../state/nav.svelte.js';
    import Loading from './shared/Loading.svelte';
    import Problem from './shared/Problem.svelte';

    /** GetPlayerHistory: { current, max, queue, history: [{ count, time }] }, one sample every 30 minutes. */
    let pop = $state({ status: 'loading', current: 0, max: 0, queue: 0, samples: [], error: '' });
    /** GetPlayerList { disconnected = true }: the last 60 disconnects. */
    let left = $state({ status: 'loading', rows: [], error: '' });

    async function loadPopulation() {
        pop.status = 'loading';
        try {
            const res = await call('GetPlayerHistory', {});
            pop.current = Math.max(0, Number(res?.current) || 0);
            pop.max = Math.max(0, Number(res?.max) || 0);
            pop.queue = Math.max(0, Number(res?.queue) || 0);
            pop.samples = asList(res?.history)
                .map((h) => ({ t: Number(h?.time) || 0, v: Math.max(0, Number(h?.count) || 0) }))
                .filter((h) => h.t > 0)
                .sort((a, b) => b.t - a.t);
            pop.status = 'ready';
        } catch (e) {
            pop.error = errorText(e);
            pop.status = 'error';
        }
    }

    async function loadDisconnects() {
        left.status = 'loading';
        try {
            const res = await call('GetPlayerList', { disconnected: true });
            if (res === false) {
                left.error = 'The server did not accept your staff permission. Close the console and open it again.';
                left.status = 'error';
                return;
            }
            left.rows = asList(res).sort((a, b) => (Number(b.DisconnectedTime) || 0) - (Number(a.DisconnectedTime) || 0));
            left.status = 'ready';
        } catch (e) {
            left.error = errorText(e);
            left.status = 'error';
        }
    }

    function refresh() {
        loadPopulation();
        loadDisconnects();
    }

    onMount(refresh);

    const used = $derived(percent(pop.current, pop.max));
    const peak = $derived(pop.samples.reduce((best, s) => (s.v > best.v ? s : best), { t: 0, v: pop.current }));
    // Newest first, with the change from the sample before it.
    const history = $derived(pop.samples.map((s, i) => ({ ...s, delta: i + 1 < pop.samples.length ? s.v - pop.samples[i + 1].v : null })));
    const recent = $derived(left.rows.slice(0, 12));

    function signed(n) {
        if (n === null) return '';
        if (n > 0) return `+${n}`;
        if (n < 0) return `−${Math.abs(n)}`;
        return '0';
    }
</script>

<div class="page">
    <div class="page-head">
        <div>
            <h1>Server population</h1>
            <p>The server records its player count every 30 minutes and keeps the last 6 hours.</p>
        </div>
        <Button variant="secondary" onclick={refresh} loading={pop.status === 'loading' || left.status === 'loading'}>Refresh figures</Button>
    </div>

    {#if pop.status === 'error'}
        <Problem title="Population figures did not load" retry={loadPopulation}>{pop.error}</Problem>
    {:else}
        <dl class="figures" aria-busy={pop.status === 'loading'}>
            <div>
                <dt>Online now</dt>
                <dd><span class="au-mono big">{pop.status === 'ready' ? pop.current : '–'}</span>{#if pop.max}<span class="of">of {pop.max}</span>{/if}</dd>
            </div>
            <div>
                <dt>Waiting in queue</dt>
                <dd><span class="au-mono big">{pop.status === 'ready' ? pop.queue : '–'}</span></dd>
            </div>
            <div>
                <dt>Slots used</dt>
                <dd><span class="au-mono big">{used === null ? '–' : `${used}%`}</span></dd>
            </div>
            <div>
                <dt>Highest in 6 hours</dt>
                <dd><span class="au-mono big">{pop.status === 'ready' ? peak.v : '–'}</span>{#if peak.t}<span class="of">at {clock(peak.t)}</span>{:else if pop.status === 'ready'}<span class="of">right now</span>{/if}</dd>
            </div>
        </dl>
    {/if}

    <div class="grid">
        <section class="section">
            <h2>Recent disconnects</h2>
            {#if left.status === 'loading'}
                <Loading text="Loading disconnects" />
            {:else if left.status === 'error'}
                <Problem title="Disconnects did not load" retry={loadDisconnects}>{left.error}</Problem>
            {:else if !recent.length}
                <EmptyState title="Nobody has left since the server started">Players who leave show up here with the time and the reason they dropped.</EmptyState>
            {:else}
                <p class="lead-muted">Select a row to open that player's record. The server keeps the last 60.</p>
                <table class="au-table au-table--dense au-table--hover">
                    <thead>
                        <tr>
                            <th scope="col">Left</th>
                            <th scope="col">Player</th>
                            <th scope="col">Character</th>
                            <th scope="col">Reason</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each recent as p (`${p.Source}-${p.DisconnectedTime}`)}
                            <tr class="is-clickable" tabindex="0" onclick={() => openPlayer(p.Source, 'disconnected')} onkeydown={(e) => e.key === 'Enter' && openPlayer(p.Source, 'disconnected')}>
                                <td class="nowrap">{when(p.DisconnectedTime)}</td>
                                <td>{text(p.Name, 'Unknown')}</td>
                                <td>{charName(p.Character) || 'No character'}</td>
                                <td class="reason dim au-truncate" title={text(p.Reason)}>{text(p.Reason, 'No reason recorded')}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            {/if}
        </section>

        <section class="section">
            <h2>Player count</h2>
            {#if pop.status === 'loading'}
                <Loading text="Loading samples" />
            {:else if pop.status === 'ready' && !history.length}
                <EmptyState title="No samples yet">The first sample is taken 30 minutes after the server starts.</EmptyState>
            {:else if pop.status === 'ready'}
                <table class="au-table au-table--dense">
                    <thead>
                        <tr>
                            <th scope="col">Time</th>
                            <th scope="col" class="num">Players</th>
                            <th scope="col" class="num">Change</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each history as s (s.t)}
                            <tr>
                                <td class="nowrap">{when(s.t)}</td>
                                <td class="num au-mono">{s.v}</td>
                                <td class="num au-mono dim">{signed(s.delta)}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            {/if}
        </section>
    </div>
</div>

<style>
    .figures {
        display: flex;
        gap: var(--au-s12);
        margin: 0;
    }
    .figures dt {
        color: var(--au-muted);
        font-size: var(--au-fs-xs);
    }
    .figures dd {
        margin: 0;
        display: flex;
        align-items: baseline;
        gap: var(--au-s2);
    }
    .big {
        font-size: var(--au-fs-xxl);
        font-weight: 500;
        line-height: 1.1;
    }
    .of {
        color: var(--au-muted);
        font-size: var(--au-fs-xs);
    }
    .nowrap {
        white-space: nowrap;
    }
    .grid {
        display: grid;
        grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
        gap: var(--au-s8);
    }
</style>
