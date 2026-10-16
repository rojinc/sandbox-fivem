<script>
    import { onMount } from 'svelte';
    import { Button, Modal, RichText, Tag } from '@sandbox/ui-kit';
    import { go, back, hasJob } from '../../state/app.svelte.js';
    import { store } from '../../state/data.svelte.js';
    import { toast } from '../../state/toasts.svelte.js';
    import { call, parseList } from '../../lib/api.js';
    import { warrantState, chargeType } from '../../lib/data.js';
    import { resolveCharges, chargeTotals } from '../../lib/charges.js';
    import { formatDateTime, formatMoney, months, personName, relative } from '../../lib/format.js';
    import State from '../common/State.svelte';

    let { params = {} } = $props();

    let status = $state('loading');
    let w = $state(null);
    let confirm = $state(null); // served | void
    let busy = $state(false);

    async function load() {
        status = 'loading';
        const res = await call('View', { type: 'warrant', id: params.id });
        if (!res || !res.id) {
            status = res === null ? 'error' : 'missing';
            return;
        }
        w = res;
        status = 'ready';
    }
    onMount(load);

    const suspect = $derived(w?.suspectData ?? null);
    const charges = $derived(resolveCharges(parseList(suspect?.charges)));
    const totals = $derived(chargeTotals(charges));
    const canUpdate = $derived(w?.state === 'active' && (hasJob('police') || hasJob('government')));

    async function setState(state) {
        busy = true;
        const res = await call('Update', { type: 'warrant', id: w.id, state });
        busy = false;
        if (res) {
            w.state = state;
            store.homeLastFetch = 0;
            toast.success(state === 'served' ? 'Warrant marked as served' : 'Warrant voided');
            confirm = null;
        } else toast.error('The warrant was not updated. Try again.');
    }
</script>

<div class="mdt-back"><Button variant="tertiary" size="sm" icon="arrow-left" onclick={() => back('warrants')}>Back to warrants</Button></div>

{#if status === 'loading'}
    <State status="loading" title="Opening warrant" />
{:else if status === 'error'}
    <State status="error" onretry={load} />
{:else if status === 'missing'}
    <State title="Warrant {params.id} was not found">Search again from Warrants.</State>
{:else}
    <div class="mdt-page-head">
        <div>
            <h1>{w.title}</h1>
            <p>Warrant <span class="au-mono">{w.id}</span>, issued by {w.creatorCallsign ? `${w.creatorCallsign} ` : ''}{w.creatorName}</p>
            <div class="tags"><Tag tone={warrantState(w.state).tone}>{warrantState(w.state).label}</Tag></div>
        </div>
        {#if canUpdate}
            <div class="mdt-page-head__actions">
                <Button variant="danger" onclick={() => (confirm = 'void')}>Void warrant</Button>
                <Button onclick={() => (confirm = 'served')}>Mark as served</Button>
            </div>
        {/if}
    </div>

    <div class="mdt-split">
        <div>
            <section class="mdt-section">
                <h2>Charges</h2>
                {#if charges.length}
                    <table class="au-table au-table--dense mdt-table">
                        <thead><tr><th scope="col">Charge</th><th scope="col">Class</th><th scope="col" class="mdt-num">Count</th></tr></thead>
                        <tbody>
                            {#each charges as c (c.id)}
                                <tr><td>{c.title}</td><td><Tag tone={chargeType(c.type).tone}>{chargeType(c.type).label}</Tag></td><td class="mdt-num au-mono">{c.count}</td></tr>
                            {/each}
                        </tbody>
                    </table>
                    <p class="au-muted sum">Before any reduction: {months(totals.months)}, {formatMoney(totals.fine)} fine.</p>
                {:else}
                    <p class="au-muted">The charges are on the report.</p>
                {/if}
            </section>
            <section class="mdt-section">
                <h2>Notes</h2>
                {#if w.notes}<RichText tag="div" class="mdt-rich" text={w.notes} />{:else}<p class="au-muted">No notes.</p>{/if}
            </section>
        </div>
        <aside>
            <section class="mdt-section">
                <h2>Details</h2>
                <dl class="au-dl">
                    <dt>Wanted</dt>
                    <dd>
                        {#if suspect}
                            <button type="button" class="mdt-link" onclick={() => go('person', { id: suspect.SID })}>{personName(suspect)}</button>
                        {:else}Unknown{/if}
                    </dd>
                    <dt>Report</dt>
                    <dd><button type="button" class="mdt-link" onclick={() => go('report', { id: w.report })}>Report {w.report}</button></dd>
                    <dt>Issued</dt>
                    <dd>{formatDateTime(w.issued)}</dd>
                    <dt>Expires</dt>
                    <dd>{formatDateTime(w.expires)}{#if w.state === 'active'}<div class="au-muted">{relative(w.expires)}</div>{/if}</dd>
                </dl>
            </section>
        </aside>
    </div>

    <Modal open={Boolean(confirm)} title={confirm === 'void' ? 'Void this warrant' : 'Mark this warrant as served'} onclose={() => (confirm = null)}>
        <p>
            {#if confirm === 'void'}The warrant stops showing as active for every officer. Use this when it was issued in error.{:else}Do this once the suspect is in custody. The warrant stops showing as active.{/if}
        </p>
        {#snippet actions()}
            <Button variant="secondary" onclick={() => (confirm = null)}>Cancel</Button>
            {#if confirm === 'void'}
                <Button variant="danger" loading={busy} onclick={() => setState('void')}>Void warrant</Button>
            {:else}
                <Button loading={busy} onclick={() => setState('served')}>Mark as served</Button>
            {/if}
        {/snippet}
    </Modal>
{/if}

<style>
    .tags {
        margin-top: var(--au-s2);
    }
    .sum {
        margin-top: var(--au-s2);
    }
</style>
