<script>
    import { Button, EmptyState, Field, Select } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import AppPage from '../../components/common/AppPage.svelte';
    import Sheet from '../../components/common/Sheet.svelte';
    import { showAlert } from '../../state/notify.svelte.js';
    import { when, plain } from '../../lib/format.js';
    import { clock } from '../../state/clock.svelte.js';
    import { accounts, bills, accountName, sortAccounts, dollars, bankTime, loadBank, bank } from './bank.svelte.js';

    /** Bills people sent you: pay one from an account you can spend from, or decline it. */
    const due = $derived(bills().slice().sort((a, b) => bankTime(b.Timestamp) - bankTime(a.Timestamp)));
    const payable = $derived(sortAccounts(accounts()).filter((a) => a.Permissions?.WITHDRAW));

    let paying = $state(null);
    let from = $state('');
    let error = $state('');
    let busy = $state(false);

    function startPay(b) {
        paying = b;
        from = String(payable[0]?.Account ?? '');
        error = '';
    }

    async function pay() {
        const acc = payable.find((a) => String(a.Account) === String(from));
        if (!acc) {
            error = 'Choose an account to pay from.';
            return;
        }
        if (Number(acc.Balance) < Number(paying.Amount)) {
            error = `${accountName(acc)} holds ${dollars(acc.Balance)}. Choose another account or add money first.`;
            return;
        }
        busy = true;
        try {
            const ok = await fetchNui('Banking:AcceptBill', { bill: paying.Id, account: acc.Account });
            showAlert(ok ? 'Bill paid' : 'The bill could not be paid. Try again.', ok ? 'success' : 'error');
            if (ok) paying = null;
        } catch {
            showAlert('The bill could not be paid. Try again.', 'error');
        }
        busy = false;
        setTimeout(loadBank, 750);
    }

    async function decline(b) {
        try {
            const ok = await fetchNui('Banking:DismissBill', { bill: b.Id });
            showAlert(ok ? 'Bill declined' : 'The bill could not be declined. Try again.', ok ? 'success' : 'error');
        } catch {
            showAlert('The bill could not be declined. Try again.', 'error');
        }
        setTimeout(loadBank, 750);
    }

    const options = $derived(payable.map((a) => ({ value: String(a.Account), label: `${accountName(a)}, ${dollars(a.Balance)}` })));
</script>

<AppPage title="Bills to pay">
    {#if due.length}
        <ul class="ph-list">
            {#each due as b (b.Id)}
                <li class="bill">
                    <div class="bill__head">
                        <span class="bill__name">{plain(b.Name) || 'Unknown sender'}</span>
                        <span class="bill__amt ph-num">{dollars(b.Amount)}</span>
                    </div>
                    <p class="bill__desc">{plain(b.Description) || 'No description given'}</p>
                    <p class="bill__when">Received {when(bankTime(b.Timestamp), clock.now)}</p>
                    <div class="bill__actions">
                        <Button size="sm" variant={due.length === 1 ? "primary" : "secondary"} onclick={() => startPay(b)}>Pay {dollars(b.Amount)}</Button>
                        <Button size="sm" variant="secondary" onclick={() => decline(b)}>Decline</Button>
                    </div>
                </li>
            {/each}
        </ul>
    {:else}
        <EmptyState title="No bills to pay">{bank.loading ? 'Checking for new bills.' : 'Bills businesses and people send you show here.'}</EmptyState>
    {/if}
</AppPage>

<Sheet open={Boolean(paying)} title="Pay {paying ? dollars(paying.Amount) : ''} to {plain(paying?.Name)}" onclose={() => (paying = null)}>
    {#if payable.length}
        <Field label="Pay from" id="pay-from" {error}>
            <Select id="pay-from" {options} bind:value={from} invalid={Boolean(error)} />
        </Field>
    {:else}
        <p>You have no account you can pay from. Ask the account owner to let you spend from it.</p>
    {/if}
    {#snippet actions()}
        {#if payable.length}<Button loading={busy} onclick={pay}>Pay bill</Button>{/if}
        <Button variant="secondary" onclick={() => (paying = null)}>Cancel</Button>
    {/snippet}
</Sheet>

<style>
    .bill {
        padding: var(--au-s3) var(--au-s4);
    }
    .bill__head {
        display: flex;
        justify-content: space-between;
        gap: var(--au-s3);
        font-weight: 700;
    }
    .bill__name {
        min-width: 0;
        overflow-wrap: anywhere;
    }
    .bill__amt {
        flex-shrink: 0;
    }
    .bill__desc {
        margin: var(--au-s1) 0 0;
        overflow-wrap: anywhere;
    }
    .bill__when {
        margin: 0 0 var(--au-s2);
        color: var(--au-muted);
    }
    .bill__actions {
        display: flex;
        gap: var(--au-s2);
    }
</style>
