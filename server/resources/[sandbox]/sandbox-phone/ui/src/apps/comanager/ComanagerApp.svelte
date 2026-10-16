<script>
    import { Button, EmptyState, PageAlert } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import AppPage from '../../components/common/AppPage.svelte';
    import Sheet from '../../components/common/Sheet.svelte';
    import { data } from '../../state/data.svelte.js';
    import { showAlert } from '../../state/notify.svelte.js';
    import { plain } from '../../lib/format.js';

    /**
     * BizWiz: the jobs you hold and quitting one. Company management (roster,
     * hiring, grades, upgrades) is not ported yet and says so.
     */
    let { app } = $props();

    const external = $derived(Array.isArray(data.externalJobs) ? data.externalJobs : []);
    const jobs = $derived((data.player?.Jobs ?? []).filter((j) => j && !external.includes(j.Id)));

    let quitting = $state(null);
    let busy = $state(false);
    async function quit() {
        const job = quitting;
        busy = true;
        try {
            const res = await fetchNui('QuitJob', { JobId: job.Id });
            if (res?.success) showAlert(`You quit ${plain(job.Workplace?.Name ?? job.Name)}`, 'success');
            else if (res?.code === 'IS_OWNER') showAlert('You own this company. Transfer or disband it before you quit.', 'error');
            else showAlert('You could not quit this job. Try again.', 'error');
        } catch {
            showAlert('You could not quit this job. Try again.', 'error');
        }
        busy = false;
        quitting = null;
    }
</script>

<AppPage title={app?.label ?? 'BizWiz'}>
    {#if jobs.length}
        <ul class="ph-list">
            {#each jobs as j (j.Id + (j.Workplace?.Id ?? ''))}
                <li class="job">
                    <div class="job__text">
                        <strong>{plain(j.Workplace?.Name ?? j.Name)}</strong>
                        <span class="au-muted">{plain(j.Grade?.Name ?? 'No grade')}, {plain(j.Name)}</span>
                    </div>
                    <Button size="sm" variant="secondary" onclick={() => (quitting = j)}>Quit job</Button>
                </li>
            {/each}
        </ul>
        <div class="ph-pad">
            <PageAlert type="info" title="Managing a company is not available yet">Rosters, hiring and grades have not moved to the new phone yet.</PageAlert>
        </div>
    {:else}
        <EmptyState title="You do not have a job">Jobs a business gives you show here, and you can quit them from here.</EmptyState>
    {/if}
</AppPage>

<Sheet open={Boolean(quitting)} title="Quit {plain(quitting?.Workplace?.Name ?? quitting?.Name ?? '')}?" onclose={() => (quitting = null)}>
    <p>You lose this job and its access straight away. The business has to hire you again to undo it.</p>
    {#snippet actions()}
        <Button variant="danger" loading={busy} onclick={quit}>Quit job</Button>
        <Button variant="secondary" onclick={() => (quitting = null)}>Keep job</Button>
    {/snippet}
</Sheet>

<style>
    .job {
        display: flex;
        align-items: center;
        gap: var(--au-s3);
        padding: var(--au-s3) var(--au-s4);
    }
    .job__text {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
    }
</style>
