<script>
    import { Button, Field, TextInput, Spinner, PageAlert, Modal } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import { env } from '../../../state/env.svelte.js';
    import { asList } from '../../../state/data.svelte.js';
    import { showAlert } from '../../../state/notify.svelte.js';
    import { hasJobPerm } from '../../../lib/perms.js';
    import { ago, person, money } from '../../../lib/format.js';

    /** Receipts: search by customer or employee, newest first. Managers can clear them all. */
    let { onnav } = $props();

    let term = $state('');
    let searched = $state('');
    let results = $state([]);
    let loading = $state(false);
    let failed = $state(false);
    let clearing = $state(false);
    let busy = $state(false);
    const canCreate = $derived(hasJobPerm('TABLET_CREATE_RECEIPT'));
    const canClear = $derived(hasJobPerm('TABLET_CLEAR_RECEIPT'));

    async function search(value = term) {
        loading = true;
        searched = value.trim();
        const res = await fetchNui('BusinessReceiptSearch', { term: searched });
        loading = false;
        if (res === false || res === null || typeof res !== 'object') {
            failed = true;
            results = [];
            return;
        }
        failed = false;
        results = asList(res)
            .slice()
            .sort((a, b) => (Number(b.time) || 0) - (Number(a.time) || 0));
    }

    async function clearAll() {
        busy = true;
        const res = await fetchNui('BusinessReceiptDeleteAll', {});
        busy = false;
        clearing = false;
        if (res === true) {
            showAlert('All receipts cleared', 'success');
            search('');
        } else showAlert('The receipts were not cleared. Try again.', 'error');
    }

    search('');
</script>

<div class="section-head">
    <h3 class="heading">Receipts</h3>
    <div class="actions">
        {#if canCreate}<Button onclick={() => onnav('Create/Receipt')}>New receipt</Button>{/if}
        {#if canClear}<Button variant="secondary" onclick={() => (clearing = true)}>Clear all receipts</Button>{/if}
    </div>
</div>

<form
    class="search"
    role="search"
    onsubmit={(e) => {
        e.preventDefault();
        search();
    }}
>
    <Field label="Search receipts" hint="Customer name, or the name or State ID of who wrote it" id="rec-search">
        <TextInput id="rec-search" bind:value={term} autocomplete="off" />
    </Field>
    <Button type="submit" variant="secondary" icon="search">Search</Button>
    {#if searched}<Button variant="tertiary" onclick={() => ((term = ''), search(''))}>Show all</Button>{/if}
</form>

{#if loading}
    <div class="loading"><Spinner /> Searching receipts</div>
{:else if failed}
    <PageAlert type="error" compact>The search did not run. Check you are still on duty.</PageAlert>
{:else if results.length}
    <p class="au-muted count" aria-live="polite">{results.length} {results.length === 1 ? 'receipt' : 'receipts'}{searched ? ` matching "${searched}"` : ''}, newest first.</p>
    <table class="au-table">
        <thead>
            <tr>
                <th scope="col">Customer</th>
                <th scope="col">Type</th>
                <th scope="col" class="is-numeric">Paid</th>
                <th scope="col">Written by</th>
                <th scope="col">Created</th>
            </tr>
        </thead>
        <tbody>
            {#each results as r (r._id)}
                <tr>
                    <td><button type="button" class="row-link" onclick={() => onnav('View/Receipt', { id: r._id })}>{r.customerName || 'No name'}</button></td>
                    <td>{r.type ?? 'General'}</td>
                    {#if r.paymentPaid === '' || r.paymentPaid === null || r.paymentPaid === undefined}
                        <td class="cell-none au-muted">Not recorded</td>
                    {:else}
                        <td class="is-numeric">{money(r.paymentPaid)}</td>
                    {/if}
                    <td>{person(r.author)}</td>
                    <td class="nowrap">{ago(r.time, env.now)}</td>
                </tr>
            {/each}
        </tbody>
    </table>
{:else if searched}
    <div class="state">
        <strong>No receipts match "{searched}"</strong>
        <p>Search by the customer's name as it was written on the receipt, or by an employee.</p>
    </div>
{:else}
    <div class="state">
        <strong>No receipts yet</strong>
        <p>Write a receipt for each paid job so the business can track sales and who did the work.</p>
    </div>
{/if}

{#if clearing}
    <Modal title="Clear every receipt?" onclose={() => (clearing = false)} width="480px">
        <p class="modal-text">This deletes all receipts for your business, including receipt totals. It cannot be undone.</p>
        {#snippet actions()}
            <Button variant="secondary" onclick={() => (clearing = false)}>Keep receipts</Button>
            <Button variant="danger" loading={busy} onclick={clearAll}>Clear all receipts</Button>
        {/snippet}
    </Modal>
{/if}

<style>
    .search {
        display: flex;
        align-items: flex-end;
        gap: var(--au-s2);
        max-width: 48em;
        margin-bottom: var(--au-s4);
    }
    .search :global(.au-field) {
        flex: 1;
        margin-bottom: 3px;
    }
    .count {
        margin: 0 0 var(--au-s2);
    }
    .nowrap {
        white-space: nowrap;
    }
    .cell-none {
        text-align: right;
    }
    .modal-text {
        margin: 0;
    }
</style>
