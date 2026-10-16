<script>
    import { Button, Modal, Breadcrumbs, Spinner } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import { asList } from '../../../state/data.svelte.js';
    import { showAlert } from '../../../state/notify.svelte.js';
    import { hasJobPerm } from '../../../lib/perms.js';
    import { formatDateTime, person, money } from '../../../lib/format.js';
    import { cleanHtml, isBlank } from '../../../lib/html.js';

    /** One receipt (BusinessReceiptView). */
    let { params = {}, onnav } = $props();

    let rec = $state(null);
    let loading = $state(true);
    let deleting = $state(false);
    let busy = $state(false);
    const canManage = $derived(hasJobPerm('TABLET_MANAGE_RECEIPT'));
    const workers = $derived(asList(rec?.workers));

    async function load() {
        loading = true;
        const res = params.id ? await fetchNui('BusinessReceiptView', { id: params.id }) : null;
        rec = res && typeof res === 'object' && !Array.isArray(res) && res._id !== undefined ? res : null;
        loading = false;
    }

    async function remove() {
        busy = true;
        const res = await fetchNui('BusinessReceiptDelete', { id: rec._id });
        busy = false;
        deleting = false;
        if (res === true) {
            showAlert('Receipt deleted', 'success');
            onnav('Search/Receipt');
        } else showAlert('The receipt was not deleted. Try again.', 'error');
    }

    load();
</script>

<Breadcrumbs items={[{ label: 'Receipts', onclick: () => onnav('Search/Receipt') }, { label: rec ? `Receipt for ${rec.customerName || 'no name'}` : 'Receipt' }]} />

{#if loading}
    <div class="loading"><Spinner /> Loading receipt</div>
{:else if !rec}
    <div class="state">
        <strong>This receipt could not be opened</strong>
        <p>It may have been deleted or cleared.</p>
        <Button variant="secondary" onclick={() => onnav('Search/Receipt')}>Back to receipts</Button>
    </div>
{:else}
    <div class="section-head">
        <h3 class="heading">Receipt for {rec.customerName || 'no name'}</h3>
        {#if canManage}
            <div class="actions">
                <Button onclick={() => onnav('Create/Receipt', { id: rec._id })}>Edit receipt</Button>
                <Button variant="secondary" onclick={() => (deleting = true)}>Delete receipt</Button>
            </div>
        {/if}
    </div>
    <dl class="facts">
        <div><dt>Type</dt><dd>{rec.type ?? 'General'}</dd></div>
        <div><dt>Customer</dt><dd>{rec.customerName || 'Not recorded'}</dd></div>
        <div><dt>Phone number</dt><dd>{rec.customerNumber || 'Not recorded'}</dd></div>
        <div><dt>Charged</dt><dd>{money(rec.paymentAmount)}</dd></div>
        <div><dt>Paid</dt><dd>{money(rec.paymentPaid)}</dd></div>
        <div><dt>Written by</dt><dd>{person(rec.author)}{rec.author?.SID ? ` (State ID ${rec.author.SID})` : ''} on {formatDateTime(rec.time)}</dd></div>
        <div>
            <dt>Other employees</dt>
            <dd>
                {#if workers.length}
                    {#each workers as w, i (w.SID)}{i > 0 ? ', ' : ''}{person(w)} ({w.SID}){/each}
                {:else}
                    None
                {/if}
            </dd>
        </div>
        {#if rec.lastUpdated}
            <div><dt>Last updated</dt><dd>{formatDateTime(rec.lastUpdated.Time)} by {person(rec.lastUpdated)}</dd></div>
        {/if}
    </dl>
    <h4 class="subheading">Notes</h4>
    {#if isBlank(rec.notes)}
        <p class="au-muted">No notes on this receipt.</p>
    {:else}
        <div class="user-html">{@html cleanHtml(rec.notes)}</div>
    {/if}
{/if}

{#if deleting && rec}
    <Modal title="Delete this receipt?" onclose={() => (deleting = false)} width="460px">
        <p class="modal-text">The receipt for {rec.customerName || 'no name'} is removed from receipt totals too. This cannot be undone.</p>
        {#snippet actions()}
            <Button variant="secondary" onclick={() => (deleting = false)}>Keep receipt</Button>
            <Button variant="danger" loading={busy} onclick={remove}>Delete receipt</Button>
        {/snippet}
    </Modal>
{/if}

<style>
    .modal-text {
        margin: 0;
    }
</style>
