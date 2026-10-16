<script>
    import { Button, Field, TextInput, Spinner, PageAlert } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import { env } from '../../../state/env.svelte.js';
    import { asList } from '../../../state/data.svelte.js';
    import { ago, person, formatNumber } from '../../../lib/format.js';

    /**
     * Receipt totals per employee, counted from every receipt
     * (BusinessReceiptSearch with no term): receipts written, receipts helped
     * with, the types, and the latest one.
     */
    let rows = $state([]);
    let loading = $state(false);
    let failed = $state(false);
    let filter = $state('');

    async function load() {
        loading = true;
        const res = await fetchNui('BusinessReceiptSearch', { term: '' });
        loading = false;
        if (res === false || res === null || typeof res !== 'object') {
            failed = true;
            return;
        }
        failed = false;
        const counts = {};
        const bump = (who, field, r) => {
            if (!who?.SID) return;
            const c = (counts[who.SID] ??= { char: who, created: 0, assisted: 0, latest: 0, types: {} });
            c[field] += 1;
            c.latest = Math.max(c.latest, Number(r.time) || 0);
            const t = r.type ?? 'General';
            c.types[t] = (c.types[t] ?? 0) + 1;
        };
        for (const r of asList(res)) {
            bump(r.author, 'created', r);
            for (const w of asList(r.workers)) bump(w, 'assisted', r);
        }
        rows = Object.values(counts).sort((a, b) => b.created + b.assisted - (a.created + a.assisted));
    }

    const shown = $derived.by(() => {
        const q = filter.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter((r) => `${person(r.char)} ${r.char.SID}`.toLowerCase().includes(q));
    });

    load();
</script>

<div class="section-head">
    <h3 class="heading">Receipt totals</h3>
    <Button variant="secondary" loading={loading} onclick={load}>Count again</Button>
</div>
<p class="lead">How many receipts each employee wrote or helped with, from every receipt on record. Clearing receipts resets these totals.</p>

<div class="filter">
    <Field label="Show one employee" hint="Name or State ID" id="tot-filter">
        <TextInput id="tot-filter" bind:value={filter} autocomplete="off" />
    </Field>
</div>

{#if loading && !rows.length}
    <div class="loading"><Spinner /> Counting receipts</div>
{:else if failed}
    <PageAlert type="error" compact>The receipts could not be counted. Check you are still on duty, then select Count again.</PageAlert>
{:else if shown.length}
    <table class="au-table">
        <thead>
            <tr>
                <th scope="col">Employee</th>
                <th scope="col" class="is-numeric">Written</th>
                <th scope="col" class="is-numeric">Helped with</th>
                <th scope="col">Types</th>
                <th scope="col">Latest</th>
            </tr>
        </thead>
        <tbody>
            {#each shown as r (r.char.SID)}
                <tr>
                    <td>{person(r.char)} <span class="au-muted">({r.char.SID})</span></td>
                    <td class="is-numeric">{formatNumber(r.created)}</td>
                    <td class="is-numeric">{formatNumber(r.assisted)}</td>
                    <td>{Object.entries(r.types).map(([t, n]) => `${t} ${n}`).join(', ')}</td>
                    <td class="nowrap">{ago(r.latest, env.now)}</td>
                </tr>
            {/each}
        </tbody>
    </table>
{:else if filter.trim()}
    <p class="au-muted">No employee matches "{filter.trim()}".</p>
{:else}
    <div class="state">
        <strong>No receipts to count</strong>
        <p>Totals appear once employees write receipts.</p>
    </div>
{/if}

<style>
    .filter {
        max-width: 24em;
    }
    .nowrap {
        white-space: nowrap;
    }
</style>
