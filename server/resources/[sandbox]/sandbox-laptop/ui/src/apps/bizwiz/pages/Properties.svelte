<script>
    import { Button, Field, TextInput, Select, Radio, Modal, Spinner, PageAlert, Breadcrumbs, Tag } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import { asList, asMap } from '../../../state/data.svelte.js';
    import { showAlert } from '../../../state/notify.svelte.js';
    import { money, person } from '../../../lib/format.js';
    import { serverMessage } from '../../../lib/messages.js';
    import { saleFigures } from '../dealer.js';

    /**
     * Dynasty 8 properties (Dyn8SearchProperties): find a property, sell it
     * (Dyn8StartSale) or transfer it (Dyn8StartTransfer), mark it on the GPS,
     * and move its entrances (Dyn8ShowPropertyLocations / Dyn8ChangePropertyLocations).
     */
    const TYPES = [
        { value: 'all', label: 'All types' },
        { value: 'house', label: 'Houses' },
        { value: 'office', label: 'Offices' },
        { value: 'warehouse', label: 'Warehouses' },
    ];
    const TYPE_LABEL = { house: 'House', office: 'Office', warehouse: 'Warehouse' };
    const ENTRANCES = [
        { value: 'front', label: 'Front door' },
        { value: 'garage', label: 'Garage' },
        { value: 'backdoor', label: 'Back door' },
    ];
    const INTEREST = 15;
    const COMMISSION = 5;

    let props = $state([]);
    let upgrades = $state({});
    let loading = $state(true);
    let failed = $state(false);
    let type = $state('all');
    let term = $state('');
    let openId = $state(null);
    let busy = $state(false);

    async function load() {
        loading = true;
        const res = await fetchNui('Dyn8SearchProperties', {});
        loading = false;
        if (res && typeof res === 'object' && res.properties !== undefined) {
            props = asList(res.properties);
            upgrades = asMap(res.upgrades);
            failed = false;
        } else failed = true;
    }

    const shown = $derived.by(() => {
        const q = term.trim().toLowerCase();
        return props
            .filter((p) => type === 'all' || p.type === type)
            .filter((p) => !q || String(p.label ?? '').toLowerCase().includes(q) || (p.owner && `${person(p.owner)} ${p.owner.SID}`.toLowerCase().includes(q)))
            .sort((a, b) => Number(Boolean(a.sold)) - Number(Boolean(b.sold)) || (Number(a.price) || 0) - (Number(b.price) || 0));
    });
    const open = $derived(props.find((p) => p._id === openId) ?? null);

    function interior(p) {
        const levels = asList(upgrades[p?.type]?.interior?.levels);
        return levels.find((l) => l.id == p?.upgrades?.interior) ?? null;
    }

    function otherUpgrades(p) {
        const set = asMap(upgrades[p?.type]);
        return Object.entries(set)
            .filter(([k]) => k !== 'interior')
            .map(([k, u]) => {
                const level = Number(asMap(p?.upgrades)[k]) || 1;
                const l = asList(u.levels)[level - 1];
                return { key: k, name: u.name ?? k, level: l?.name ?? `Level ${level}`, info: typeof l?.info === 'string' ? l.info : '' };
            });
    }

    async function markGps(p) {
        const res = await fetchNui('Dyn8MarkProperty', p._id);
        if (res === true) showAlert(`${p.label} marked on your GPS`, 'success');
        else showAlert('The property could not be marked. Try again.', 'error');
    }

    async function copyId(p) {
        const res = await fetchNui('Dyn8CopyID', p._id);
        if (res === true) showAlert('Property ID copied', 'success');
        else showAlert('The ID could not be copied.', 'error');
    }

    async function toggleBlips() {
        await fetchNui('Dyn8ToggleBlips', {});
        showAlert('Property blips switched on the map', 'success');
    }

    /* ----------------------------------------------------- selling */
    let selling = $state(null);
    let sale = $state({ SID: '', type: 'loan', downpayment: '50', weeks: '8' });
    let saleError = $state(null);
    let failure = $state(null);
    const DOWN = Array.from({ length: 14 }, (_, i) => 15 + i * 5).map((v) => ({ value: String(v), label: `${v}%` }));
    const WEEKS = Array.from({ length: 17 }, (_, i) => 8 + i).map((v) => ({ value: String(v), label: `${v} weeks` }));
    const figures = $derived(selling ? saleFigures({ base: selling.price, commission: 0, interest: INTEREST, downPercent: Number(sale.downpayment), weeks: Number(sale.weeks) }) : null);

    function startSale(p) {
        sale = { SID: '', type: 'loan', downpayment: '50', weeks: '8' };
        saleError = null;
        failure = null;
        selling = p;
    }

    async function sell() {
        saleError = null;
        failure = null;
        if (!/^\d+$/.test(sale.SID.trim())) {
            saleError = "Enter the buyer's State ID, like 1042";
            return;
        }
        busy = true;
        const res = await fetchNui('Dyn8StartSale', { type: sale.type, SID: parseInt(sale.SID, 10), downpayment: Number(sale.downpayment), weeks: Number(sale.weeks), property: selling._id });
        busy = false;
        if (res && typeof res === 'object' && res.success) {
            showAlert(serverMessage(res.message, 'Offer sent to the buyer'), 'success');
            selling = null;
            load();
        } else failure = serverMessage(res?.message, 'The offer was not sent. Check the State ID and try again.');
    }

    /* ---------------------------------------------------- transfer */
    let transferring = $state(null);
    let transferSid = $state('');
    let transferError = $state(null);

    async function transfer() {
        transferError = null;
        if (!/^\d+$/.test(transferSid.trim())) {
            transferError = "Enter the new owner's State ID, like 1042";
            return;
        }
        busy = true;
        const res = await fetchNui('Dyn8StartTransfer', { SID: parseInt(transferSid, 10), property: transferring._id });
        busy = false;
        if (res && typeof res === 'object' && res.success) {
            showAlert(serverMessage(res.message, 'Property transferred'), 'success');
            transferring = null;
            load();
        } else transferError = serverMessage(res?.message, 'The transfer did not go through. Check the State ID and try again.');
    }

    /* --------------------------------------------------- entrances */
    let entrance = $state('front');
    async function showEntrances(p) {
        const res = await fetchNui('Dyn8ShowPropertyLocations', { property: p._id });
        if (res === true) showAlert('Entrances are marked around you for 30 seconds', 'success');
        else showAlert('The entrances could not be shown.', 'error');
    }
    async function moveEntrance(p) {
        busy = true;
        const res = await fetchNui('Dyn8ChangePropertyLocations', { property: p._id, location: entrance });
        busy = false;
        const label = ENTRANCES.find((e) => e.value === entrance)?.label ?? 'Entrance';
        if (res === true) showAlert(`${label} moved to where you stand`, 'success');
        else showAlert(`The ${label.toLowerCase()} was not moved. Stand where it should be and try again.`, 'error');
    }

    load();
</script>

{#if open}
    {@const int = interior(open)}
    <Breadcrumbs items={[{ label: 'Properties', onclick: () => (openId = null) }, { label: open.label }]} />
    <div class="section-head">
        <h3 class="heading">{open.label}</h3>
        <div class="actions">
            {#if open.sold}
                <Button onclick={() => ((transferring = open), (transferSid = ''), (transferError = null))}>Transfer property</Button>
            {:else}
                <Button onclick={() => startSale(open)}>Sell property</Button>
            {/if}
            <Button variant="secondary" onclick={() => markGps(open)}>Mark on GPS</Button>
        </div>
    </div>
    <dl class="facts">
        <div><dt>Type</dt><dd>{TYPE_LABEL[open.type] ?? 'Other'}</dd></div>
        <div><dt>Price</dt><dd>{money(open.price)}</dd></div>
        <div><dt>Owner</dt><dd>{open.owner ? `${person(open.owner)} (State ID ${open.owner.SID})` : 'For sale'}</dd></div>
        <div><dt>Interior</dt><dd>{int ? `${int.name}${int.info?.description ? `. ${int.info.description}` : ''}` : 'Unknown'}</dd></div>
        {#each otherUpgrades(open) as u (u.key)}
            <div><dt>{u.name}</dt><dd>{u.level}{u.info ? `. ${u.info}` : ''}</dd></div>
        {/each}
        <div><dt>Property ID</dt><dd><span class="au-mono">{open._id}</span> <Button variant="tertiary" size="sm" onclick={() => copyId(open)}>Copy ID</Button></dd></div>
    </dl>

    <section class="section entrances" aria-labelledby="ent-h">
        <h4 class="subheading" id="ent-h">Entrances</h4>
        <p class="lead">Stand where an entrance should be, choose it, and move it to your position.</p>
        <div class="entrance-form">
            <Field label="Entrance" id="ent-which">
                <Select id="ent-which" bind:value={entrance} options={ENTRANCES} />
            </Field>
            <Button variant="secondary" loading={busy} onclick={() => moveEntrance(open)}>Move to where I stand</Button>
            <Button variant="tertiary" onclick={() => showEntrances(open)}>Show entrances</Button>
        </div>
    </section>
{:else}
    <div class="section-head">
        <h3 class="heading">Properties</h3>
        <Button variant="secondary" onclick={toggleBlips}>Show or hide map blips</Button>
    </div>
    <div class="filters">
        <Field label="Type" id="prop-type">
            <Select id="prop-type" bind:value={type} options={TYPES} />
        </Field>
        <Field label="Find a property" hint="Name, owner or owner's State ID" id="prop-term">
            <TextInput id="prop-term" bind:value={term} autocomplete="off" />
        </Field>
    </div>

    {#if loading && !props.length}
        <div class="loading"><Spinner /> Loading properties</div>
    {:else if failed}
        <PageAlert type="error" compact>The properties did not load. Try again in a moment.</PageAlert>
    {:else if shown.length}
        <p class="au-muted count" aria-live="polite">Showing {shown.length} of {props.length} properties, for sale first, cheapest first.</p>
        <table class="au-table">
            <thead>
                <tr>
                    <th scope="col">Property</th>
                    <th scope="col">Type</th>
                    <th scope="col" class="is-numeric">Price</th>
                    <th scope="col">Owner</th>
                    <th scope="col" class="cell-actions"><span class="au-hidden">Actions</span></th>
                </tr>
            </thead>
            <tbody>
                {#each shown as p (p._id)}
                    <tr>
                        <td><button type="button" class="row-link" onclick={() => (openId = p._id)}>{p.label}</button></td>
                        <td>{TYPE_LABEL[p.type] ?? 'Other'}</td>
                        <td class="is-numeric">{money(p.price)}</td>
                        <td>{#if p.owner}{person(p.owner)}{:else}<Tag tone="success">For sale</Tag>{/if}</td>
                        <td class="cell-actions">
                            <div class="actions actions--end">
                                {#if p.sold}
                                    <Button variant="secondary" size="sm" onclick={() => ((transferring = p), (transferSid = ''), (transferError = null))}>Transfer</Button>
                                {:else}
                                    <Button variant="secondary" size="sm" onclick={() => startSale(p)}>Sell</Button>
                                {/if}
                                <Button variant="tertiary" size="sm" onclick={() => markGps(p)}>Mark on GPS</Button>
                            </div>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {:else if props.length}
        <p class="au-muted">No property matches. Choose another type or change the search.</p>
    {:else}
        <div class="state">
            <strong>No properties</strong>
            <p>Properties appear here once they are added to the city.</p>
        </div>
    {/if}
{/if}

{#if selling && figures}
    <Modal title="Sell {selling.label}" onclose={() => (selling = null)} width="620px">
        {#if failure}<PageAlert type="error" compact>{failure}</PageAlert>{/if}
        <Field label="Buyer's State ID" id="psale-sid" error={saleError}>
            <TextInput id="psale-sid" bind:value={sale.SID} inputmode="numeric" width="12em" block={false} invalid={Boolean(saleError)} autocomplete="off" />
        </Field>
        <fieldset class="pay">
            <legend class="pay__legend">Payment</legend>
            <Radio bind:group={sale.type} value="full" name="psale-type" label="Cash" />
            <Radio bind:group={sale.type} value="loan" name="psale-type" label="Loan" />
        </fieldset>
        {#if sale.type === 'loan'}
            <div class="form-grid">
                <Field label="Down payment" id="psale-down">
                    <Select id="psale-down" bind:value={sale.downpayment} options={DOWN} />
                </Field>
                <Field label="Loan length" id="psale-weeks">
                    <Select id="psale-weeks" bind:value={sale.weeks} options={WEEKS} />
                </Field>
            </div>
        {/if}
        <dl class="facts">
            <div><dt>Price</dt><dd>{money(figures.sale)}</dd></div>
            {#if sale.type === 'loan'}
                <div><dt>Paid today</dt><dd>{money(figures.down)}</dd></div>
                <div><dt>Owed with {INTEREST}% interest</dt><dd>{money(figures.owed)}</dd></div>
                <div><dt>Each week</dt><dd>{money(figures.weekly)} for {sale.weeks} weeks</dd></div>
            {/if}
            <div><dt>Your commission</dt><dd>{money(Math.ceil((Number(selling.price) || 0) * (COMMISSION / 100)))}</dd></div>
        </dl>
        {#snippet actions()}
            <Button variant="secondary" onclick={() => (selling = null)}>Cancel</Button>
            <Button loading={busy} onclick={sell}>Send offer to buyer</Button>
        {/snippet}
    </Modal>
{/if}

{#if transferring}
    <Modal title="Transfer {transferring.label}" onclose={() => (transferring = null)} width="520px">
        <p class="modal-text">Ask the owner to take their belongings and vehicles out first. They stay with the property.</p>
        <Field label="New owner's State ID" id="ptransfer-sid" error={transferError}>
            <TextInput id="ptransfer-sid" bind:value={transferSid} inputmode="numeric" width="12em" block={false} invalid={Boolean(transferError)} autocomplete="off" />
        </Field>
        {#snippet actions()}
            <Button variant="secondary" onclick={() => (transferring = null)}>Cancel</Button>
            <Button loading={busy} onclick={transfer}>Transfer property</Button>
        {/snippet}
    </Modal>
{/if}

<style>
    .filters {
        display: grid;
        grid-template-columns: 14em minmax(0, 24em);
        gap: 0 var(--au-s4);
        align-items: end;
    }
    .count {
        margin: 0 0 var(--au-s2);
    }
    .entrance-form {
        display: flex;
        align-items: flex-end;
        gap: var(--au-s3);
    }
    .entrance-form :global(.au-field) {
        width: 14em;
        margin-bottom: 3px;
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
        margin: 0 0 var(--au-s4);
    }
</style>
