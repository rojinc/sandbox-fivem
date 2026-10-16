<script>
    import { Button, Field, TextInput, Spinner, PageAlert } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import { money, formatNumber } from '../../../lib/format.js';

    /**
     * Run a customer's credit before a financed sale. `callback` is
     * PDMRunCredit (dealerships) or Dyn8RunCredit (real estate); both take
     * { term: State ID (number) } and answer { SID, name, price, score } or false.
     */
    let { callback = 'PDMRunCredit', what = 'a vehicle loan' } = $props();

    let sid = $state('');
    let error = $state(null);
    let result = $state(null);
    let failed = $state(false);
    let busy = $state(false);

    async function run() {
        error = null;
        failed = false;
        if (!/^\d+$/.test(sid.trim())) {
            error = 'Enter the customer\'s State ID, like 1042';
            return;
        }
        busy = true;
        // A number: the dealership callback reads it with math.tointeger.
        const res = await fetchNui(callback, { term: parseInt(sid, 10) });
        busy = false;
        if (res && typeof res === 'object' && res.SID !== undefined) result = res;
        else {
            result = null;
            failed = true;
        }
    }
</script>

<h3 class="heading">Credit check</h3>
<p class="lead">Check how much a customer can borrow for {what} before you start a financed sale.</p>
<form
    class="form"
    onsubmit={(e) => {
        e.preventDefault();
        run();
    }}
>
    <Field label="Customer State ID" id="credit-sid" {error}>
        <TextInput id="credit-sid" bind:value={sid} inputmode="numeric" width="12em" block={false} invalid={Boolean(error)} autocomplete="off" />
    </Field>
    <Button type="submit" loading={busy}>Run credit check</Button>
</form>

{#if busy}
    <div class="loading"><Spinner /> Checking credit</div>
{:else if failed}
    <PageAlert type="error" compact>No credit record for State ID {sid.trim()}. Check the number, and that you are on duty.</PageAlert>
{:else if result}
    <dl class="facts result">
        <div><dt>Customer</dt><dd>{result.name ?? 'Unknown'} (State ID {result.SID})</dd></div>
        <div><dt>Credit score</dt><dd>{formatNumber(result.score)}</dd></div>
        <div><dt>Loan they can get</dt><dd>{result.price ? `Up to ${money(result.price)}` : 'Not eligible for a loan now'}</dd></div>
    </dl>
{/if}

<style>
    .form {
        display: flex;
        align-items: flex-end;
        gap: var(--au-s3);
        margin-bottom: var(--au-s6);
    }
    .form :global(.au-field) {
        margin-bottom: 3px;
    }
    .result {
        max-width: 40em;
    }
</style>
