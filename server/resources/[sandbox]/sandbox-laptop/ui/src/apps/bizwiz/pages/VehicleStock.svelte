<script>
    import { Button, Field, TextInput, Select, Radio, Modal, Spinner, PageAlert } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import { env } from '../../../state/env.svelte.js';
    import { asList } from '../../../state/data.svelte.js';
    import { showAlert } from '../../../state/notify.svelte.js';
    import { ago, money, formatNumber } from '../../../lib/format.js';
    import { CATEGORIES, categoryLabel, saleFigures } from '../dealer.js';
    import { serverMessage } from '../../../lib/messages.js';

    /**
     * Dealership stock (PDMGetStock): find a vehicle, start a test drive
     * (DealershipStartTestDrive) or sell it for cash or on a loan (PDMStartSale).
     */
    let stock = $state([]);
    let dealer = $state({});
    let interest = $state(15);
    let loading = $state(true);
    let failed = $state(false);
    let category = $state('all');
    let term = $state('');

    async function load() {
        loading = true;
        const res = await fetchNui('PDMGetStock', {});
        loading = false;
        if (res && typeof res === 'object' && res.stock !== undefined) {
            stock = asList(res.stock).filter((s) => s && s.data);
            dealer = res.dealerData && typeof res.dealerData === 'object' ? res.dealerData : {};
            interest = Number(res.interest) || 15;
            failed = false;
        } else failed = true;
    }

    const shown = $derived.by(() => {
        const q = term.trim().toLowerCase();
        return stock
            .filter((s) => category === 'all' || s.data.category === category)
            .filter((s) => !q || `${s.data.make} ${s.data.model}`.toLowerCase().includes(q))
            .sort((a, b) => (Number(a.data.price) || 0) - (Number(b.data.price) || 0));
    });

    const salePrice = (s) => saleFigures({ base: s.data.price, profitPercentage: dealer.profitPercentage }).sale;
    const name = (s) => `${s.data.make ?? ''} ${s.data.model ?? ''}`.trim();

    /* ------------------------------------------------------------ sell */
    let selling = $state(null);
    let sale = $state({ SID: '', type: 'loan', downpayment: '50', weeks: '8' });
    let saleError = $state(null);
    let failure = $state(null);
    let busy = $state(false);
    const DOWN = [25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80].map((v) => ({ value: String(v), label: `${v}%` }));
    const WEEKS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((v) => ({ value: String(v), label: `${v} weeks` }));
    const figures = $derived(
        selling
            ? saleFigures({ base: selling.data.price, profitPercentage: dealer.profitPercentage, commission: dealer.commission, interest, downPercent: Number(sale.downpayment), weeks: Number(sale.weeks) })
            : null,
    );

    function startSale(s) {
        sale = { SID: '', type: 'loan', downpayment: '50', weeks: '8' };
        saleError = null;
        failure = null;
        selling = s;
    }

    async function sell() {
        saleError = null;
        failure = null;
        if (!/^\d+$/.test(sale.SID.trim())) {
            saleError = "Enter the customer's State ID, like 1042";
            return;
        }
        busy = true;
        const res = await fetchNui('PDMStartSale', {
            type: sale.type,
            SID: parseInt(sale.SID, 10),
            downpayment: Number(sale.downpayment),
            weeks: Number(sale.weeks),
            vehicle: selling.vehicle,
        });
        busy = false;
        if (res && typeof res === 'object' && res.success) {
            showAlert(serverMessage(res.message, 'Sale started. The customer gets the offer now.'), 'success');
            selling = null;
            load();
        } else failure = serverMessage(res?.message, 'The sale did not start. The customer must be within 15 metres and the vehicle in stock.');
    }

    /* ------------------------------------------------------ test drive */
    let driving = $state(null);
    async function testDrive() {
        busy = true;
        const res = await fetchNui('DealershipStartTestDrive', { type: 'testdrive', vehicle: driving.vehicle, modelType: driving.modelType });
        busy = false;
        const v = driving;
        driving = null;
        if (res && typeof res === 'object' && res.success) showAlert(serverMessage(res.message, `The ${name(v)} is outside for the test drive`), 'success');
        else showAlert(serverMessage(res?.message, 'The test drive did not start. Try again.'), 'error');
    }

    load();
</script>

<div class="section-head">
    <h3 class="heading">Vehicle stock</h3>
    <Button variant="secondary" loading={loading} onclick={load}>Refresh stock</Button>
</div>

<div class="filters">
    <Field label="Category" id="stock-cat">
        <Select id="stock-cat" bind:value={category} options={CATEGORIES} />
    </Field>
    <Field label="Make or model" id="stock-term">
        <TextInput id="stock-term" bind:value={term} autocomplete="off" />
    </Field>
</div>

{#if loading && !stock.length}
    <div class="loading"><Spinner /> Loading stock</div>
{:else if failed}
    <PageAlert type="error" compact>The stock did not load. You need sales access at the dealership.</PageAlert>
{:else if shown.length}
    <p class="au-muted count" aria-live="polite">Showing {shown.length} of {stock.length} vehicles, cheapest first. Prices include the dealership's {formatNumber(dealer.profitPercentage ?? 0)}% margin.</p>
    <table class="au-table">
        <thead>
            <tr>
                <th scope="col">Vehicle</th>
                <th scope="col">Class</th>
                <th scope="col">Category</th>
                <th scope="col" class="is-numeric">Price</th>
                <th scope="col" class="is-numeric">In stock</th>
                <th scope="col">Last sold</th>
                <th scope="col" class="cell-actions"><span class="au-hidden">Actions</span></th>
            </tr>
        </thead>
        <tbody>
            {#each shown as s (s._id ?? s.vehicle)}
                <tr>
                    <td>{name(s)}</td>
                    <td>{s.data.class ?? ''}</td>
                    <td>{categoryLabel(s.data.category)}</td>
                    <td class="is-numeric">{money(salePrice(s))}</td>
                    <td class="is-numeric">{formatNumber(s.quantity)}</td>
                    <td class="nowrap">{s.lastPurchase ? ago(s.lastPurchase, env.now) : 'Never'}</td>
                    <td class="cell-actions">
                        <div class="actions actions--end">
                            <Button variant="secondary" size="sm" disabled={!(Number(s.quantity) > 0)} onclick={() => startSale(s)}>Sell</Button>
                            <Button variant="tertiary" size="sm" onclick={() => (driving = s)}>Test drive</Button>
                        </div>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
{:else if stock.length}
    <p class="au-muted">No vehicles match. Choose another category or clear the search.</p>
{:else}
    <div class="state">
        <strong>No stock</strong>
        <p>Vehicles appear here once the dealership has stock delivered.</p>
    </div>
{/if}

{#if selling && figures}
    <Modal title="Sell the {name(selling)}" onclose={() => (selling = null)} width="620px">
        {#if failure}<PageAlert type="error" compact>{failure}</PageAlert>{/if}
        <Field label="Customer State ID" hint="The customer must be with you" id="sale-sid" error={saleError}>
            <TextInput id="sale-sid" bind:value={sale.SID} inputmode="numeric" width="12em" block={false} invalid={Boolean(saleError)} autocomplete="off" />
        </Field>
        <fieldset class="pay">
            <legend class="pay__legend">Payment</legend>
            <Radio bind:group={sale.type} value="full" name="sale-type" label="Cash" />
            <Radio bind:group={sale.type} value="loan" name="sale-type" label="Loan" />
        </fieldset>
        {#if sale.type === 'loan'}
            <div class="form-grid">
                <Field label="Down payment" id="sale-down">
                    <Select id="sale-down" bind:value={sale.downpayment} options={DOWN} />
                </Field>
                <Field label="Loan length" id="sale-weeks">
                    <Select id="sale-weeks" bind:value={sale.weeks} options={WEEKS} />
                </Field>
            </div>
        {/if}
        <dl class="facts">
            <div><dt>Sale price</dt><dd>{money(figures.sale)}</dd></div>
            {#if sale.type === 'loan'}
                <div><dt>Paid today</dt><dd>{money(figures.down)}</dd></div>
                <div><dt>Owed with {interest}% interest</dt><dd>{money(figures.owed)}</dd></div>
                <div><dt>Each week</dt><dd>{money(figures.weekly)} for {sale.weeks} weeks</dd></div>
            {/if}
            <div><dt>Your commission</dt><dd>{money(figures.commission)}</dd></div>
        </dl>
        {#snippet actions()}
            <Button variant="secondary" onclick={() => (selling = null)}>Cancel</Button>
            <Button loading={busy} onclick={sell}>Start sale</Button>
        {/snippet}
    </Modal>
{/if}

{#if driving}
    <Modal title="Test drive the {name(driving)}?" onclose={() => (driving = null)} width="480px">
        <p class="modal-text">The vehicle is brought out front for the customer to drive.</p>
        {#snippet actions()}
            <Button variant="secondary" onclick={() => (driving = null)}>Cancel</Button>
            <Button loading={busy} onclick={testDrive}>Start test drive</Button>
        {/snippet}
    </Modal>
{/if}

<style>
    .filters {
        display: grid;
        grid-template-columns: 16em minmax(0, 24em);
        gap: 0 var(--au-s4);
        align-items: end;
    }
    .count {
        margin: 0 0 var(--au-s2);
    }
    .nowrap {
        white-space: nowrap;
    }
    .pay {
        border: 0;
        margin: 0 0 var(--au-s4);
        padding: 0;
        display: flex;
        gap: var(--au-s6);
    }
    .pay__legend {
        padding: 0;
        font-weight: 700;
        margin-bottom: var(--au-s2);
    }
    .modal-text {
        margin: 0;
    }
</style>
