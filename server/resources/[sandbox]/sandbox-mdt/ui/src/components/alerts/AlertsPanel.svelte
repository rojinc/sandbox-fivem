<script>
    import { Button, Icon, Tabs, Tag, PageAlert } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import { alerts, myUnitData, myCallsign } from '../../state/alerts.svelte.js';
    import { formatClock24, sentenceCase } from '../../lib/format.js';
    import { UnitTypes } from '../../lib/data.js';
    import { toggleAvailability, toggleAttached, dismissAlert, routeToAlert, viewCamera, swapToRadio } from '../../lib/alerts.js';

    /** Emergency alerts, docked on the right edge while SET_SHOWING is true (GRAVE key in Lua). */
    let tab = $state('alerts');

    const list = $derived([...alerts.alerts].sort((a, b) => (b.time ?? 0) - (a.time ?? 0)));
    const me = $derived(myUnitData());
    const callsign = $derived(myCallsign());
    const units = $derived(
        Object.entries(alerts.units ?? {})
            .flatMap(([job, arr]) => (Array.isArray(arr) ? arr : []).map((u) => ({ ...u, job: u.job ?? job })))
            .sort((a, b) => String(a.job).localeCompare(String(b.job)) || String(a.primary).localeCompare(String(b.primary), undefined, { numeric: true })),
    );
    const radios = $derived(Array.isArray(alerts.radioNames) ? alerts.radioNames : []);
    const live = $derived(alerts.status === 'connected');

    const JOBS = { police: 'Police', ems: 'EMS', prison: 'DOC', tow: 'Tow' };
    const STYLE_WORD = { 1: 'Police', 2: 'EMS', 3: 'Tow' };

    function kind(a) {
        if (a.panic) return { tone: 'panic', word: 'Panic' };
        const style = Number(a.style);
        if (style === 1) return { tone: 'police', word: 'Police' };
        if (style === 2) return { tone: 'ems', word: 'EMS' };
        if (style === 3) return { tone: 'tow', word: 'Tow' };
        const t = Array.isArray(a.type) ? a.type[0] : a.type;
        if (typeof t === 'string' && t.startsWith('ems')) return { tone: 'ems', word: 'EMS' };
        if (typeof t === 'string' && t.startsWith('tow')) return { tone: 'tow', word: 'Tow' };
        return { tone: 'police', word: STYLE_WORD[style] ?? 'Police' };
    }

    function where(a) {
        const l = a.location ?? {};
        const streets = [l.street1, l.street2].filter((s) => typeof s === 'string' && s.trim()).join(' and ');
        const area = typeof l.area === 'string' && l.area.trim() ? l.area : '';
        return [streets, area].filter(Boolean).join(', ') || 'Location not given';
    }

    const details = (a) => (typeof a.description === 'string' ? a.description : a.description?.details) || '';
    const attachedList = (a) => (Array.isArray(a.attached) ? a.attached : []);

    function toggle(id) {
        alerts.selected = alerts.selected === id ? null : id;
    }

    async function route(a) {
        await routeToAlert(a);
    }
</script>

<section class="panel" aria-label="Emergency alerts">
    <header class="head">
        <div class="ident">
            <strong class="eyebrow">Dispatch</strong>
            <h2>Emergency alerts</h2>
            <div class="sub">
                {#if me}
                    Unit <span class="au-mono">{me.primary}</span>{#if me.operatingUnder}, with <span class="au-mono">{me.operatingUnder}</span>{/if}, {me.available === false ? 'unavailable' : 'available'}
                {:else}
                    Not signed in to dispatch
                {/if}
            </div>
        </div>
        <button type="button" class="close" aria-label="Close alerts" onclick={() => fetchNui('CloseAlerts')}><Icon icon="x" size={22} /></button>
    </header>

    {#if me}
        <div class="unit-bar">
            <Button variant="secondary" size="sm" onclick={toggleAvailability} disabled={!live}>{me.available === false ? 'Mark available' : 'Mark unavailable'}</Button>
        </div>
    {/if}

    <div class="tabs">
        <Tabs
            bind:active={tab}
            items={[
                { id: 'alerts', label: 'Alerts', badge: list.length },
                { id: 'units', label: 'Units', badge: units.length },
                { id: 'radio', label: 'Radio' },
            ]}
        />
    </div>

    <div class="body">
        {#if alerts.status === 'offline'}
            <div class="notice"><PageAlert type="warning" compact>Dispatch is offline. The terminal keeps retrying; new calls appear when it reconnects.</PageAlert></div>
        {/if}

        {#if tab === 'alerts'}
            {#if !list.length}
                <div class="empty">
                    <strong>No calls in the last 30 minutes</strong>
                    New alerts appear here as dispatch sends them.
                </div>
            {:else}
                <ol class="alerts">
                    {#each list as a (a.id)}
                        {@const k = kind(a)}
                        {@const open = alerts.selected === a.id}
                        {@const attached = attachedList(a)}
                        <li class="alert alert--{k.tone}" class:is-open={open}>
                            <button type="button" class="row" aria-expanded={open} onclick={() => toggle(a.id)}>
                                <span class="what">
                                    <strong>{a.code} {sentenceCase(a.title)}</strong>
                                    <span class="where">{where(a)}</span>
                                </span>
                                <span class="when">
                                    <span class="au-mono">{formatClock24(a.time)}</span>
                                    <span class="word">{k.word}</span>
                                </span>
                            </button>
                            {#if open}
                                <div class="more">
                                    {#if details(a)}<p>{details(a)}</p>{/if}
                                    <p class="units">
                                        {#if attached.length}Attached: <span class="au-mono">{attached.join(', ')}</span>{:else}No units attached{/if}
                                    </p>
                                    <div class="actions">
                                        <Button size="sm" onclick={() => route(a)} disabled={!a.location}>Set route</Button>
                                        {#if !a.client && callsign}
                                            <Button variant="secondary" size="sm" disabled={!live} onclick={() => toggleAttached(a)}>{attached.includes(callsign) ? 'Detach my unit' : 'Attach my unit'}</Button>
                                        {/if}
                                        {#if a.camera}<Button variant="secondary" size="sm" onclick={() => viewCamera(a)}>View camera</Button>{/if}
                                        <Button variant="tertiary" size="sm" onclick={() => dismissAlert(a)}>Dismiss</Button>
                                    </div>
                                </div>
                            {/if}
                        </li>
                    {/each}
                </ol>
            {/if}
        {:else if tab === 'units'}
            {#if !units.length}
                <div class="empty"><strong>No units on duty</strong>Units appear when officers, medics and tow drivers go on duty.</div>
            {:else}
                <table class="au-table au-table--dense">
                    <thead><tr><th scope="col">Unit</th><th scope="col">Name</th><th scope="col">Type</th><th scope="col">Status</th></tr></thead>
                    <tbody>
                        {#each units as u (`${u.job}-${u.source}`)}
                            <tr class:is-selected={me && u.source === me.source && u.job === me.job}>
                                <td class="au-mono">{u.primary}</td>
                                <td>
                                    {u.character ? `${u.character.First?.[0] ?? ''}. ${u.character.Last ?? ''}` : 'Unknown'}
                                    <span class="au-muted">{JOBS[u.job] ?? u.job}</span>
                                </td>
                                <td>{UnitTypes[u.type] ?? 'Unit'}{#if u.operatingUnder}<span class="au-muted">, with <span class="au-mono">{u.operatingUnder}</span></span>{/if}</td>
                                <td>{#if u.available === false}<Tag tone="warning">Busy</Tag>{:else}<Tag tone="success">Available</Tag>{/if}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            {/if}
        {:else}
            {#if !radios.length}
                <div class="empty"><strong>No radio channels listed</strong>Dispatch lists shared channels here.</div>
            {:else}
                <table class="au-table au-table--dense">
                    <thead><tr><th scope="col">Channel</th><th scope="col">Used by</th><th scope="col"><span class="au-hidden">Actions</span></th></tr></thead>
                    <tbody>
                        {#each radios as r, i (`${r.radio}-${i}`)}
                            <tr>
                                <td class="au-mono">{r.radio}</td>
                                <td>{r.text}</td>
                                <td class="right"><Button variant="tertiary" size="sm" onclick={() => swapToRadio(r.radio)}>Switch radio</Button></td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            {/if}
        {/if}
    </div>

    <footer class="foot">
        <Icon icon="broadcast" />
        {#if alerts.status === 'connected'}Connected to dispatch{:else if alerts.status === 'connecting'}Connecting to dispatch{:else if alerts.status === 'offline'}Dispatch offline, retrying{:else}Dispatch not connected{/if}
    </footer>
</section>

<style>
    .panel {
        position: absolute;
        top: 24px;
        right: 24px;
        bottom: 24px;
        width: 460px;
        display: flex;
        flex-direction: column;
        background: var(--au-bg);
        color: var(--au-text);
        border: 1px solid var(--au-border);
        z-index: 20;
    }
    .head {
        display: flex;
        align-items: flex-start;
        gap: var(--au-s3);
        padding: var(--au-s4) var(--au-s5) var(--au-s3);
        border-bottom: 4px solid var(--au-ink);
    }
    .ident {
        flex: 1;
        min-width: 0;
    }
    .eyebrow {
        display: block;
        font-weight: 800;
    }
    h2 {
        margin: 0;
        font-size: var(--au-fs-md);
    }
    .sub {
        color: var(--au-muted);
        margin-top: 2px;
    }
    .close {
        display: grid;
        place-items: center;
        width: 44px;
        height: 44px;
        margin: -6px -10px 0 0;
        border: 0;
        background: transparent;
        color: var(--au-text);
        cursor: pointer;
    }
    .close:hover {
        background: var(--au-bg-alt);
    }
    .close:focus-visible {
        outline: 3px solid transparent;
        background: var(--au-focus);
        color: var(--au-on-focus);
    }
    .unit-bar {
        padding: var(--au-s3) var(--au-s5) 0;
    }
    .tabs {
        padding: var(--au-s2) var(--au-s5) 0;
    }
    .body {
        flex: 1;
        min-height: 0;
        overflow: auto;
        padding: var(--au-s3) var(--au-s5);
    }
    .notice {
        margin-bottom: var(--au-s3);
    }
    .empty {
        padding: var(--au-s6) 0;
        color: var(--au-muted);
    }
    .empty strong {
        display: block;
        color: var(--au-text);
        margin-bottom: var(--au-s1);
    }
    .alerts {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: var(--au-s2);
    }
    .alert {
        --tint: var(--au-bg-alt);
        background: var(--tint);
    }
    .alert--panic {
        --tint: var(--au-error-bg);
    }
    .alert--police {
        --tint: var(--au-info-bg);
    }
    .alert--ems {
        --tint: var(--au-warning-bg);
    }
    .alert--tow {
        --tint: var(--au-bg-alt);
    }
    .row {
        display: flex;
        align-items: flex-start;
        gap: var(--au-s3);
        width: 100%;
        padding: var(--au-s3) var(--au-s4);
        border: 0;
        background: transparent;
        color: var(--au-text);
        font: inherit;
        text-align: left;
        cursor: pointer;
    }
    .row:hover strong {
        text-decoration: underline;
        text-underline-offset: 0.2em;
    }
    .row:focus-visible {
        outline: 3px solid var(--au-focus);
        outline-offset: -3px;
    }
    .what {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
    }
    .where {
        color: var(--au-muted);
    }
    .when {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        flex-shrink: 0;
    }
    .word {
        color: var(--au-muted);
    }
    .alert--panic .word {
        color: var(--au-error);
        font-weight: 700;
    }
    .more {
        padding: 0 var(--au-s4) var(--au-s3);
    }
    .more p {
        margin: 0 0 var(--au-s2);
    }
    .units {
        color: var(--au-muted);
    }
    .actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--au-s2);
        align-items: center;
    }
    .right {
        text-align: right;
    }
    .foot {
        display: flex;
        align-items: center;
        gap: var(--au-s2);
        padding: var(--au-s3) var(--au-s5);
        border-top: 4px solid var(--au-ink);
        background: var(--au-bg-shade);
        color: var(--au-muted);
    }
</style>
