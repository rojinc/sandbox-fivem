<script>
    import { onMount } from 'svelte';
    import { Button, EmptyState, Spinner, Tag } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import AppPage from '../../components/common/AppPage.svelte';
    import { data, setData } from '../../state/data.svelte.js';
    import { showAlert } from '../../state/notify.svelte.js';
    import { call } from '../../state/call.svelte.js';
    import { callNumber } from '../../lib/contacts.js';
    import { plain } from '../../lib/format.js';

    /** Services: businesses and who is working there now; route to them or call them. */
    let { app } = $props();

    let loading = $state(false);
    let failed = $state(false);
    async function load() {
        if (loading) return;
        loading = true;
        failed = false;
        try {
            const res = await fetchNui('Services:GetServices');
            setData('services', Array.isArray(res) ? res : Object.values(res ?? {}));
        } catch {
            failed = true;
        }
        loading = false;
    }
    onMount(load);

    const list = $derived((Array.isArray(data.services) ? data.services : []).filter(Boolean));
    const staff = (s) => (Array.isArray(s.players) ? s.players.length : Object.keys(s.players ?? {}).length);

    async function route(s) {
        try {
            const res = await fetchNui('Services:SetGPS', { location: s.jobLocation, jobName: s.jobName });
            showAlert(res ? `Route set to ${plain(s.jobLabel)}` : 'A route could not be set to this place.', res ? 'success' : 'error');
        } catch {
            showAlert('A route could not be set to this place.', 'error');
        }
    }
</script>

<AppPage title={app?.label ?? 'Services'}>
    {#snippet actions()}
        <Button size="sm" variant="secondary" {loading} onclick={load}>Refresh</Button>
    {/snippet}
    {#if loading && !list.length}
        <p class="ph-note state"><Spinner size={18} /> Checking who is open</p>
    {:else if failed}
        <div class="ph-pad">
            <p class="err" role="alert">Services could not be loaded.</p>
            <Button variant="secondary" onclick={load}>Try again</Button>
        </div>
    {:else if list.length}
        <ul class="ph-list">
            {#each list as s, i (s.jobName ?? i)}
                {@const n = staff(s)}
                <li class="svc">
                    <div class="svc__head">
                        <strong class="svc__name">{plain(s.jobLabel)}</strong>
                        <Tag tone={n > 0 ? 'success' : 'warning'}>{n > 0 ? `${n} working` : 'Nobody working'}</Tag>
                    </div>
                    <div class="svc__actions">
                        {#if s.jobLocation}<Button size="sm" variant="secondary" onclick={() => route(s)}>Set GPS route</Button>{/if}
                        {#if s.phoneNumber}<Button size="sm" variant="secondary" icon="phone" disabled={Boolean(call.current)} onclick={() => callNumber(s.phoneNumber)}>Call</Button>{/if}
                    </div>
                </li>
            {/each}
        </ul>
    {:else}
        <EmptyState title="No services listed">Businesses that take calls show here with who is working.</EmptyState>
    {/if}
</AppPage>

<style>
    .svc {
        padding: var(--au-s3) var(--au-s4);
    }
    .svc__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--au-s2);
    }
    .svc__name {
        min-width: 0;
        overflow-wrap: anywhere;
    }
    .svc__actions {
        display: flex;
        gap: var(--au-s2);
        margin-top: var(--au-s2);
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
