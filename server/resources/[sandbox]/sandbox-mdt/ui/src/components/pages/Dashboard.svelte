<script>
    import { Button, Tag, Modal, Select, TextInput, RichText, uid } from '@sandbox/ui-kit';
    import { app, go, hasPerm } from '../../state/app.svelte.js';
    import { store } from '../../state/data.svelte.js';
    import { toast } from '../../state/toasts.svelte.js';
    import { call, list } from '../../lib/api.js';
    import { formatDay, formatDateTime, relative, personName } from '../../lib/format.js';
    import { boloType } from '../../lib/data.js';
    import { resolveRole, pagesFor } from '../../lib/nav.js';
    import State from '../common/State.svelte';

    const role = $derived(resolveRole());
    const pages = $derived(pagesFor(role));
    let status = $state(store.homeLastFetch ? 'ready' : 'loading');
    let notice = $state(null); // { id, title } being viewed
    let noticeData = $state(null);
    let noticeStatus = $state('idle');

    async function refresh() {
        store.homeLastFetch = Date.now();
        if (!store.warrants?.length && !store.notices?.length) status = 'loading';
        const res = await call('GetHomeData', {});
        if (!res || typeof res !== 'object') {
            status = 'error';
            return;
        }
        store.warrants = list(res.warrants);
        store.notices = list(res.notices);
        store.govWorkers = list(res.govWorkers);
        status = 'ready';
    }

    $effect(() => {
        if (app.user && (!store.homeLastFetch || Date.now() - store.homeLastFetch > 120000)) refresh();
        else if (store.homeLastFetch) status = 'ready';
    });

    const warrants = $derived(
        list(store.warrants)
            .filter((w) => !w.state || w.state === 'active')
            .sort((a, b) => new Date(a.expires) - new Date(b.expires)),
    );
    const bolos = $derived(list(store.bolos).slice().sort((a, b) => (b.time ?? 0) - (a.time ?? 0)));
    const notices = $derived(list(store.notices).slice().sort((a, b) => new Date(b.created) - new Date(a.created)));
    const workers = $derived(list(store.govWorkers).slice().sort((a, b) => String(a.Workplace).localeCompare(String(b.Workplace)) || String(a.Last).localeCompare(String(b.Last))));
    const canPost = $derived(hasPerm(['PD_HIGH_COMMAND', 'SAFD_HIGH_COMMAND', 'DOJ_JUDGE', 'GOV_MAYOR', 'GOV_DA', 'GOV_CPUB', 'DOC_HIGH_COMMAND']));
    const canRemoveNotice = $derived(hasPerm(['PD_HIGH_COMMAND', 'SAFD_HIGH_COMMAND', 'DOC_HIGH_COMMAND']));
    const showWorkers = $derived(role === 'police' || app.job?.Id === 'government');

    // Look up: the main task on a police terminal.
    const lookups = $derived(
        [
            { value: 'people', label: 'Person', placeholder: 'Name or state ID' },
            { value: 'vehicles', label: 'Plate or VIN', placeholder: 'For example 46EEK572' },
            { value: 'reports', label: 'Report', placeholder: 'Report number, title or officer' },
        ].filter((l) => pages.includes(l.value)),
    );
    let lookupType = $state('people');
    let lookupTerm = $state('');
    const lookupId = uid('lookup');
    $effect.pre(() => {
        if (lookups.length && !lookups.some((l) => l.value === lookupType)) lookupType = lookups[0].value;
    });

    function lookup(e) {
        e.preventDefault();
        const term = lookupTerm.trim();
        if (!term) return;
        go(lookupType, { term });
    }

    async function openNotice(n) {
        notice = n;
        noticeData = null;
        noticeStatus = 'loading';
        const res = await call('View', { type: 'notice', id: n.id });
        if (res && res.id != null) {
            noticeData = res;
            noticeStatus = 'ready';
        } else noticeStatus = 'error';
    }

    async function removeNotice() {
        const res = await call('Delete', { type: 'notice', id: notice.id });
        if (res) {
            toast.success('Notice removed');
            notice = null;
            refresh();
        } else toast.error('The notice was not removed. Try again.');
    }
</script>

<div class="mdt-page-head">
    <div>
        <h1>Dashboard</h1>
        <p>{formatDay(Date.now())}</p>
    </div>
</div>

{#if lookups.length}
    <form class="lookup" role="search" onsubmit={lookup}>
        <div class="lookup__type">
            <label for="{lookupId}-type">Look up</label>
            <Select id="{lookupId}-type" bind:value={lookupType} options={lookups} />
        </div>
        <div class="lookup__term">
            <label for={lookupId}>Search for</label>
            <TextInput id={lookupId} bind:value={lookupTerm} placeholder={lookups.find((l) => l.value === lookupType)?.placeholder} autocomplete="off" />
        </div>
        <Button type="submit" icon="search">Look up record</Button>
    </form>
{/if}

<div class="mdt-split">
    <div>
        {#if pages.includes('warrants')}
            <section class="mdt-section">
                <div class="mdt-section__head">
                    <h2>Active warrants</h2>
                    <Button variant="tertiary" size="sm" onclick={() => go('warrants')}>All warrants</Button>
                </div>
                {#if status === 'loading'}
                    <State status="loading" title="Loading warrants" />
                {:else if status === 'error'}
                    <State status="error" onretry={refresh} />
                {:else if !warrants.length}
                    <p class="au-muted">No active warrants.</p>
                {:else}
                    <table class="au-table au-table--hover au-table--dense mdt-table">
                        <thead><tr><th scope="col">Number</th><th scope="col">Warrant</th><th scope="col">Issued by</th><th scope="col">Expires</th></tr></thead>
                        <tbody>
                            {#each warrants as w (w.id)}
                                <tr class="is-clickable" tabindex="0" onclick={() => go('warrant', { id: w.id })} onkeydown={(e) => e.key === 'Enter' && go('warrant', { id: w.id })}>
                                    <td class="au-mono">{w.id}</td>
                                    <td><strong>{w.title}</strong></td>
                                    <td>{w.creatorName ?? 'Unknown'}</td>
                                    <td class="nowrap">{relative(w.expires)}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                {/if}
            </section>
        {/if}

        {#if pages.includes('bolos')}
            <section class="mdt-section">
                <div class="mdt-section__head">
                    <h2>Be on the lookout</h2>
                    <Button variant="tertiary" size="sm" onclick={() => go('bolo-new')}>Issue a BOLO</Button>
                </div>
                {#if !bolos.length}
                    <p class="au-muted">No BOLOs are active.</p>
                {:else}
                    <table class="au-table au-table--hover au-table--dense mdt-table">
                        <thead><tr><th scope="col">For</th><th scope="col">BOLO</th><th scope="col">Issued by</th><th scope="col">Issued</th></tr></thead>
                        <tbody>
                            {#each bolos as b (b.id)}
                                <tr class="is-clickable" tabindex="0" onclick={() => go('bolos', { id: b.id })} onkeydown={(e) => e.key === 'Enter' && go('bolos', { id: b.id })}>
                                    <td>{boloType(b.type)}</td>
                                    <td><strong>{b.title}</strong><div class="au-muted">{b.summary}</div></td>
                                    <td>{b.author ? personName(b.author, { callsign: true, initial: true }) : 'Unknown'}</td>
                                    <td class="nowrap">{relative(b.time)}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                {/if}
            </section>
        {/if}
    </div>

    <aside>
        <section class="mdt-section">
            <div class="mdt-section__head">
                <h2>Notices</h2>
                {#if canPost}<Button variant="tertiary" size="sm" onclick={() => go('notice-new')}>Post a notice</Button>{/if}
            </div>
            {#if status === 'ready' && !notices.length}
                <p class="au-muted">No notices for your department.</p>
            {:else if notices.length}
                <ul class="notices">
                    {#each notices as n (n.id)}
                        <li>
                            <button type="button" class="link" onclick={() => openNotice(n)}>{n.title}</button>
                            <span class="au-muted">{formatDay(n.created)}</span>
                        </li>
                    {/each}
                </ul>
            {/if}
        </section>

        {#if showWorkers}
            <section class="mdt-section">
                <h2>Justice staff on duty</h2>
                {#if !workers.length}
                    <p class="au-muted">Nobody from the Department of Justice is on duty.</p>
                {:else}
                    <table class="au-table au-table--dense mdt-table">
                        <thead><tr><th scope="col">Name</th><th scope="col">Phone</th></tr></thead>
                        <tbody>
                            {#each workers as w, i (`${w.SID}-${i}`)}
                                <tr>
                                    <td><strong>{w.Grade} {w.First?.[0]}. {w.Last}</strong><div class="au-muted">{w.Workplace}</div></td>
                                    <td class="au-mono nowrap">{w.Phone}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                {/if}
            </section>
        {/if}
    </aside>
</div>

<Modal open={Boolean(notice)} title={notice?.title ?? 'Notice'} width="680px" onclose={() => (notice = null)}>
    {#if noticeStatus === 'loading'}
        <State status="loading" title="Opening notice" />
    {:else if noticeStatus === 'error'}
        <State status="error" title="The notice could not be opened" onretry={() => openNotice(notice)} />
    {:else if noticeData}
        <RichText tag="div" class="mdt-rich" text={noticeData.description} allowedTags={['h2', 'h3', 'blockquote']} />
        <dl class="au-dl meta">
            <dt>Posted</dt>
            <dd>{formatDateTime(noticeData.created)}</dd>
            <dt>Audience</dt>
            <dd>{noticeData.restricted === 'public' ? 'Everyone' : noticeData.restricted === 'government' ? 'Government' : noticeData.restricted}</dd>
        </dl>
    {/if}
    {#snippet actions()}
        {#if canRemoveNotice && noticeData}<Button variant="danger" onclick={removeNotice}>Remove notice</Button>{/if}
        <Button variant="secondary" onclick={() => (notice = null)}>Close</Button>
    {/snippet}
</Modal>

<style>
    .lookup {
        display: flex;
        align-items: flex-end;
        gap: var(--au-s3);
        padding: var(--au-s4);
        margin: 0 0 var(--au-s6);
        background: var(--au-bg-shade);
        border-top: 4px solid var(--au-ink);
    }
    .lookup label {
        display: block;
        font-weight: 700;
        margin-bottom: var(--au-s1);
    }
    .lookup__type {
        width: 200px;
    }
    .lookup__term {
        width: 420px;
    }
    .notices {
        list-style: none;
        margin: 0;
        padding: 0;
    }
    .notices li {
        display: flex;
        justify-content: space-between;
        gap: var(--au-s3);
        padding: var(--au-s2) 0;
        border-bottom: 1px solid var(--au-border);
    }
    .link {
        border: 0;
        padding: 0;
        background: none;
        color: var(--au-action);
        font: inherit;
        text-align: left;
        text-decoration: underline;
        text-underline-offset: 0.18em;
        cursor: pointer;
    }
    .link:hover {
        color: var(--au-action-hover);
        text-decoration-thickness: 3px;
    }
    .link:focus-visible {
        outline: 3px solid transparent;
        background: var(--au-focus);
        color: var(--au-on-focus);
        text-decoration: none;
        box-shadow: 0 4px var(--au-on-focus);
    }
    .nowrap {
        white-space: nowrap;
    }
    .meta {
        margin-top: var(--au-s4);
    }
</style>
