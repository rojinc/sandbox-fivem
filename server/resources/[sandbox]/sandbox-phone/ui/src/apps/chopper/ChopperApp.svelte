<script>
    import { onMount } from 'svelte';
    import { Button, PageAlert, ProgressBar, Spinner, Tabs, Tag } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import AppPage from '../../components/common/AppPage.svelte';
    import Sheet from '../../components/common/Sheet.svelte';
    import { plain } from '../../lib/format.js';

    /** Chopper: the vehicles wanted on each chop list, and your reputation. */
    let { app } = $props();

    let tab = $state('lists');
    let banned = $state(false);
    let lists = $state({});
    let reps = $state([]);
    let loading = $state(false);
    let failed = $state(false);
    let open = $state(null);

    async function load() {
        if (loading) return;
        loading = true;
        failed = false;
        try {
            const res = await fetchNui('GetChopperDetails');
            banned = Boolean(res?.banned);
            lists = res?.chopList && typeof res.chopList === 'object' ? res.chopList : {};
            reps = Array.isArray(res?.reputations) ? res.reputations : Object.values(res?.reputations ?? {});
        } catch {
            failed = true;
        }
        loading = false;
    }
    onMount(load);

    const entries = $derived(Object.entries(lists).filter(([, l]) => l && Array.isArray(l.list)));
    const count = (n) => `${n} ${n === 1 ? 'vehicle' : 'vehicles'} left`;
</script>

<AppPage title={app?.label ?? 'Chopper'}>
    {#snippet actions()}
        <Button size="sm" variant="secondary" {loading} onclick={load}>Refresh</Button>
    {/snippet}
    {#if loading && !entries.length}
        <p class="ph-note state"><Spinner size={18} /> Loading chop lists</p>
    {:else if failed}
        <div class="ph-pad">
            <p class="err" role="alert">Chop lists could not be loaded.</p>
            <Button variant="secondary" onclick={load}>Try again</Button>
        </div>
    {:else if banned}
        <div class="ph-pad"><PageAlert type="error" title="You are banned from chopping">The yards will not take vehicles from you.</PageAlert></div>
    {:else}
        <div class="tabs">
            <Tabs
                items={[
                    { id: 'lists', label: 'Chop lists' },
                    { id: 'reps', label: 'Reputation' },
                ]}
                bind:active={tab}
                label="Chopper sections"
            />
        </div>
        {#if tab === 'lists'}
            {#if entries.length}
                <ul class="ph-list">
                    {#each entries as [name, l] (name)}
                        <li>
                            <button type="button" class="ph-row" onclick={() => (open = name)}>
                                <span class="ph-row__main">
                                    <span class="ph-row__title">{l.id ? plain(name) : `${plain(name)} chop list`}</span>
                                    <span class="ph-row__sub">{l.public ? 'Shared' : 'Personal'}, {count(l.list.length)}</span>
                                </span>
                            </button>
                        </li>
                    {/each}
                </ul>
            {:else}
                <p class="ph-note">There are no chop lists right now. Check back later.</p>
            {/if}
        {:else if reps.length}
            <ul class="ph-list">
                {#each reps as r, i (r.id ?? r.label ?? i)}
                    <li class="rep">
                        <div class="rep__head"><strong>{plain(r.label)}</strong><span>{r.current?.label ?? 'No rank yet'}</span></div>
                        {#if r.next}
                            <ProgressBar value={Math.max(0, Number(r.value) - (r.current?.value ?? 0))} max={Math.max(1, Number(r.next.value) - (r.current?.value ?? 0))} label="{r.value} of {r.next.value} to {r.next.label}" size="sm" tone="info" />
                        {/if}
                    </li>
                {/each}
            </ul>
        {:else}
            <p class="ph-note">Chop vehicles to build reputation.</p>
        {/if}
    {/if}
</AppPage>

<Sheet open={Boolean(open)} title={open ? `${plain(open)} chop list` : ''} onclose={() => (open = null)}>
    {#if open && lists[open]}
        <ul class="ph-list">
            {#each lists[open].list.slice().sort((a, b) => Boolean(b.hv) - Boolean(a.hv)) as c, i (i)}
                <li class="item">{plain(c.name)} {#if c.hv}<Tag tone="warning">High value</Tag>{/if}</li>
            {/each}
        </ul>
    {/if}
    {#snippet actions()}
        <Button variant="secondary" onclick={() => (open = null)}>Close</Button>
    {/snippet}
</Sheet>

<style>
    .tabs {
        padding: 0 var(--au-s4);
    }
    .item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--au-s2) 0;
    }
    .rep {
        padding: var(--au-s3) var(--au-s4);
    }
    .rep__head {
        display: flex;
        justify-content: space-between;
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
