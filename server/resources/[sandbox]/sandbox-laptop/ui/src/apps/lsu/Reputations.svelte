<script>
    import { ProgressBar } from '@sandbox/ui-kit';
    import { formatNumber } from '../../lib/format.js';

    /** Your LS Underground reputations: racing, chopping and boosting. */
    let { reputations = [] } = $props();

    const ORDER = ['Racing', 'Chopping', 'Boosting'];
    const rows = $derived([...reputations].sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id)));

    function pct(rep) {
        const from = Number(rep.current?.value) || 0;
        const to = Number(rep.next?.value) || 0;
        if (!rep.next?.label || rep.next.label === 'Done!' || to <= from) return 100;
        return Math.max(0, Math.min(100, (((Number(rep.value) || 0) - from) / (to - from)) * 100));
    }

    function nextText(rep) {
        if (!rep.next?.label || rep.next.label === 'Done!') return 'Top rank';
        return `${rep.next.label} at ${formatNumber(rep.next.value)}`;
    }
</script>

<section class="section">
    <h3 class="heading">Reputation</h3>
    <p class="lead">Reputation unlocks market items, chop lists and boosting classes. It grows as you race, chop and boost.</p>
    {#if rows.length}
        <table class="au-table">
            <thead>
                <tr>
                    <th scope="col">Reputation</th>
                    <th scope="col">Rank</th>
                    <th scope="col" class="is-numeric">Points</th>
                    <th scope="col" class="col-progress">Progress</th>
                    <th scope="col">Next rank</th>
                </tr>
            </thead>
            <tbody>
                {#each rows as rep (rep.id)}
                    <tr>
                        <td class="cell-strong">{rep.label}</td>
                        <td>{rep.current?.label ?? 'No rank yet'}</td>
                        <td class="is-numeric">{formatNumber(rep.value)}</td>
                        <td class="col-progress"><ProgressBar value={pct(rep)} max={100} color="var(--au-ink)" /></td>
                        <td>{nextText(rep)}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {:else}
        <div class="state">
            <strong>No reputation yet</strong>
            <p>Race with your alias or chop vehicles from a chop list to start building it.</p>
        </div>
    {/if}
</section>

<style>
    .col-progress {
        width: 30%;
    }
</style>
