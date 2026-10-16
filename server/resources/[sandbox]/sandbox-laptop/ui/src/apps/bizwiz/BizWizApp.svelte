<script>
    import { untrack } from 'svelte';
    import { SideNav } from '@sandbox/ui-kit';
    import { data, asList } from '../../state/data.svelte.js';
    import { hasJobPerm } from '../../lib/perms.js';
    import { PAGES, PARENT, LABELS } from './pages.js';
    import NotAvailable from '../../components/common/NotAvailable.svelte';

    /**
     * BizWiz: business tools for the job you are on duty for. The pages
     * (businessPages) and the logo come from Lua when you clock in at a
     * business that uses BizWiz; each page may need a job permission.
     */
    let { request = null } = $props();

    const pages = $derived(asList(data.businessPages));
    const hasAccess = $derived(Boolean(data.businessLogo) && pages.length > 0);
    const job = $derived(asList(data.player?.Jobs).find((j) => j.Id == data.onDuty) ?? null);
    const navItems = $derived(
        pages
            .filter((p) => !p.hidden && (!p.permission || hasJobPerm(p.permission, data.onDuty)))
            .map((p) => ({ id: p.id, label: LABELS[p.id] ?? p.label ?? p.id })),
    );

    let page = $state('Dashboard');
    let params = $state({});
    let logoFailed = $state(false);

    function nav(id, next = {}) {
        if (pages.some((p) => p.id === id)) {
            page = id;
            params = next ?? {};
        } else {
            page = 'Dashboard';
            params = {};
        }
    }

    $effect(() => {
        const r = request;
        if (r?.page) untrack(() => nav(r.page, r.id ? { id: r.id } : {}));
    });

    // Clocking in at another business resets the app to its notice board.
    $effect(() => {
        void data.onDuty;
        if (!pages.some((p) => p.id === page)) {
            page = 'Dashboard';
            params = {};
        }
    });

    const Page = $derived(PAGES[page] ?? null);
    const current = $derived(PARENT[page] ?? page);
</script>

{#if !hasAccess}
    <div class="pane">
        <h3 class="heading">Clock in to use BizWiz</h3>
        <p class="lead">Your business tools open here while you are on duty at a business that uses them. Go on duty at your job and this window fills in.</p>
    </div>
{:else}
    <div class="biz">
        <aside class="biz__aside">
            <div class="biz__id">
                {#if !logoFailed}
                    <img class="biz__logo" src={data.businessLogo} alt="" onerror={() => (logoFailed = true)} />
                {/if}
                <div>
                    <strong class="biz__name">{job?.Workplace?.Name ?? job?.Name ?? 'Your business'}</strong>
                    {#if job?.Grade?.Name}<span class="biz__grade">{job.Grade.Name}</span>{/if}
                </div>
            </div>
            <SideNav items={navItems} active={current} onselect={(item) => nav(item.id)} title="Pages" />
        </aside>
        <div class="pane">
            {#if Page}
                {#key `${page}:${params.id ?? ''}`}
                    <Page {params} onnav={nav} />
                {/key}
            {:else}
                <NotAvailable name={LABELS[page] ?? 'This page'} detail="This BizWiz page has not been rebuilt for this version of the laptop yet. Use another page for now." />
            {/if}
        </div>
    </div>
{/if}

<style>
    .biz {
        flex: 1;
        min-height: 0;
        display: flex;
    }
    .biz__aside {
        width: 260px;
        flex-shrink: 0;
        border-right: 1px solid var(--au-border);
        background: var(--au-bg-shade);
        overflow: auto;
        padding-bottom: var(--au-s4);
    }
    .biz__id {
        display: flex;
        align-items: center;
        gap: var(--au-s3);
        padding: var(--au-s4);
        margin-bottom: var(--au-s3);
        border-bottom: 1px solid var(--au-border);
    }
    .biz__logo {
        width: 56px;
        height: 56px;
        object-fit: contain;
        flex-shrink: 0;
    }
    .biz__name {
        display: block;
        line-height: 1.3;
    }
    .biz__grade {
        display: block;
        color: var(--au-muted);
    }
    .biz :global(.au-sidenav__title) {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
    }
</style>
