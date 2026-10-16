<script>
    import { untrack } from 'svelte';
    import { MainNav, Spinner, Button } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import Boosting from './Boosting.svelte';
    import Market from './Market.svelte';
    import ChopLists from './ChopLists.svelte';
    import Reputations from './Reputations.svelte';
    import { laptop } from '../../state/laptop.svelte.js';

    /**
     * LS Underground: boosting contracts and the queue, the black market,
     * chop lists and reputation. Everything comes from GetLSUDetails, fetched
     * when the window opens and each time the laptop opens.
     */
    let { request = null } = $props();

    const TABS = [
        { id: 'boosting', label: 'Boosting' },
        { id: 'market', label: 'Market' },
        { id: 'chops', label: 'Chop lists' },
        { id: 'reputation', label: 'Reputation' },
    ];

    let tab = $state('boosting');
    let loading = $state(false);
    let failed = $state(false);
    let details = $state(null);
    let lastFetch = 0;

    $effect(() => {
        if (request?.page && TABS.some((t) => t.id === request.page)) tab = request.page;
    });

    async function load(force = false) {
        if (loading) return;
        if (!force && Date.now() - lastFetch < 1000) return;
        lastFetch = Date.now();
        loading = true;
        try {
            const res = await fetchNui('GetLSUDetails', {});
            if (res && typeof res === 'object') {
                details = {
                    chopList: res.chopList && typeof res.chopList === 'object' && !Array.isArray(res.chopList) ? res.chopList : null,
                    reputations: Array.isArray(res.reputations) ? res.reputations : [],
                    items: Array.isArray(res.items) ? res.items : [],
                    banned: Array.isArray(res.banned) ? res.banned.length > 0 : Boolean(res.banned),
                    canBoost: Boolean(res.canBoost),
                };
                failed = false;
            } else {
                failed = true;
            }
        } catch {
            failed = true;
        }
        loading = false;
    }

    // Fetch when the window opens and again whenever the laptop is opened.
    $effect(() => {
        if (laptop.visible) untrack(() => load());
    });
</script>

<MainNav items={TABS} active={tab} onselect={(id) => (tab = id)} label="LS Underground" />

<div class="pane">
    {#if !details && loading}
        <div class="loading"><Spinner /> Loading LS Underground</div>
    {:else if !details}
        <div class="state">
            <strong>LS Underground did not answer</strong>
            <p>Check your connection and try again.</p>
            <Button variant="secondary" onclick={() => load(true)}>Try again</Button>
        </div>
    {:else if tab === 'boosting'}
        <Boosting {details} />
    {:else if tab === 'market'}
        <Market items={details.items} banned={details.banned} onordered={() => load(true)} />
    {:else if tab === 'chops'}
        <ChopLists chopList={details.chopList} reputations={details.reputations} />
    {:else}
        <Reputations reputations={details.reputations} />
    {/if}
    {#if details && failed}
        <p class="au-muted refresh-note">The last refresh failed; this page shows what LS Underground sent before.</p>
    {/if}
</div>

<style>
    .refresh-note {
        margin: var(--au-s6) 0 0;
    }
</style>
