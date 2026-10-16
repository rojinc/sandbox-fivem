<script>
    import { Button, Modal, Field, TextInput, Tag, PageAlert, Radio } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import RepMeter from './RepMeter.svelte';
    import AdminContract from './AdminContract.svelte';
    import AdminBans from './AdminBans.svelte';
    import { data, asList } from '../../state/data.svelte.js';
    import { env } from '../../state/env.svelte.js';
    import { showAlert } from '../../state/notify.svelte.js';
    import { openApp } from '../../state/windows.svelte.js';
    import { hasLaptopPerm } from '../../lib/perms.js';
    import { toMs, timeLeft, duration, crypto } from '../../lib/format.js';
    import { serverMessage } from '../../lib/messages.js';

    /**
     * Boosting: the contract queue, your boosting class, and the contracts
     * LS Underground has offered you. Contracts come from player.BoostingContracts;
     * the queue from boostingQueue; the team from myGroup.
     */
    let { details } = $props();

    const player = $derived(data.player ?? {});
    const alias = $derived(player.Profiles?.redline?.name ?? (player.Profiles?.redline ? 'set' : null));
    const team = $derived(data.myGroup ?? null);
    const members = $derived(asList(team?.Members).length);
    const queue = $derived(data.boostingQueue ?? null);
    const isAdmin = $derived(hasLaptopPerm('lsunderground', 'admin'));
    const disabled = $derived(asList(data.disabledBoostingContracts));
    const contracts = $derived(
        asList(player.BoostingContracts)
            .filter((c) => c && c.vehicle && (toMs(c.expires) ?? 0) > env.now)
            .sort((a, b) => (Number(b.vehicle?.classLevel) || 0) - (Number(a.vehicle?.classLevel) || 0) || (toMs(a.expires) ?? 0) - (toMs(b.expires) ?? 0)),
    );
    const boostRep = $derived(
        details.reputations.find((r) => r.id === 'Boosting') ?? {
            id: 'Boosting',
            label: 'Boosting',
            value: 0,
            current: { level: 1, label: 'D', value: 0 },
            next: { level: 2, label: 'C', value: 6000 },
        },
    );
    const chopRep = $derived(details.reputations.find((r) => r.id === 'Chopping'));
    const level = $derived(Math.max(1, Number(boostRep.current?.level) || 1));
    const CLASSES = ['D', 'C', 'B', 'A', 'A+', 'S+'];

    /* --------------------------------------------------------- queue */
    let queueError = $state(null);
    let queueBusy = $state(false);
    let leaving = $state(false);

    async function joinQueue() {
        queueError = null;
        if (!team || (members < 2 && !isAdmin)) {
            queueError = 'You need a team of 2 or more to join the queue. Create a team or invite someone in Teams.';
            return;
        }
        queueBusy = true;
        const res = await fetchNui('Boosting:EnterQueue', {});
        queueBusy = false;
        if (res && typeof res === 'object' && res.success) showAlert('You joined the queue', 'success');
        else queueError = serverMessage(res?.message, 'You could not join the queue. Try again in a minute.');
    }

    async function leaveQueue() {
        queueBusy = true;
        const res = await fetchNui('Boosting:ExitQueue', {});
        queueBusy = false;
        leaving = false;
        if (res === true) showAlert('You left the queue', 'success');
        else showAlert('You could not leave the queue. Try again.', 'error');
    }

    /* ----------------------------------------------------- contracts */
    let accepting = $state(null); // contract
    let acceptKind = $state('standard');
    let transferring = $state(null); // { contract, alias, error }
    let declining = $state(null); // contract
    let busy = $state(false);

    function startAccept(c) {
        acceptKind = 'standard';
        accepting = c;
    }

    async function accept() {
        const c = accepting;
        if (!c) return;
        busy = true;
        const res = await fetchNui('Boosting:AcceptContract', { id: c.id, scratch: acceptKind === 'scratch' });
        busy = false;
        accepting = null;
        if (res && typeof res === 'object' && res.success) showAlert('Request sent to your team leader', 'success');
        else showAlert(serverMessage(res?.message, 'The contract request did not go through. Try again.'), 'error');
    }

    async function transfer() {
        const t = transferring;
        if (!t) return;
        const target = t.alias.trim();
        if (!target) {
            t.error = 'Enter the racing alias of the person who should get this contract';
            return;
        }
        busy = true;
        const res = await fetchNui('Boosting:TransferContract', { id: t.contract.id, alias: target });
        busy = false;
        if (res === true) {
            transferring = null;
            showAlert(`Contract transferred to ${target}`, 'success');
        } else {
            t.error = `Nobody online uses the alias ${target}. Check the spelling, including capitals.`;
        }
    }

    async function decline() {
        const c = declining;
        if (!c) return;
        busy = true;
        const res = await fetchNui('Boosting:DeclineContract', { id: c.id });
        busy = false;
        declining = null;
        if (res === true) showAlert('Contract declined', 'success');
        else showAlert('The contract could not be declined. Try again.', 'error');
    }

    /* --------------------------------------------------------- admin */
    let creating = $state(false);
    let banning = $state(false);
</script>

{#if details.banned}
    <PageAlert type="error" title="You are banned from boosting">LS Underground removed your access. You cannot join the queue or start contracts.</PageAlert>
{:else if !details.canBoost}
    <div class="section">
        <h3 class="heading">Boosting is locked</h3>
        <p class="lead">Boosting opens at Chopping rank 5. Chop vehicles from the chop lists to raise your rank.</p>
        {#if chopRep}
            <div class="narrow"><RepMeter rep={chopRep} /></div>
        {/if}
    </div>
{:else if !alias}
    <div class="section">
        <h3 class="heading">You need a racing alias</h3>
        <p class="lead">Contracts are offered to racing aliases. Set your alias in the Redline app on your phone, then open LS UNDG again.</p>
    </div>
{:else}
    <div class="split">
        <section class="section" aria-labelledby="queue-h">
            <h3 class="heading" id="queue-h">Contract queue</h3>
            {#if team?.State === 'boosting'}
                <p class="lead">Your team is on a contract now. You can join the queue again when it ends.</p>
            {:else if queue}
                <p class="lead">You have been in the queue for {duration(queue.joined, env.now)}. LS Underground offers a contract when one is free.</p>
                <Button variant="secondary" loading={queueBusy} onclick={() => (leaving = true)}>Leave queue</Button>
            {:else}
                <p class="lead">Join the queue to be offered contracts. You need a racing alias and a team of 2 or more.</p>
                {#if queueError}
                    <PageAlert type="error" compact>{queueError}</PageAlert>
                    {#if !team || members < 2}
                        <p class="hint-line"><button type="button" class="row-link" onclick={() => openApp('teams')}>Open Teams</button></p>
                    {/if}
                {/if}
                <Button loading={queueBusy} onclick={joinQueue}>Join queue</Button>
            {/if}
        </section>
        <section class="section rep" aria-labelledby="rep-h">
            <h3 class="subheading" id="rep-h">Your boosting class</h3>
            <RepMeter rep={boostRep} prefix="Class " />
        </section>
    </div>

    <section class="section" aria-labelledby="contracts-h">
        <div class="section-head">
            <h3 class="heading" id="contracts-h">Your contracts</h3>
            {#if isAdmin}
                <div class="actions">
                    <Button variant="secondary" size="sm" onclick={() => (creating = true)}>Create contract</Button>
                    <Button variant="secondary" size="sm" onclick={() => (banning = true)}>Manage bans</Button>
                </div>
            {/if}
        </div>
        {#if contracts.length}
            <table class="au-table">
                <caption class="au-hidden">Contracts you can start, highest class first</caption>
                <thead>
                    <tr>
                        <th scope="col">Class</th>
                        <th scope="col">Vehicle</th>
                        <th scope="col" class="is-numeric">Buy-in</th>
                        <th scope="col">Expires in</th>
                        <th scope="col" class="cell-actions"><span class="au-hidden">Actions</span></th>
                    </tr>
                </thead>
                <tbody>
                    {#each contracts as c (c.id)}
                        {@const sent = disabled.includes(c.id)}
                        {@const tooLow = level < (Number(c.vehicle.classLevel) || 1) && !c.vehicle.rewarded}
                        <tr>
                            <td class="cell-strong">{c.vehicle.class}</td>
                            <td>
                                {c.vehicle.label ?? `${c.vehicle.make ?? ''} ${c.vehicle.model ?? ''}`}
                                {#if c.vehicle.rare}<Tag tone="info">Rare</Tag>{/if}
                            </td>
                            <td class="is-numeric">{crypto(c.prices?.standard?.price, c.prices?.standard?.coin)}</td>
                            <td>{timeLeft(c.expires, env.now)}</td>
                            <td class="cell-actions">
                                <div class="actions actions--end">
                                    {#if sent}
                                        <Tag tone="success">Sent to leader</Tag>
                                    {:else if tooLow}
                                        <Tag tone="warning">Needs class {CLASSES[(Number(c.vehicle.classLevel) || 1) - 1] ?? c.vehicle.class}</Tag>
                                    {:else}
                                        <Button variant="secondary" size="sm" disabled={busy} onclick={() => startAccept(c)}>Start contract</Button>
                                    {/if}
                                    <Button variant="tertiary" size="sm" disabled={busy || sent} onclick={() => (transferring = { contract: c, alias: '', error: null })}>Transfer</Button>
                                    <Button variant="tertiary" size="sm" disabled={busy || sent} onclick={() => (declining = c)}>Decline</Button>
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {:else}
            <div class="state">
                <strong>You have no contracts</strong>
                <p>Join the queue and LS Underground offers contracts to you here. Each one expires after a few hours.</p>
            </div>
        {/if}
    </section>
{/if}

{#if leaving}
    <Modal title="Leave the queue?" onclose={() => (leaving = false)} width="460px">
        <p class="modal-text">You have been in the queue for {duration(queue?.joined, env.now)}. If you leave, you lose your place.</p>
        {#snippet actions()}
            <Button variant="secondary" onclick={() => (leaving = false)}>Stay in queue</Button>
            <Button variant="danger" loading={queueBusy} onclick={leaveQueue}>Leave queue</Button>
        {/snippet}
    </Modal>
{/if}

{#if accepting}
    <Modal title="Start the {accepting.vehicle.label} contract?" onclose={() => (accepting = null)} width="520px">
        <p class="modal-text">Your team leader gets the request and has 2 minutes to accept. The buy-in comes out of your crypto wallet when they do.</p>
        <dl class="facts">
            <div><dt>Class</dt><dd>{accepting.vehicle.class}</dd></div>
            <div><dt>Buy-in</dt><dd>{crypto(accepting.prices?.standard?.price, accepting.prices?.standard?.coin)}</dd></div>
            <div><dt>Expires in</dt><dd>{timeLeft(accepting.expires, env.now)}</dd></div>
        </dl>
        {#if accepting.prices?.scratch}
            <fieldset class="choice">
                <legend class="choice__legend">Contract type</legend>
                <Radio bind:group={acceptKind} value="standard" name="kind" label="Standard ({crypto(accepting.prices.standard.price, accepting.prices.standard.coin)})" />
                <Radio bind:group={acceptKind} value="scratch" name="kind" label="VIN scratch ({crypto(accepting.prices.scratch.price, accepting.prices.scratch.coin)})" />
            </fieldset>
        {/if}
        {#snippet actions()}
            <Button variant="secondary" onclick={() => (accepting = null)}>Cancel</Button>
            <Button loading={busy} onclick={accept}>Send to team leader</Button>
        {/snippet}
    </Modal>
{/if}

{#if transferring}
    <Modal title="Transfer this contract" onclose={() => (transferring = null)} width="520px">
        <p class="modal-text">{transferring.contract.vehicle.label}, class {transferring.contract.vehicle.class}. The contract leaves your list straight away.</p>
        <Field label="Racing alias" hint="The alias of the racer who gets the contract. They must be online." id="transfer-alias" error={transferring.error}>
            <TextInput id="transfer-alias" bind:value={transferring.alias} invalid={Boolean(transferring.error)} autocomplete="off" />
        </Field>
        {#snippet actions()}
            <Button variant="secondary" onclick={() => (transferring = null)}>Cancel</Button>
            <Button loading={busy} onclick={transfer}>Transfer contract</Button>
        {/snippet}
    </Modal>
{/if}

{#if declining}
    <Modal title="Decline this contract?" onclose={() => (declining = null)} width="480px">
        <p class="modal-text">{declining.vehicle.label}, class {declining.vehicle.class}. Declined contracts are gone for good.</p>
        {#snippet actions()}
            <Button variant="secondary" onclick={() => (declining = null)}>Keep contract</Button>
            <Button variant="danger" loading={busy} onclick={decline}>Decline contract</Button>
        {/snippet}
    </Modal>
{/if}

{#if creating}
    <AdminContract onclose={() => (creating = false)} />
{/if}
{#if banning}
    <AdminBans onclose={() => (banning = false)} />
{/if}

<style>
    .narrow {
        max-width: 28em;
    }
    .rep {
        margin-top: 0 !important;
        padding-top: var(--au-s2);
    }
    .hint-line {
        margin: 0 0 var(--au-s4);
    }
    .modal-text {
        margin: 0 0 var(--au-s4);
    }
    .choice {
        border: 0;
        margin: 0;
        padding: 0;
        display: grid;
        gap: var(--au-s2);
    }
    .choice__legend {
        font-weight: 700;
        margin-bottom: var(--au-s2);
        padding: 0;
    }
    td :global(.au-tag) {
        margin-left: var(--au-s2);
    }
</style>
