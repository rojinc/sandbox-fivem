<script>
    import { untrack } from 'svelte';
    import { Button, Field, TextInput, Select, Breadcrumbs, PageAlert, Spinner } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import RichEditor from '../../../components/common/RichEditor.svelte';
    import EmployeePicker from '../EmployeePicker.svelte';
    import { data, asList } from '../../../state/data.svelte.js';
    import { showAlert } from '../../../state/notify.svelte.js';
    import { cleanHtml } from '../../../lib/html.js';
    import { receiptTypes, amount } from '../receipts.js';

    /** Write a receipt, or edit one (params.id): BusinessReceiptCreate / BusinessReceiptUpdate. */
    let { params = {}, onnav } = $props();

    // The page is keyed on params.id, so the first value is the only one.
    const editing = untrack(() => Boolean(params.id));
    const types = $derived(receiptTypes(data.onDuty));

    let rec = $state({ type: 'General', customerName: '', customerNumber: '', paymentAmount: '', paymentPaid: '', workers: [], notes: '' });
    let loading = $state(editing);
    let missing = $state(false);
    let errors = $state({});
    let failure = $state(null);
    let busy = $state(false);

    async function load() {
        const res = await fetchNui('BusinessReceiptView', { id: params.id });
        if (res && typeof res === 'object' && res._id !== undefined) {
            rec = {
                ...res,
                type: res.type ?? 'General',
                customerName: res.customerName ?? '',
                customerNumber: res.customerNumber ?? '',
                paymentAmount: res.paymentAmount === undefined || res.paymentAmount === null ? '' : String(res.paymentAmount),
                paymentPaid: res.paymentPaid === undefined || res.paymentPaid === null ? '' : String(res.paymentPaid),
                workers: asList(res.workers),
                notes: res.notes ?? '',
            };
        } else missing = true;
        loading = false;
    }

    function money(field, label) {
        const raw = String(rec[field] ?? '').trim();
        if (!raw) return { value: '' };
        const n = amount(raw);
        if (n === null || n < 0) return { error: `Enter the ${label} in dollars, like 250` };
        return { value: n };
    }

    async function submit() {
        const e = {};
        if (!rec.customerName.trim()) e.customerName = "Enter the customer's name";
        const charged = money('paymentAmount', 'amount charged');
        const paid = money('paymentPaid', 'amount paid');
        if (charged.error) e.paymentAmount = charged.error;
        if (paid.error) e.paymentPaid = paid.error;
        errors = e;
        failure = null;
        if (Object.keys(e).length) return;
        const body = {
            type: rec.type,
            customerName: rec.customerName.trim(),
            customerNumber: rec.customerNumber.trim(),
            paymentAmount: charged.value,
            paymentPaid: paid.value,
            workers: rec.workers,
            notes: cleanHtml(rec.notes),
        };
        busy = true;
        if (editing) {
            const res = await fetchNui('BusinessReceiptUpdate', { id: rec._id, Report: { ...body, time: rec.time, author: rec.author } });
            busy = false;
            if (res === true) {
                showAlert('Receipt saved', 'success');
                onnav('View/Receipt', { id: rec._id });
            } else failure = 'The receipt was not saved. You may not have permission to change receipts.';
        } else {
            const res = await fetchNui('BusinessReceiptCreate', { doc: { ...body, time: Date.now() } });
            busy = false;
            if (res && typeof res === 'object' && res._id !== undefined) {
                showAlert('Receipt created', 'success');
                onnav('View/Receipt', { id: res._id });
            } else failure = 'The receipt was not created. You may not have permission to write receipts.';
        }
    }

    function cancel() {
        if (editing) onnav('View/Receipt', { id: params.id });
        else onnav('Search/Receipt');
    }

    if (editing) load();
</script>

<Breadcrumbs items={[{ label: 'Receipts', onclick: () => onnav('Search/Receipt') }, { label: editing ? 'Edit receipt' : 'New receipt' }]} />
<h3 class="heading">{editing ? 'Edit receipt' : 'New receipt'}</h3>

{#if loading}
    <div class="loading"><Spinner /> Loading receipt</div>
{:else if missing}
    <div class="state">
        <strong>This receipt could not be opened</strong>
        <p>It may have been deleted or cleared.</p>
        <Button variant="secondary" onclick={() => onnav('Search/Receipt')}>Back to receipts</Button>
    </div>
{:else}
    {#if failure}<PageAlert type="error" compact>{failure}</PageAlert>{/if}
    <form
        onsubmit={(e) => {
            e.preventDefault();
            submit();
        }}
    >
        <div class="split split--even">
            <div>
                <Field label="Receipt type" hint={editing ? 'The type cannot change after the receipt is written' : null} id="rec-type">
                    <Select id="rec-type" bind:value={rec.type} options={types.some((t) => t.value === rec.type) ? types : [{ value: rec.type, label: rec.type }, ...types]} disabled={editing} />
                </Field>
                <Field label="Customer name" id="rec-name" error={errors.customerName}>
                    <TextInput id="rec-name" bind:value={rec.customerName} invalid={Boolean(errors.customerName)} autocomplete="off" />
                </Field>
                <Field label="Customer phone number (optional)" id="rec-phone">
                    <TextInput id="rec-phone" bind:value={rec.customerNumber} inputmode="tel" width="14em" block={false} autocomplete="off" />
                </Field>
                <div class="amounts">
                    <Field label="Amount charged" hint="In dollars" id="rec-charged" error={errors.paymentAmount}>
                        <TextInput id="rec-charged" bind:value={rec.paymentAmount} inputmode="decimal" invalid={Boolean(errors.paymentAmount)} autocomplete="off" />
                    </Field>
                    <Field label="Amount paid" hint="In dollars" id="rec-paid" error={errors.paymentPaid}>
                        <TextInput id="rec-paid" bind:value={rec.paymentPaid} inputmode="decimal" invalid={Boolean(errors.paymentPaid)} autocomplete="off" />
                    </Field>
                </div>
            </div>
            <div>
                <EmployeePicker bind:value={rec.workers} />
            </div>
        </div>
        <RichEditor id="rec-notes" label="Notes (optional)" hint="Parts used, the vehicle, anything the next person should know" bind:value={rec.notes} minHeight="140px" />
        <div class="actions">
            <Button type="submit" loading={busy}>{editing ? 'Save receipt' : 'Create receipt'}</Button>
            <Button variant="tertiary" onclick={cancel}>Cancel</Button>
        </div>
    </form>
{/if}

<style>
    .amounts {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0 var(--au-s4);
    }
</style>
