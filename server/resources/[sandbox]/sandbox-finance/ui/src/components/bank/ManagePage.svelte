<script>
    import { untrack } from 'svelte';
    import { Callout, Button, Field, TextInput, Select, Modal, Tag, EmptyState, uid } from '@sandbox/ui-kit';
    import { faPlus } from '@fortawesome/free-solid-svg-icons';
    import { app } from '../../state/app.svelte.js';
    import { accounts, same, getAccount, upsertAccount, patchAccount, loadAccounts } from '../../state/accounts.svelte.js';
    import { api } from '../../lib/api.js';
    import { isOwner, accountOption, accountLabel } from '../../lib/format.js';
    import ResultAlert from '../shared/ResultAlert.svelte';

    /**
     * Manage tab: open a savings account (Bank:Register) and keep its joint
     * owners (Bank:AddJoint / Bank:RemoveJoint). Renaming has no UI: the server
     * stub behind Bank:Rename always answers false.
     */
    const ids = { savings: uid('sav'), joint: uid('joint') };
    let alert = $state(null);
    let opening = $state(false);
    let savingsId = $state('');
    let jointTarget = $state('');
    let jointError = $state('');
    let adding = $state(false);
    let removing = $state(null); // State ID awaiting confirmation
    let removeBusy = $state(false);

    const owned = $derived(accounts.items.filter((a) => a.Type === 'personal_savings' && a.Permissions?.MANAGE && isOwner(a, app.character)));
    const savings = $derived(getAccount(savingsId));

    // Keep a valid savings account selected as the list changes.
    $effect(() => {
        const ready = accounts.status === 'ready';
        const ownedIds = owned.map((a) => a.Account);
        untrack(() => {
            if (!ready) return;
            if (!ownedIds.some((id) => same(id, savingsId))) savingsId = ownedIds[0] ?? '';
        });
    });

    async function openSavings() {
        if (opening) return;
        opening = true;
        let res = null;
        try {
            res = await api.register('personal_savings');
        } catch {
            res = null;
        }
        opening = false;
        if (res && typeof res === 'object' && res.Account != null) {
            const acc = upsertAccount({
                Type: 'personal_savings',
                Owner: String(app.character?.SID ?? ''),
                Balance: 0,
                JointOwners: [],
                Permissions: { MANAGE: true, BALANCE: true, WITHDRAW: true, DEPOSIT: true, TRANSACTIONS: true },
                ...res,
            });
            savingsId = acc.Account;
            alert = { type: 'success', title: 'Savings account opened', message: `Account ${acc.Account} is ready to use. Add joint owners below if you want to share it.` };
            loadAccounts({ quiet: true });
        } else {
            alert = { type: 'error', title: 'Could not open an account', message: 'The bank declined the request. Try again later.' };
        }
    }

    async function addJoint(e) {
        e.preventDefault();
        if (adding) return;
        const target = jointTarget.trim();
        if (!savings) jointError = 'Choose a savings account first.';
        else if (!/^\d+$/.test(target)) jointError = 'Enter the State ID as a number.';
        else if (same(target, app.character?.SID)) jointError = 'You already own this account.';
        else if (savings.JointOwners.some((j) => same(j, target))) jointError = 'That person is already a joint owner.';
        else jointError = '';
        if (jointError) return;
        const acc = savings;
        adding = true;
        let res = null;
        try {
            res = await api.addJoint(acc.Account, Number(target));
        } catch {
            res = null;
        }
        adding = false;
        if (res) {
            patchAccount(acc.Account, { JointOwners: [...acc.JointOwners, Number(target)] });
            jointTarget = '';
            alert = { type: 'success', title: 'Joint owner added', message: `State ID ${target} can now deposit into and withdraw from ${accountLabel(acc)}.` };
        } else {
            alert = { type: 'error', title: 'Could not add joint owner', message: 'Check the State ID. You cannot add your own other characters.' };
        }
    }

    async function removeJoint() {
        if (removing === null || removeBusy || !savings) return;
        const acc = savings;
        const target = removing;
        removeBusy = true;
        let res = null;
        try {
            res = await api.removeJoint(acc.Account, Number(target));
        } catch {
            res = null;
        }
        removeBusy = false;
        removing = null;
        if (res) {
            patchAccount(acc.Account, { JointOwners: acc.JointOwners.filter((j) => !same(j, target)) });
            alert = { type: 'success', title: 'Joint owner removed', message: `State ID ${target} can no longer use ${accountLabel(acc)}.` };
        } else {
            alert = { type: 'error', title: 'Could not remove joint owner', message: 'The bank declined the request. Try again later.' };
        }
    }
</script>

<h1>Manage accounts</h1>
<p class="lead">Open savings accounts and decide who else can use them.</p>

<ResultAlert {alert} onclose={() => (alert = null)} />

<div class="two-col">
    <section>
        <h2>Open a savings account</h2>
        <Callout title="How savings accounts work">
            <p>A savings account keeps money separate from your checking account. You can add joint owners who can deposit and withdraw, and remove them at any time. Only you can manage the account.</p>
        </Callout>
        <Button icon={faPlus} loading={opening} onclick={openSavings}>Open a savings account</Button>
    </section>

    <section>
        <h2>Joint owners</h2>
        {#if owned.length === 0}
            <EmptyState title="No savings accounts">Open a savings account to share it with joint owners.</EmptyState>
        {:else}
            <Field label="Savings account" id={ids.savings}>
                <Select id={ids.savings} bind:value={savingsId} options={owned.map(accountOption)} placeholder="Choose an account" />
            </Field>
            {#if savings}
                {#if savings.JointOwners.length === 0}
                    <p class="au-muted">No joint owners yet.</p>
                {:else}
                    <table class="au-table au-table--striped">
                        <thead>
                            <tr>
                                <th>State ID</th>
                                <th>Role</th>
                                <th class="col-actions">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each savings.JointOwners as sid, i (i)}
                                <tr>
                                    <td class="au-mono">{sid}</td>
                                    <td><Tag tone="info">Joint owner</Tag></td>
                                    <td class="col-actions"><Button variant="danger" size="sm" onclick={() => (removing = sid)}>Remove</Button></td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                {/if}
                <form class="joint-form" onsubmit={addJoint} novalidate>
                    <Field label="Add a joint owner" id={ids.joint} hint="Their State ID. They must be another player." error={jointError}>
                        <div class="au-row">
                            <TextInput
                                id={ids.joint}
                                bind:value={jointTarget}
                                inputmode="numeric"
                                autocomplete="off"
                                placeholder="State ID"
                                mono
                                width="200px"
                                block={false}
                                invalid={Boolean(jointError)}
                            />
                            <Button type="submit" variant="secondary" loading={adding}>Add joint owner</Button>
                        </div>
                    </Field>
                </form>
            {/if}
        {/if}
    </section>
</div>

{#if removing !== null}
    <Modal title="Remove joint owner?" onclose={() => (removing = null)} width="440px">
        <p>State ID <span class="au-mono">{removing}</span> will no longer be able to use {accountLabel(savings)}. Money already in the account stays where it is.</p>
        {#snippet actions()}
            <Button variant="secondary" onclick={() => (removing = null)} disabled={removeBusy}>Cancel</Button>
            <Button variant="danger" onclick={removeJoint} loading={removeBusy}>Remove joint owner</Button>
        {/snippet}
    </Modal>
{/if}

<style>
    .joint-form {
        margin-top: 24px;
    }
</style>
