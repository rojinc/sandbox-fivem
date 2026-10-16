<script>
    import { AppShell, SideNav, Breadcrumbs, Callout, PageAlert, Button, Field, TextInput, Select, Checkbox, Radio, Tag, Card, Tabs, Accordion, ProgressBar, Icon, Modal, EmptyState, Toolbar, Toast, formatMoney } from '@sandbox/ui-kit';

    const navItems = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'people', label: 'People', badge: 3 },
        { id: 'vehicles', label: 'Vehicles' },
        { id: 'reports', label: 'Reports' },
    ];
    let nav = $state('people');
    let section = $state('search');
    let tab = $state('details');
    let name = $state('Jordan Reyes');
    let plate = $state('');
    let dept = $state('lspd');
    let wanted = $state(true);
    let priority = $state('normal');
    let showModal = $state(true);
    let accordionOpen = $state(true);

    const rows = [
        { id: 'LS-1042', name: 'Jordan Reyes', dob: '12 Mar 1994', status: 'Wanted', fine: 2500 },
        { id: 'LS-1043', name: 'Priya Natarajan', dob: '4 Jun 1988', status: 'Clear', fine: 0 },
        { id: 'LS-1044', name: 'Tomás Alvarez', dob: '29 Sep 1999', status: 'Licence suspended', fine: 850 },
        { id: 'LS-1045', name: 'Mei Lin', dob: '17 Jan 2001', status: 'Clear', fine: 0 },
    ];
</script>

<div class="stage">
    <div class="page">
        <AppShell eyebrow="LSPD" title="Mobile data terminal" subline="Unit 12, Mission Row station" {navItems} navActive={nav} onnav={(id) => (nav = id)} asideWidth="220px">
            {#snippet actions()}
                <Button variant="secondary" size="sm" icon="bell">Alerts</Button>
                <Button variant="tertiary" size="sm" icon="logout">Sign out</Button>
            {/snippet}
            {#snippet aside()}
                <SideNav
                    title="People"
                    items={[
                        { id: 'search', label: 'Search', icon: 'search' },
                        { id: 'warrants', label: 'Warrants', icon: 'gavel', badge: 3 },
                        { id: 'bolos', label: 'BOLOs', icon: 'eye' },
                        { id: 'reports', label: 'Reports', icon: 'file-text', children: [{ id: 'mine', label: 'My reports' }, { id: 'all', label: 'All reports' }] },
                    ]}
                    active={section}
                    onselect={(item) => (section = item.id)}
                />
            {/snippet}
            {#snippet footer()}<Icon icon="users" stroke={1.7} /> Shared with every unit on duty{/snippet}

            <Breadcrumbs items={[{ label: 'Home', onclick: () => {} }, { label: 'People', onclick: () => {} }, { label: 'Search' }]} />
            <h1>Search people</h1>
            <p class="au-muted">Find a person by name, state ID or licence plate. Results show warrants and flags from the last 30 days.</p>

            <PageAlert type="warning" title="Shift change at 18:00">Open cases must be handed over before you clock off.</PageAlert>

            <Toolbar>
                <TextInput bind:value={name} placeholder="Name or state ID" block={false} width="320px" />
                <Button icon="search">Search</Button>
                {#snippet right()}<span class="au-hint">4 results</span>{/snippet}
            </Toolbar>

            <table class="au-table au-table--hover">
                <thead><tr><th>State ID</th><th>Name</th><th>Date of birth</th><th>Status</th><th class="is-numeric">Outstanding</th></tr></thead>
                <tbody>
                    {#each rows as r (r.id)}
                        <tr class="is-clickable">
                            <td class="au-mono">{r.id}</td>
                            <td>{r.name}</td>
                            <td>{r.dob}</td>
                            <td>{#if r.status === 'Wanted'}<Tag tone="error">Wanted</Tag>{:else if r.status === 'Clear'}<Tag tone="success">Clear</Tag>{:else}<Tag tone="warning">{r.status}</Tag>{/if}</td>
                            <td class="is-numeric">{formatMoney(r.fine)}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>

            <div class="two-col">
                <div>
                    <h2>New report</h2>
                    <Tabs items={[{ id: 'details', label: 'Details' }, { id: 'evidence', label: 'Evidence', badge: 2 }, { id: 'charges', label: 'Charges' }]} bind:active={tab} />
                    <div class="tabbody">
                        <Field label="Officer" id="officer" hint="Shown on the report header"><TextInput id="officer" bind:value={name} /></Field>
                        <Field label="Vehicle plate" id="plate" error={plate ? '' : 'Enter the plate shown on the vehicle'}>
                            <TextInput id="plate" bind:value={plate} placeholder="ABC 123" mono width="200px" block={false} />
                        </Field>
                        <Field label="Department" id="dept">
                            <Select id="dept" bind:value={dept} options={[{ value: 'lspd', label: 'Los Santos Police' }, { value: 'bcso', label: 'Blaine County Sheriff' }, { value: 'sast', label: 'State Troopers' }]} />
                        </Field>
                        <Field label="Priority">
                            <div class="au-row" style="gap:20px">
                                <Radio bind:group={priority} value="low" name="prio" label="Low" />
                                <Radio bind:group={priority} value="normal" name="prio" label="Normal" />
                                <Radio bind:group={priority} value="high" name="prio" label="High" />
                            </div>
                        </Field>
                        <Checkbox bind:checked={wanted} label="Flag the person as wanted" />
                        <div class="au-row" style="margin-top:20px">
                            <Button>Save report</Button>
                            <Button variant="secondary">Save draft</Button>
                            <Button variant="danger">Delete</Button>
                        </div>
                    </div>
                </div>
                <div>
                    <Callout title="Before you file">Every charge needs a statute reference. Evidence attached after filing shows as a late addition.</Callout>
                    <Card title="Jordan Reyes" subtitle="State ID LS-1042">
                        <dl class="au-dl">
                            <dt>Licence</dt><dd>Class C, suspended</dd>
                            <dt>Last seen</dt><dd>Vespucci Beach, 2 h ago</dd>
                            <dt>Fines</dt><dd class="au-mono">{formatMoney(2500)}</dd>
                        </dl>
                        <ProgressBar label="Case completeness" value={64} showValue />
                    </Card>
                    <Accordion title="Previous charges (3)" bind:open={accordionOpen}>Reckless driving, failure to stop, possession.</Accordion>
                    <Accordion title="Known associates">None on file.</Accordion>
                    <EmptyState icon="inbox" title="No BOLOs">Nothing active in the last 24 hours.</EmptyState>
                </div>
            </div>
        </AppShell>
    </div>

    <div class="side">
        <Toast type="info" message="Tuned to <b>333.3</b> MHz" icon="radio" pinned />
        <Toast type="success" message="Vehicle locked" icon="lock" />
        <Toast type="warning" message="Low fuel, find a station soon" icon="gas-pump" />
        <Toast type="error" message="You don't have enough cash" />
        <Toast message="Package delivered to your mailbox" icon="package" />
        <div class="au-overworld" style="margin-top:24px"><ProgressBar label="Searching the dumpster" value={42} showValue overworld /></div>
    </div>

    <Modal open={showModal} eyebrow="Fleeca" title="Confirm transfer" onclose={() => (showModal = false)} width="440px">
        <p>Send <strong>$2,500</strong> to Priya Natarajan? This cannot be reversed.</p>
        {#snippet actions()}
            <Button variant="secondary" onclick={() => (showModal = false)}>Cancel</Button>
            <Button onclick={() => (showModal = false)}>Send money</Button>
        {/snippet}
    </Modal>
</div>

<style>
    .stage {
        position: absolute;
        inset: 0;
        display: grid;
        grid-template-columns: 1fr 360px;
        gap: 24px;
        padding: 24px;
    }
    .page {
        min-height: 0;
    }
    .side {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .two-col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 32px;
        margin-top: 32px;
    }
    .tabbody {
        padding-top: 16px;
    }
</style>
