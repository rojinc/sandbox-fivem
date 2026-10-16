<script>
    import { onMount } from 'svelte';
    import { Button, EmptyState, Field, PageAlert, Spinner, Tag, TextInput } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import AppPage from '../../components/common/AppPage.svelte';
    import Sheet from '../../components/common/Sheet.svelte';
    import { data, setData } from '../../state/data.svelte.js';
    import { openApp } from '../../state/router.svelte.js';
    import { showAlert } from '../../state/notify.svelte.js';
    import { stamp, plain } from '../../lib/format.js';

    /** Loans: your vehicle and property loans (root), one loan (view/:id) with payments. Interest is added as before. */
    let { app, segs = [] } = $props();

    let loading = $state(false);
    let failed = $state(false);
    async function load() {
        if (loading) return;
        loading = true;
        failed = false;
        try {
            const res = await fetchNui('Loans:GetData');
            if (!res || typeof res !== 'object') throw new Error('loans');
            setData('loansData', { creditScore: res.creditScore ?? 0, loans: Array.isArray(res.loans) ? res.loans : Object.values(res.loans ?? {}) });
        } catch {
            failed = true;
        }
        loading = false;
    }
    onMount(load);

    const loans = $derived((data.loansData?.loans ?? []).filter(Boolean).sort((a, b) => Number(a.NextPayment) - Number(b.NextPayment)));
    const loan = $derived(segs[0] === 'view' ? (loans.find((l) => String(l._id) === String(segs[1])) ?? null) : null);

    const usd = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(n) || 0);
    const kind = (t) => (t === 'vehicle' ? 'Vehicle' : t === 'property' ? 'Property' : 'Asset');
    const idLabel = (t) => (t === 'vehicle' ? 'Vehicle VIN' : t === 'property' ? 'Property ID' : 'Asset ID');
    const mult = (l) => (100 + (Number(l.InterestRate) || 0)) / 100;
    const owed = (l) => (l.Remaining > 0 ? Math.ceil(l.Remaining * mult(l)) : 0);
    const left = (l) => (Number(l.TotalPayments) || 0) - (Number(l.PaidPayments) || 0);
    function nextAmount(l, weeks = 1) {
        if (!(l.Remaining > 0)) return 0;
        let w = weeks;
        if (l.MissedPayments > 1 && w === 1) w = l.MissedPayments;
        w = Math.min(w, left(l));
        return Math.ceil((l.Remaining / Math.max(1, left(l))) * w * mult(l));
    }
    function status(l) {
        if (l.Defaulted) return { text: 'Defaulted', tone: 'error' };
        if (l.MissedPayments > 0) return { text: `${l.MissedPayments} missed`, tone: 'warning' };
        if (!(l.Remaining > 0)) return { text: 'Paid off', tone: 'success' };
        return { text: 'On track', tone: 'default' };
    }

    let paying = $state(null); // { ahead, weeks, min }
    let weeksError = $state('');
    let busy = $state(false);
    function startPay(ahead) {
        const min = ahead && loan.MissedPayments > 1 ? Math.min(loan.MissedPayments, left(loan)) : 1;
        paying = { ahead, weeks: String(min), min };
        weeksError = '';
    }
    async function pay() {
        const w = Number(paying.weeks);
        if (!Number.isInteger(w) || w < paying.min || w > left(loan)) {
            weeksError = `Enter a number of weeks from ${paying.min} to ${left(loan)}.`;
            return;
        }
        busy = true;
        try {
            const res = await fetchNui('Loans:Payment', { loan: loan._id, weeks: w, paymentAhead: paying.ahead });
            if (res?.success) {
                showAlert(res.paidOff ? 'Loan paid off' : `Payment of ${usd(res.paymentAmount)} made`, 'success');
                paying = null;
                load();
            } else showAlert(plain(res?.message) || 'The payment did not go through. Check your bank balance.', 'error');
        } catch {
            showAlert('The payment did not go through. Try again.', 'error');
        }
        busy = false;
    }
</script>

{#if segs[0] === 'view'}
    <AppPage title={loan ? `${kind(loan.Type)} loan` : 'Loan'}>
        {#if loan}
            {@const st = status(loan)}
            {#if loan.Defaulted}
                <div class="ph-pad top"><PageAlert type="error" title="This loan has defaulted">You missed too many payments. Pay what is owed to keep the {kind(loan.Type).toLowerCase()}.</PageAlert></div>
            {:else if loan.MissedPayments > 0}
                <div class="ph-pad top"><PageAlert type="warning" title="You missed {loan.MissedPayments} {loan.MissedPayments === 1 ? 'payment' : 'payments'}">The loan defaults after {loan.MissablePayments} missed payments.</PageAlert></div>
            {/if}
            <dl class="ph-facts">
                <div><dt>Status</dt><dd><Tag tone={st.tone}>{st.text}</Tag></dd></div>
                <div><dt>Still owed</dt><dd class="strong">{usd(owed(loan))}</dd></div>
                {#if loan.Remaining > 0}
                    <div><dt>Next payment</dt><dd>{usd(nextAmount(loan))} by {stamp(loan.NextPayment)}</dd></div>
                {/if}
                <div><dt>{idLabel(loan.Type)}</dt><dd class="au-mono">{loan.AssetIdentifier}</dd></div>
                <div><dt>Loan total</dt><dd>{usd(loan.Total)}</dd></div>
                <div><dt>Down payment</dt><dd>{usd(loan.DownPayment)}</dd></div>
                <div><dt>Paid so far</dt><dd>{usd(loan.Paid)}</dd></div>
                <div><dt>Payments</dt><dd>{loan.PaidPayments} of {loan.TotalPayments}</dd></div>
                <div><dt>Interest</dt><dd>{Number(loan.InterestRate) || 0}%</dd></div>
            </dl>
            {#if loan.Remaining > 0}
                <div class="ph-actions">
                    <Button onclick={() => startPay(false)}>Pay {usd(nextAmount(loan))} now</Button>
                    {#if !loan.Defaulted && left(loan) > 1}<Button variant="secondary" onclick={() => startPay(true)}>Pay weeks ahead</Button>{/if}
                </div>
            {/if}
        {:else}
            <div class="ph-pad">
                <p>This loan is not on your record any more.</p>
                <Button variant="secondary" onclick={() => openApp('loans')}>See your loans</Button>
            </div>
        {/if}
    </AppPage>
    <Sheet open={Boolean(paying)} title={paying?.ahead ? 'Pay weeks ahead' : 'Make a payment'} onclose={() => (paying = null)}>
        {#if paying && loan}
            {#if paying.ahead}
                <Field label="Weeks to pay" hint="Up to {left(loan)} weeks" id="ln-weeks" error={weeksError}>
                    <TextInput id="ln-weeks" bind:value={paying.weeks} inputmode="numeric" maxlength="3" width="30%" block={false} invalid={Boolean(weeksError)} />
                </Field>
            {/if}
            <p>You pay <strong>{usd(nextAmount(loan, Number(paying.weeks) || 1))}</strong> from your current account.</p>
        {/if}
        {#snippet actions()}
            <Button loading={busy} onclick={pay}>Make payment</Button>
            <Button variant="secondary" onclick={() => (paying = null)}>Cancel</Button>
        {/snippet}
    </Sheet>
{:else}
    <AppPage title={app?.label ?? 'Loans'}>
        {#snippet actions()}
            <Button size="sm" variant="secondary" {loading} onclick={load}>Refresh</Button>
        {/snippet}
        {#if data.loansData}
            <dl class="ph-facts"><div><dt>Credit score</dt><dd class="strong">{data.loansData.creditScore ?? 0}</dd></div></dl>
            <p class="ph-note">Paying on time or early raises your score. Missed payments lower it.</p>
        {/if}
        {#if loading && !loans.length}
            <p class="ph-note state"><Spinner size={18} /> Loading your loans</p>
        {:else if failed}
            <div class="ph-pad">
                <p class="err" role="alert">Your loans could not be loaded.</p>
                <Button variant="secondary" onclick={load}>Try again</Button>
            </div>
        {:else if loans.length}
            <ul class="ph-list">
                {#each loans as l (l._id)}
                    {@const st = status(l)}
                    <li>
                        <button type="button" class="ph-row" onclick={() => openApp('loans', `view/${l._id}`)}>
                            <span class="ph-row__main">
                                <span class="ph-row__title">{kind(l.Type)} loan, {usd(owed(l))} owed</span>
                                <span class="ph-row__sub">{l.Remaining > 0 ? `Next payment ${stamp(l.NextPayment)}` : 'Nothing left to pay'}</span>
                            </span>
                            <span class="ph-row__side"><Tag tone={st.tone}>{st.text}</Tag></span>
                        </button>
                    </li>
                {/each}
            </ul>
        {:else}
            <EmptyState title="No loans">Loans for vehicles and property you finance show here.</EmptyState>
        {/if}
    </AppPage>
{/if}

<style>
    .top {
        padding-bottom: 0;
    }
    .strong {
        font-weight: 700;
    }
    .state {
        display: flex;
        align-items: center;
        gap: var(--au-s2);
    }
    .err {
        color: var(--au-error);
        font-weight: 700;
    }
</style>
