<script>
    import { AppShell, Button, Icon, Toast } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import { app, go } from '../../state/app.svelte.js';
    import { alerts } from '../../state/alerts.svelte.js';
    import { toasts } from '../../state/toasts.svelte.js';
    import { resolveRole, navItems, pagesFor, SECTION_OF, departmentShort, departmentName, terminalTitle, signedInLine } from '../../lib/nav.js';

    import Dashboard from '../pages/Dashboard.svelte';
    import People from '../pages/People.svelte';
    import Person from '../pages/Person.svelte';
    import Vehicles from '../pages/Vehicles.svelte';
    import Vehicle from '../pages/Vehicle.svelte';
    import Reports from '../pages/Reports.svelte';
    import Report from '../pages/Report.svelte';
    import ReportEditor from '../pages/ReportEditor.svelte';
    import Warrants from '../pages/Warrants.svelte';
    import Warrant from '../pages/Warrant.svelte';
    import Bolos from '../pages/Bolos.svelte';
    import BoloNew from '../pages/BoloNew.svelte';
    import NoticeNew from '../pages/NoticeNew.svelte';
    import Charges from '../pages/Charges.svelte';
    import Roster from '../pages/Roster.svelte';
    import Library from '../pages/Library.svelte';
    import Admin from '../pages/Admin.svelte';
    import Properties from '../pages/Properties.svelte';
    import Firearms from '../pages/Firearms.svelte';
    import Firearm from '../pages/Firearm.svelte';
    import Inmates from '../pages/Inmates.svelte';
    import Visitation from '../pages/Visitation.svelte';
    import NoCallsign from '../pages/NoCallsign.svelte';

    const PAGES = {
        dashboard: Dashboard,
        people: People,
        person: Person,
        vehicles: Vehicles,
        vehicle: Vehicle,
        reports: Reports,
        report: Report,
        'report-edit': ReportEditor,
        warrants: Warrants,
        warrant: Warrant,
        bolos: Bolos,
        'bolo-new': BoloNew,
        'notice-new': NoticeNew,
        charges: Charges,
        roster: Roster,
        library: Library,
        admin: Admin,
        properties: Properties,
        firearms: Firearms,
        firearm: Firearm,
        inmates: Inmates,
        visitation: Visitation,
    };

    const role = $derived(resolveRole());
    const items = $derived(navItems(role));
    const allowed = $derived(pagesFor(role));
    const section = $derived(SECTION_OF[app.page] ?? app.page);
    const needsCallsign = $derived(role === 'police' && app.user && !app.user.Callsign);
    const pageOk = $derived(allowed.includes(section));
    const Page = $derived(needsCallsign ? NoCallsign : pageOk ? (PAGES[app.page] ?? Dashboard) : PAGES[allowed[0]] ?? Dashboard);
    const hasDispatch = $derived(['police', 'ems', 'doc'].includes(role));
    const dispatchText = $derived(
        alerts.status === 'connected' ? 'Dispatch connected' : alerts.status === 'connecting' ? 'Connecting to dispatch' : alerts.status === 'offline' ? 'Dispatch offline, retrying' : 'Dispatch not connected',
    );
</script>

<div class="terminal" class:is-hidden={!app.visible} aria-hidden={!app.visible}>
    <AppShell eyebrow={departmentShort()} title={terminalTitle()} subline={signedInLine()} navItems={items} navActive={section} onnav={(id) => go(id)}>
        {#snippet actions()}
            <Button variant="secondary" size="sm" icon="x" onclick={() => fetchNui('Close')}>Close terminal</Button>
        {/snippet}
        {#snippet footer()}
            <span class="meta"><Icon icon="building" />{departmentName()}</span>
            {#if hasDispatch}<span class="meta-right">{dispatchText}</span>{/if}
        {/snippet}

        {#key `${needsCallsign}:${app.page}:${JSON.stringify(app.params)}`}
            <Page params={app.params} />
        {/key}
    </AppShell>

    {#if toasts.list.length}
        <div class="toasts" aria-live="polite">
            {#each toasts.list as t (t.id)}
                <Toast type={t.type} message={t.message} />
            {/each}
        </div>
    {/if}
</div>

<style>
    .terminal {
        position: absolute;
        inset: 0;
        margin: auto;
        width: 1500px;
        height: 860px;
        max-width: calc(100% - 48px);
        max-height: calc(100% - 48px);
        contain: layout paint;
        background: var(--au-bg);
    }
    .terminal.is-hidden {
        display: none;
    }
    .meta {
        display: inline-flex;
        align-items: center;
        gap: var(--au-s2);
    }
    .meta-right {
        margin-left: auto;
    }
    .toasts {
        position: absolute;
        right: var(--au-s6);
        bottom: 72px;
        width: 380px;
        display: flex;
        flex-direction: column;
        gap: var(--au-s2);
        z-index: 50;
    }
</style>
