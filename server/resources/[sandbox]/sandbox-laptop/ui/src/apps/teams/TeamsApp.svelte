<script>
    import { untrack } from 'svelte';
    import { Button, Modal, Field, TextInput, Tag, Spinner, PageAlert } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import { data, asList } from '../../state/data.svelte.js';
    import { env } from '../../state/env.svelte.js';
    import { laptop } from '../../state/laptop.svelte.js';
    import { notify, showAlert } from '../../state/notify.svelte.js';
    import { person, timeLeft, sentence } from '../../lib/format.js';
    import { serverMessage } from '../../lib/messages.js';

    /**
     * Teams: your team (create, invite, remove, leave, delete), the teams you
     * can ask to join, and requests waiting for you. myGroup comes from Lua;
     * the lists come from GetTeams and GetTeamRequests.
     */
    const MAX_MEMBERS = 5;

    const me = $derived(data.player ?? {});
    const team = $derived(data.myGroup ?? null);
    const memberList = $derived(asList(team?.Members));
    const leader = $derived(memberList.find((m) => m.Leader) ?? null);
    const isLeader = $derived(Boolean(leader) && leader.SID == me.SID);
    const idle = $derived(team?.State === 0 || team?.State === undefined);

    /* ------------------------------------------------------- lists */
    let teams = $state([]);
    let teamsLoading = $state(false);
    let teamsFailed = $state(false);
    let requests = $state([]);
    let requestsLoading = $state(false);
    let cooldown = $state(false);

    async function loadTeams() {
        teamsLoading = true;
        const res = await fetchNui('GetTeams', {});
        teamsLoading = false;
        if (Array.isArray(res) || (res && typeof res === 'object')) {
            teams = asList(res);
            teamsFailed = false;
        } else teamsFailed = true;
    }

    async function loadRequests() {
        requestsLoading = true;
        const res = await fetchNui('GetTeamRequests', {});
        requestsLoading = false;
        requests = asList(res);
    }

    $effect(() => {
        if (!laptop.visible) return undefined;
        untrack(() => {
            loadTeams();
            loadRequests();
        });
        const t = setInterval(loadTeams, 120000);
        return () => clearInterval(t);
    });

    // A new team request notification: refresh the requests list.
    const requestNotes = $derived(notify.list.filter((n) => n.data?.request).length);
    $effect(() => {
        if (requestNotes > 0) untrack(loadRequests);
    });

    const openRequests = $derived(requests.filter((r) => Number(r.expires) > env.now / 1000));
    const myTeam = $derived(team ? teams.find((t) => t.ID == team.ID) : null);

    /* ------------------------------------------------------ create */
    let name = $state('');
    let nameError = $state(null);
    let busy = $state(false);

    function cleanName(v) {
        return v.replace(/[^a-zA-Z0-9_. -]+/g, '').replace(/\s\s+/g, ' ');
    }

    async function create() {
        nameError = null;
        const n = cleanName(name).trim();
        if (!n) {
            nameError = 'Enter a team name';
            return;
        }
        busy = true;
        const res = await fetchNui('CreateTeam', { Name: n });
        busy = false;
        if (res && typeof res === 'object' && res.success) {
            name = '';
            showAlert('Team created', 'success');
            loadTeams();
        } else nameError = serverMessage(res?.message, 'The team was not created. You may already be in a team.');
    }

    /* ------------------------------------------------------ invite */
    let inviting = $state(false);
    let inviteSid = $state('');
    let inviteError = $state(null);

    async function invite() {
        inviteError = null;
        if (!/^\d+$/.test(inviteSid.trim())) {
            inviteError = 'Enter a State ID, like 1042';
            return;
        }
        busy = true;
        const res = await fetchNui('InviteTeamMember', { SID: parseInt(inviteSid, 10) });
        busy = false;
        if (res && typeof res === 'object' && res.success) {
            showAlert(`Invite sent to State ID ${inviteSid.trim()}`, 'success');
            inviteSid = '';
            inviting = false;
        } else inviteError = 'The invite was not sent. They must be online, not in a team, and not already invited.';
    }

    /* ---------------------------------------------- remove / delete */
    let removing = $state(null); // member
    let deleting = $state(false);

    async function remove() {
        const m = removing;
        busy = true;
        const res = await fetchNui('RemoveTeamMember', m);
        busy = false;
        removing = null;
        const self = m.SID == me.SID;
        if (res === true) showAlert(self ? 'You left the team' : `${person(m)} removed from the team`, 'success');
        else showAlert(self ? 'You could not leave the team. Try again.' : 'The member was not removed. Try again.', 'error');
        loadTeams();
    }

    async function deleteTeam() {
        busy = true;
        const res = await fetchNui('DeleteTeam', {});
        busy = false;
        deleting = false;
        if (res === true) showAlert('Team deleted', 'success');
        else showAlert('The team was not deleted. Teams on a job cannot be deleted.', 'error');
        loadTeams();
    }

    /* ------------------------------------------------- join / answer */
    async function requestJoin(t) {
        cooldown = true;
        setTimeout(() => (cooldown = false), 20000);
        const res = await fetchNui('RequestTeamInvite', t.ID);
        if (res === true) showAlert(`Request sent to ${t.Name}`, 'success');
        else showAlert(`${t.Name} did not get your request. It may be busy or already have one from you.`, 'error');
    }

    async function answer(r, action) {
        requestsLoading = true;
        await fetchNui('TeamRequest', { ...r, action });
        showAlert(action === 'accept' ? 'Request accepted' : 'Request declined', 'success');
        loadRequests();
        loadTeams();
    }
</script>

<div class="pane">
    <div class="split">
        <div>
            <section class="section" aria-labelledby="my-team-h">
                {#if team && leader}
                    <div class="section-head">
                        <h3 class="heading" id="my-team-h">{team.Name}</h3>
                        {#if isLeader}
                            <div class="actions">
                                {#if memberList.length < MAX_MEMBERS && idle}
                                    <Button size="sm" onclick={() => (inviting = true)}>Invite member</Button>
                                {/if}
                                <Button variant="secondary" size="sm" disabled={!idle} onclick={() => (deleting = true)}>Delete team</Button>
                            </div>
                        {/if}
                    </div>
                    <dl class="facts">
                        <div><dt>Status</dt><dd>{#if idle}<Tag tone="success">{sentence(team.StateName) ?? 'Available'}</Tag>{:else}<Tag tone="warning">{sentence(team.StateName) ?? 'On a job'}</Tag>{/if}</dd></div>
                        <div><dt>Leader</dt><dd>{person(leader)}{leader.SID == me.SID ? ' (you)' : ''}</dd></div>
                        <div><dt>Members</dt><dd>{memberList.length} of {MAX_MEMBERS}</dd></div>
                    </dl>
                    {#if !idle}
                        <p class="au-muted note">Members cannot join, leave or be removed while the team is on a job.</p>
                    {/if}
                    <table class="au-table">
                        <thead>
                            <tr>
                                <th scope="col">Member</th>
                                <th scope="col" class="is-numeric">State ID</th>
                                <th scope="col">Role</th>
                                <th scope="col" class="cell-actions"><span class="au-hidden">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each memberList as m (m.SID)}
                                <tr class:is-selected={m.SID == me.SID}>
                                    <td>{person(m)}{m.SID == me.SID ? ' (you)' : ''}</td>
                                    <td class="is-numeric">{m.SID}</td>
                                    <td>{m.Leader ? 'Leader' : 'Member'}</td>
                                    <td class="cell-actions">
                                        {#if !m.Leader && m.SID == me.SID}
                                            <Button variant="tertiary" size="sm" disabled={!idle || busy} onclick={() => (removing = m)}>Leave team</Button>
                                        {:else if !m.Leader && isLeader}
                                            <Button variant="tertiary" size="sm" disabled={!idle || busy} onclick={() => (removing = m)}>Remove</Button>
                                        {/if}
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                    {#if memberList.length < 2}
                        <p class="au-muted note">Boosting contracts need a team of 2 or more. Invite someone by their State ID.</p>
                    {/if}
                {:else}
                    <h3 class="heading" id="my-team-h">Create a team</h3>
                    <p class="lead">Jobs like boosting contracts are done as a team of up to {MAX_MEMBERS}. Start your own, or ask to join one of the teams listed below.</p>
                    <form
                        class="create"
                        onsubmit={(e) => {
                            e.preventDefault();
                            create();
                        }}
                    >
                        <Field label="Team name" hint="Letters, numbers, dots, dashes and underscores. Spaces are removed." id="team-name" error={nameError}>
                            <TextInput id="team-name" bind:value={name} oninput={() => (name = cleanName(name))} maxlength="32" invalid={Boolean(nameError)} autocomplete="off" />
                        </Field>
                        <Button type="submit" loading={busy}>Create team</Button>
                    </form>
                {/if}
            </section>

            <section class="section" aria-labelledby="teams-h">
                <div class="section-head">
                    <h3 class="heading" id="teams-h">Active teams</h3>
                    <Button variant="tertiary" size="sm" loading={teamsLoading} onclick={loadTeams}>Refresh list</Button>
                </div>
                {#if teamsFailed && !teams.length}
                    <PageAlert type="error" compact>The team list did not load. Select Refresh list to try again.</PageAlert>
                {:else if teams.length}
                    <table class="au-table">
                        <thead>
                            <tr>
                                <th scope="col">Team</th>
                                <th scope="col" class="is-numeric">Members</th>
                                <th scope="col">Status</th>
                                <th scope="col" class="cell-actions"><span class="au-hidden">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each teams as t (t.ID)}
                                {@const full = asList(t.Members).length >= MAX_MEMBERS}
                                <tr class:is-selected={team?.ID == t.ID}>
                                    <td>{t.Name}{team?.ID == t.ID ? ' (your team)' : ''}</td>
                                    <td class="is-numeric">{asList(t.Members).length}</td>
                                    <td>{sentence(t.StateName) ?? 'Available'}</td>
                                    <td class="cell-actions">
                                        {#if !team}
                                            {#if full}
                                                <span class="au-muted">Full</span>
                                            {:else}
                                                <Button variant="secondary" size="sm" disabled={cooldown} onclick={() => requestJoin(t)}>Ask to join</Button>
                                            {/if}
                                        {/if}
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                    {#if cooldown && !team}<p class="au-muted note">You can send another request in 20 seconds.</p>{/if}
                {:else if teamsLoading}
                    <div class="loading"><Spinner /> Loading teams</div>
                {:else}
                    <p class="au-muted">No teams right now. {team ? '' : 'Create one above.'}</p>
                {/if}
            </section>
        </div>

        <aside class="section requests" aria-labelledby="req-h">
            <h3 class="subheading" id="req-h">Requests</h3>
            {#if requestsLoading && !openRequests.length}
                <div class="loading"><Spinner /> Loading requests</div>
            {:else if openRequests.length}
                <ul class="req-list">
                    {#each openRequests as r (r.id)}
                        <li class="req">
                            <strong>{sentence(r.label)}</strong>
                            <span>{r.description}</span>
                            <span class="au-muted">Ends in {timeLeft(r.expires, env.now)}</span>
                            {#if isLeader || !r.team}
                                <div class="actions">
                                    <Button variant="secondary" size="sm" onclick={() => answer(r, 'accept')}>Accept</Button>
                                    <Button variant="tertiary" size="sm" onclick={() => answer(r, 'deny')}>Decline</Button>
                                </div>
                            {:else}
                                <span class="au-muted">Only your team leader can answer this.</span>
                            {/if}
                        </li>
                    {/each}
                </ul>
            {:else}
                <p class="au-muted">No requests. Team invites, join requests and contract requests show here for 2 minutes.</p>
            {/if}
        </aside>
    </div>
</div>

{#if inviting}
    <Modal title="Invite a member" onclose={() => (inviting = false)} width="460px">
        <form
            id="invite-form"
            onsubmit={(e) => {
                e.preventDefault();
                invite();
            }}
        >
            <Field label="State ID" hint="They get a notification and have 2 minutes to accept." id="invite-sid" error={inviteError}>
                <TextInput id="invite-sid" bind:value={inviteSid} inputmode="numeric" invalid={Boolean(inviteError)} width="12em" block={false} autocomplete="off" />
            </Field>
        </form>
        {#snippet actions()}
            <Button variant="secondary" onclick={() => (inviting = false)}>Cancel</Button>
            <Button type="submit" form="invite-form" loading={busy}>Send invite</Button>
        {/snippet}
    </Modal>
{/if}

{#if removing}
    {@const self = removing.SID == me.SID}
    <Modal title={self ? 'Leave the team?' : `Remove ${person(removing)}?`} onclose={() => (removing = null)} width="460px">
        <p class="modal-text">{self ? `You leave ${team?.Name}. You can ask to join again later.` : `${person(removing)} leaves ${team?.Name} straight away.`}</p>
        {#snippet actions()}
            <Button variant="secondary" onclick={() => (removing = null)}>Cancel</Button>
            <Button variant="danger" loading={busy} onclick={remove}>{self ? 'Leave team' : 'Remove member'}</Button>
        {/snippet}
    </Modal>
{/if}

{#if deleting}
    <Modal title="Delete {team?.Name}?" onclose={() => (deleting = false)} width="460px">
        <p class="modal-text">Every member leaves the team and gets a notification. This cannot be undone.</p>
        {#snippet actions()}
            <Button variant="secondary" onclick={() => (deleting = false)}>Keep team</Button>
            <Button variant="danger" loading={busy} onclick={deleteTeam}>Delete team</Button>
        {/snippet}
    </Modal>
{/if}

<style>
    .create {
        max-width: 28em;
    }
    .note {
        margin: var(--au-s3) 0 0;
    }
    .requests {
        margin-top: 0 !important;
        padding-top: var(--au-s2);
    }
    .req-list {
        list-style: none;
        margin: 0;
        padding: 0;
        border-top: 1px solid var(--au-border);
    }
    .req {
        display: grid;
        gap: var(--au-s1);
        padding: var(--au-s3) 0;
        border-bottom: 1px solid var(--au-border);
    }
    .req .actions {
        margin-top: var(--au-s2);
    }
    .modal-text {
        margin: 0;
    }
</style>
