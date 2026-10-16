<script>
    import { Button, Field, TextInput, Radio } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import AppPage from '../../components/common/AppPage.svelte';
    import { back } from '../../state/router.svelte.js';
    import { showAlert } from '../../state/notify.svelte.js';
    import { accountName, dollars, loadBank } from './bank.svelte.js';

    /** Transfer money out of an account, or bill someone into it. Lua checks the amounts again. */
    let { account, mode = 'transfer' } = $props();

    const isTransfer = $derived(mode === 'transfer');
    let toType = $state('account'); // account | sid
    let target = $state('');
    let amount = $state('');
    let note = $state('');
    let errors = $state({});
    let busy = $state(false);

    const max = $derived(Number(account?.Balance) || 0);

    async function submit(e) {
        e.preventDefault();
        const next = {};
        const t = target.trim();
        const amt = Number(String(amount).replace(/[$,\s]/g, ''));
        if (isTransfer && toType === 'account' && !/^\d{1,12}$/.test(t)) next.target = 'Enter the account number you are sending to.';
        if ((!isTransfer || toType === 'sid') && !/^\d{1,6}$/.test(t)) next.target = 'Enter a State ID, for example 4021.';
        if (!Number.isFinite(amt) || amt < 1) next.amount = 'Enter an amount of $1 or more.';
        else if (amt > 10000000) next.amount = 'Enter an amount of $10,000,000 or less.';
        else if (isTransfer && amt > max) next.amount = `This account holds ${dollars(max)}. Enter that much or less.`;
        if (!isTransfer && !note.trim()) next.note = 'Say what the bill is for.';
        errors = next;
        if (Object.keys(next).length) return;

        busy = true;
        try {
            const ok = isTransfer
                ? await fetchNui('Banking:Transfer', { account: account.Account, targetType: toType === 'sid', target: t, amount: amt, description: note.trim() })
                : await fetchNui('Banking:Bill', { fromAccount: account.Account, target: t, description: note.trim(), amount: amt });
            if (ok) {
                showAlert(isTransfer ? `${dollars(amt)} sent` : `Bill for ${dollars(amt)} sent`, 'success');
                loadBank();
                back();
            } else {
                showAlert(isTransfer ? 'The transfer did not go through. Check the details and try again.' : 'The bill was not sent. Check the State ID and try again.', 'error');
            }
        } catch {
            showAlert('The bank could not be reached. Try again.', 'error');
        }
        busy = false;
    }
</script>

<AppPage title={isTransfer ? 'Transfer money' : 'Send a bill'}>
    {#if account}
        <form class="ph-form" onsubmit={submit} novalidate>
            <dl class="ph-facts from">
                <div><dt>{isTransfer ? 'From' : 'Paid into'}</dt><dd>{accountName(account)} <span class="au-mono">{account.Account}</span></dd></div>
                {#if isTransfer}<div><dt>Available</dt><dd class="ph-num">{dollars(max)}</dd></div>{/if}
            </dl>
            {#if isTransfer}
                <fieldset class="to">
                    <legend class="to__label">Send to</legend>
                    <Radio bind:group={toType} value="account" name="to-type" label="A bank account number" />
                    <Radio bind:group={toType} value="sid" name="to-type" label="A person's State ID" />
                </fieldset>
            {/if}
            <Field label={isTransfer && toType === 'account' ? 'Account number' : 'State ID'} id="mf-target" error={errors.target}>
                <TextInput id="mf-target" mono bind:value={target} inputmode="numeric" maxlength="12" width="60%" block={false} invalid={Boolean(errors.target)} />
            </Field>
            <Field label="Amount in dollars" id="mf-amount" error={errors.amount}>
                <TextInput id="mf-amount" bind:value={amount} inputmode="decimal" maxlength="12" width="60%" block={false} invalid={Boolean(errors.amount)} />
            </Field>
            <Field label={isTransfer ? 'Note (optional)' : 'What the bill is for'} hint={isTransfer ? 'Shows on both statements' : 'They see this when they pay'} id="mf-note" error={errors.note}>
                <TextInput id="mf-note" bind:value={note} maxlength="120" invalid={Boolean(errors.note)} />
            </Field>
            <Button type="submit" loading={busy}>{isTransfer ? 'Send money' : 'Send bill'}</Button>
        </form>
    {:else}
        <p class="ph-note">This account is not available. Go back and pick another.</p>
    {/if}
</AppPage>

<style>
    .from {
        margin: calc(-1 * var(--au-s4)) calc(-1 * var(--au-s4)) var(--au-s4);
    }
    .to {
        display: flex;
        flex-direction: column;
        margin: 0 0 var(--au-s3);
        padding: 0;
        border: 0;
    }
    .to__label {
        padding: 0;
        margin-bottom: var(--au-s1);
        font-weight: 700;
    }
</style>
