<script>
    import { onMount } from 'svelte';
    import { Button, PageAlert, ProgressBar, Spinner, Tabs } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import AppPage from '../../components/common/AppPage.svelte';
    import Sheet from '../../components/common/Sheet.svelte';
    import { data } from '../../state/data.svelte.js';
    import { showAlert } from '../../state/notify.svelte.js';
    import { plain } from '../../lib/format.js';

    /** Jobs: casual work you start from the phone, work groups of up to 5, and your reputation. */
    let { app } = $props();

    let tab = $state('jobs');
    let jobs = $state({});
    let groups = $state([]);
    let reps = $state([]);
    let loading = $state(false);
    let failed = $state(false);
    let busy = $state(false);
    let confirm = $state(null); // 'disband' | 'leave'

    async function load() {
        if (loading) return;
        loading = true;
        failed = false;
        try {
            const res = await fetchNui('GetLaborDetails');
            jobs = res?.jobs && typeof res.jobs === 'object' ? res.jobs : {};
            groups = Array.isArray(res?.groups) ? res.groups : Object.values(res?.groups ?? {});
            reps = Array.isArray(res?.reputations) ? res.reputations : Object.values(res?.reputations ?? {});
        } catch {
            failed = true;
        }
        loading = false;
    }
    onMount(load);

    const p = $derived(data.player ?? {});
    const isMe = (m) => m && (String(m.SID) === String(p.SID) || String(m.ID) === String(p.Source));
    const myGroup = $derived(groups.find((g) => isMe(g.Creator) || (g.Members ?? []).some(isMe)) ?? null);
    const leader = $derived(myGroup ? isMe(myGroup.Creator) : false);
    const jobList = $derived(
        Object.values(jobs)
            .filter(Boolean)
            .sort((a, b) => Boolean(b.Restricted) - Boolean(a.Restricted) || String(a.Name).localeCompare(String(b.Name))),
    );
    const current = $derived(p.TempJob ? (jobs[p.TempJob] ?? { Id: p.TempJob, Name: p.TempJob }) : null);
    const onDuty = (j) => (Array.isArray(j.OnDuty) ? j.OnDuty : Object.values(j.OnDuty ?? {}));
    const full = (j) => Number(j.Limit) > 0 && onDuty(j).length >= Number(j.Limit);
    const mine = (j) => onDuty(j).some((x) => String(x.Joiner) === String(p.Source) || (myGroup && String(x.Joiner) === String(myGroup.Creator?.ID)));
    const usd = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(n) || 0);

    async function act(name, body, okText, failText) {
        busy = true;
        try {
            const ok = await fetchNui(name, body);
            showAlert(ok ? okText : failText, ok ? 'success' : 'error');
        } catch {
            showAlert(failText, 'error');
        }
        busy = false;
        setTimeout(load, 500);
    }
    const start = (j) => act('StartLaborJob', { job: j.Id, isWorkgroup: Boolean(myGroup) }, `Started ${plain(j.Name)}`, `${plain(j.Name)} could not be started. Try again.`);
    const quit = (id, name) => act('QuitLaborJob', id, `You quit ${plain(name)}`, 'You could not quit the job. Try again.');
    async function doConfirm() {
        const kind = confirm;
        confirm = null;
        if (kind === 'disband') await act('DisbandWorkgroup', null, 'Group disbanded', 'The group could not be disbanded. Try again.');
        else await act('LeaveWorkgroup', $state.snapshot(myGroup), 'You left the group', 'You could not leave the group. Try again.');
    }
    const member = (m) => `${plain(m?.First)} ${plain(m?.Last)}`.trim();
</script>

<AppPage title={app?.label ?? 'Jobs'}>
    {#snippet actions()}
        <Button size="sm" variant="secondary" {loading} onclick={load}>Refresh</Button>
    {/snippet}
    <div class="tabs">
        <Tabs
            items={[
                { id: 'jobs', label: 'Jobs' },
                { id: 'groups', label: 'Groups' },
                { id: 'reps', label: 'Reputation' },
            ]}
            bind:active={tab}
            label="Jobs sections"
        />
    </div>

    {#if loading && !jobList.length && !groups.length}
        <p class="ph-note state"><Spinner size={18} /> Loading jobs</p>
    {:else if failed}
        <div class="ph-pad">
            <p class="err" role="alert">Jobs could not be loaded.</p>
            <Button variant="secondary" onclick={load}>Try again</Button>
        </div>
    {:else if tab === 'jobs'}
        {#if current}
            <div class="ph-pad cur">
                <PageAlert type="info" title="You are working as {plain(current.Name)}">
                    <Button size="sm" variant="secondary" disabled={busy || (myGroup && !leader)} onclick={() => quit(current.Id, current.Name)}>Quit this job</Button>
                </PageAlert>
            </div>
        {/if}
        {#if myGroup && !leader}<p class="ph-note">Your group leader starts and quits jobs for the group.</p>{/if}
        {#if jobList.length}
            <ul class="ph-list">
                {#each jobList as j (j.Id)}
                    <li class="job">
                        <div class="job__main">
                            <strong>{plain(j.Name)}</strong>
                            <span class="au-muted">{Number(j.Salary) > 0 ? `${usd(j.Salary)} pay, ` : ''}{onDuty(j).length}{Number(j.Limit) > 0 ? ` of ${j.Limit}` : ''} working</span>
                        </div>
                        {#if mine(j)}
                            <Button size="sm" variant="secondary" disabled={busy || (myGroup && !leader)} onclick={() => quit(j.Id, j.Name)}>Quit</Button>
                        {:else}
                            <Button size="sm" variant="secondary" disabled={busy || full(j) || Boolean(p.TempJob) || (myGroup && !leader)} onclick={() => start(j)}>{full(j) ? 'Full' : 'Start'}</Button>
                        {/if}
                    </li>
                {/each}
            </ul>
        {:else}
            <p class="ph-note">No jobs are open to you right now.</p>
        {/if}
    {:else if tab === 'groups'}
        {#if myGroup}
            <h2 class="ph-section">Your group, {(myGroup.Members?.length ?? 0) + 1} of 5</h2>
            <ul class="ph-list">
                <li class="mem"><strong>{member(myGroup.Creator)}</strong> <span class="au-muted">(leader)</span></li>
                {#each myGroup.Members ?? [] as m, i (m.SID ?? m.ID ?? i)}
                    <li class="mem">{member(m)}</li>
                {/each}
            </ul>
            <div class="ph-actions">
                {#if leader}
                    <Button variant="danger" disabled={busy || myGroup.Working} onclick={() => (confirm = 'disband')}>Disband group</Button>
                {:else}
                    <Button variant="danger" disabled={busy || myGroup.Working} onclick={() => (confirm = 'leave')}>Leave group</Button>
                {/if}
            </div>
            {#if myGroup.Working}<p class="ph-note">You cannot change the group while it is on a job.</p>{/if}
        {:else}
            <div class="ph-actions">
                <Button disabled={busy} onclick={() => act('CreateWorkgroup', null, 'Group created', 'The group could not be created. Try again.')}>Make a group</Button>
            </div>
            <h2 class="ph-section">Other groups</h2>
            {#if groups.length}
                <ul class="ph-list">
                    {#each groups as g, i (g.Creator?.ID ?? i)}
                        {@const size = (g.Members?.length ?? 0) + 1}
                        <li class="job">
                            <div class="job__main">
                                <strong>{member(g.Creator)}'s group</strong>
                                <span class="au-muted">{size} of 5{g.Working ? ', on a job' : ''}</span>
                            </div>
                            <Button size="sm" variant="secondary" disabled={busy || size >= 5 || g.Working} onclick={() => act('JoinWorkgroup', $state.snapshot(g), 'Request sent to the leader', 'Your request was not sent. Try again.')}>Ask to join</Button>
                        </li>
                    {/each}
                </ul>
            {:else}
                <p class="ph-note">Nobody has made a group yet.</p>
            {/if}
        {/if}
    {:else}
        {#if reps.length}
            <ul class="ph-list">
                {#each reps as r, i (r.id ?? r.label ?? i)}
                    <li class="rep">
                        <div class="rep__head">
                            <strong>{plain(r.label)}</strong>
                            <span>{r.current?.label ?? 'No rank yet'}</span>
                        </div>
                        {#if r.next}
                            <ProgressBar value={Math.max(0, Number(r.value) - (r.current?.value ?? 0))} max={Math.max(1, Number(r.next.value) - (r.current?.value ?? 0))} label="{r.value} of {r.next.value} to {r.next.label}" size="sm" tone="info" />
                        {:else}
                            <span class="au-muted">Top rank reached</span>
                        {/if}
                    </li>
                {/each}
            </ul>
        {:else}
            <p class="ph-note">Do jobs to build reputation. It shows here once you have some.</p>
        {/if}
    {/if}
</AppPage>

<Sheet open={Boolean(confirm)} title={confirm === 'disband' ? 'Disband your group?' : 'Leave this group?'} onclose={() => (confirm = null)}>
    <p>{confirm === 'disband' ? 'Everyone in it is removed.' : 'You can ask to join again later.'}</p>
    {#snippet actions()}
        <Button variant="danger" onclick={doConfirm}>{confirm === 'disband' ? 'Disband group' : 'Leave group'}</Button>
        <Button variant="secondary" onclick={() => (confirm = null)}>Cancel</Button>
    {/snippet}
</Sheet>

<style>
    .tabs {
        padding: 0 var(--au-s4);
    }
    .cur {
        padding-bottom: 0;
    }
    .job {
        display: flex;
        align-items: center;
        gap: var(--au-s3);
        padding: var(--au-s2) var(--au-s4);
        min-height: 56px;
    }
    .job__main {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
    }
    .mem {
        padding: var(--au-s2) var(--au-s4);
    }
    .rep {
        padding: var(--au-s3) var(--au-s4);
    }
    .rep__head {
        display: flex;
        justify-content: space-between;
        gap: var(--au-s2);
        margin-bottom: var(--au-s1);
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
