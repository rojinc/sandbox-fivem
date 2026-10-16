<script>
    import { Button, Field, Select, Spinner, PageAlert } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import { showAlert } from '../../../state/notify.svelte.js';

    /** The dealership's margin and sales commission (PDMGetDealerData / PDMSaveDealerData). */
    const OPTIONS = [5, 10, 15].map((v) => ({ value: String(v), label: `${v}%` }));

    let data = $state(null);
    let form = $state({ profitPercentage: '10', commission: '10' });
    let loading = $state(true);
    let failed = $state(false);
    let busy = $state(false);
    let failure = $state(null);

    const pick = (v) => String(OPTIONS.some((o) => o.value === String(v)) ? v : 10);

    async function load() {
        loading = true;
        const res = await fetchNui('PDMGetDealerData', {});
        loading = false;
        if (res && typeof res === 'object' && !Array.isArray(res)) {
            data = res;
            form = { profitPercentage: pick(res.profitPercentage), commission: pick(res.commission) };
            failed = false;
        } else failed = true;
    }

    async function save() {
        busy = true;
        failure = null;
        const res = await fetchNui('PDMSaveDealerData', { data: { ...data, profitPercentage: Number(form.profitPercentage), commission: Number(form.commission) } });
        busy = false;
        if (res && typeof res === 'object') {
            data = res;
            showAlert('Dealership settings saved', 'success');
        } else failure = 'The settings were not saved. Only management can change them.';
    }

    load();
</script>

<h3 class="heading">Dealership settings</h3>
<p class="lead">The margin is added to the base price of every vehicle. Salespeople earn the commission share of that margin on each sale.</p>

{#if loading}
    <div class="loading"><Spinner /> Loading settings</div>
{:else if failed}
    <PageAlert type="error" compact>The settings did not load. Only management can see them.</PageAlert>
{:else}
    {#if failure}<PageAlert type="error" compact>{failure}</PageAlert>{/if}
    <form
        class="form"
        onsubmit={(e) => {
            e.preventDefault();
            save();
        }}
    >
        <Field label="Dealership margin" hint="Added to each vehicle's base price" id="dealer-profit">
            <Select id="dealer-profit" bind:value={form.profitPercentage} options={OPTIONS} block={false} />
        </Field>
        <Field label="Salesperson commission" hint="The share of the margin the seller keeps" id="dealer-commission">
            <Select id="dealer-commission" bind:value={form.commission} options={OPTIONS} block={false} />
        </Field>
        <Button type="submit" loading={busy}>Save settings</Button>
    </form>
{/if}

<style>
    .form {
        max-width: 32em;
    }
    .form :global(.au-select-wrap) {
        min-width: 10em;
    }
</style>
