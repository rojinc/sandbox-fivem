<script>
    import {
        AppShell,
        SideNav,
        Breadcrumbs,
        Callout,
        PageAlert,
        Button,
        Field,
        TextInput,
        Select,
        Checkbox,
        Radio,
        Tag,
        Card,
        Tabs,
        Accordion,
        ProgressBar,
        Kbd,
        Icon,
        RichText,
        Modal,
        EmptyState,
        Toolbar,
        Spinner,
        formatMoney,
    } from '@sandbox/ui-kit';

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
        <AppShell
            title="Mobile Data Terminal"
            subline="Los Santos Police Department"
            navItems={navItems}
            navActive={nav}
            onnav={(id) => (nav = id)}
            asideWidth="220px"
        >
            {#snippet brand()}<span class="brand">SANDBOX<span>RP</span></span>{/snippet}
            {#snippet actions()}
                <Button variant="secondary" size="sm" icon="bell">Alerts</Button>
                <Button variant="primary" size="sm" icon="right-from-bracket">Sign out</Button>
            {/snippet}
            {#snippet navRight()}<span class="au-hint">Unit 12 · On duty</span>{/snippet}
            {#snippet aside()}
                <SideNav
                    title="People"
                    items={[
                        { id: 'search', label: 'Search', icon: 'magnifying-glass' },
                        { id: 'warrants', label: 'Warrants', icon: 'gavel', badge: 3 },
                        { id: 'bolos', label: 'BOLOs', icon: 'eye' },
                        { id: 'reports', label: 'Reports', icon: 'file-lines', children: [{ id: 'mine', label: 'My reports' }, { id: 'all', label: 'All reports' }] },
                    ]}
                    active={section}
                    onselect={(item) => (section = item.id)}
                />
            {/snippet}
            {#snippet footer()}
                <span>SandboxRP · MDT v2</span><span>Help: <Kbd>F1</Kbd></span>
            {/snippet}

            <Breadcrumbs items={[{ label: 'Home', onclick: () => {} }, { label: 'People', onclick: () => {} }, { label: 'Search' }]} />
            <h1>Search people</h1>
            <p>Find a person by name, state ID or licence plate. Results show warrants and flags from the last 30 days.</p>

            <PageAlert type="warning" title="Shift change at 18:00">Open cases must be handed over before you clock off.</PageAlert>

            <Toolbar>
                <TextInput bind:value={name} placeholder="Name or state ID" block={false} width="320px" />
                <Button icon="magnifying-glass">Search</Button>
                <Button variant="tertiary">Clear</Button>
                {#snippet right()}<Tag tone="action">4 results</Tag>{/snippet}
            </Toolbar>

            <table class="au-table au-table--striped au-table--hover">
                <thead><tr><th>State ID</th><th>Name</th><th>Date of birth</th><th>Status</th><th class="is-numeric">Outstanding</th></tr></thead>
                <tbody>
                    {#each rows as r (r.id)}
                        <tr class="is-clickable">
                            <td class="au-mono">{r.id}</td>
                            <td>{r.name}</td>
                            <td>{r.dob}</td>
                            <td>
                                {#if r.status === 'Wanted'}<Tag tone="error" solid>Wanted</Tag>{:else if r.status === 'Clear'}<Tag tone="success">Clear</Tag>{:else}<Tag tone="warning">{r.status}</Tag>{/if}
                            </td>
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
                        <Field label="Officer" id="officer" hint="Shown on the report header">
                            <TextInput id="officer" bind:value={name} />
                        </Field>
                        <Field label="Vehicle plate" id="plate" error={plate ? '' : 'Enter the plate shown on the vehicle'} required>
                            <TextInput id="plate" bind:value={plate} placeholder="ABC 123" invalid={!plate} mono width="200px" block={false} />
                        </Field>
                        <Field label="Department" id="dept">
                            <Select id="dept" bind:value={dept} options={[{ value: 'lspd', label: 'Los Santos Police' }, { value: 'bcso', label: 'Blaine County Sheriff' }, { value: 'sast', label: 'State Troopers' }]} />
                        </Field>
                        <Field label="Priority">
                            <div class="au-row">
                                <Radio bind:group={priority} value="low" name="prio" label="Low" />
                                <Radio bind:group={priority} value="normal" name="prio" label="Normal" />
                                <Radio bind:group={priority} value="high" name="prio" label="High" />
                            </div>
                        </Field>
                        <Checkbox bind:checked={wanted} label="Flag the person as wanted" />
                        <div class="au-row" style="margin-top:16px">
                            <Button>Save report</Button>
                            <Button variant="secondary">Save draft</Button>
                            <Button variant="danger" size="sm">Delete</Button>
                            <Spinner size={20} />
                        </div>
                    </div>
                </div>
                <div>
                    <Callout title="Before you file">
                        <p>Every charge needs a statute reference. Evidence attached after filing shows as a late addition. Use <RichText text={'{key}F3{/key} to attach the body-cam clip'} /> from the vehicle.</p>
                    </Callout>
                    <Card title="Jordan Reyes" subtitle="State ID LS-1042">
                        <dl class="au-dl">
                            <dt>Licence</dt><dd>Class C · suspended</dd>
                            <dt>Last seen</dt><dd>Vespucci Beach, 2 h ago</dd>
                            <dt>Fines</dt><dd class="au-mono">{formatMoney(2500)}</dd>
                        </dl>
                        <ProgressBar label="Case completeness" value={64} showValue />
                        {#snippet footer()}<Button variant="tertiary" size="sm" iconRight="arrow-right">Open full record</Button>{/snippet}
                    </Card>
                    <Accordion title="Previous charges (3)" bind:open={accordionOpen}>
                        <ul><li>Reckless driving · 12 Feb</li><li>Failure to stop · 3 Mar</li><li>Possession · 9 Apr</li></ul>
                    </Accordion>
                    <Accordion title="Known associates">None on file.</Accordion>
                    <EmptyState icon="inbox" title="No BOLOs">Nothing active in the last 24 hours.</EmptyState>
                </div>
            </div>
        </AppShell>
    </div>

    <div class="overworld au-dark">
        <div class="menu">
            <div class="menu__head">Vehicle <span class="au-muted">4 options</span></div>
            <button class="menu__item is-active" type="button"><Icon icon="key" fixedWidth /> Lock vehicle <span class="au-mono">F</span></button>
            <button class="menu__item" type="button"><Icon icon="car-side" fixedWidth /> Open trunk</button>
            <button class="menu__item" type="button"><Icon icon="gas-pump" fixedWidth /> Refuel <Tag tone="info">$34</Tag></button>
            <button class="menu__item" type="button" disabled><Icon icon="wrench" fixedWidth /> Repair (no kit)</button>
            <div class="menu__foot"><Kbd>↑</Kbd><Kbd>↓</Kbd> choose · <Kbd>Enter</Kbd> select · <Kbd>Esc</Kbd> close</div>
        </div>
        <PageAlert type="success" title="Payment received" compact>$2,500 from LSPD payroll</PageAlert>
        <PageAlert type="error" compact>You cannot carry that much.</PageAlert>
        <div class="menu" style="padding:16px">
            <Field label="Amount" id="amt"><TextInput id="amt" value="250" mono /></Field>
            <div class="au-row"><Button>Confirm</Button><Button variant="secondary">Cancel</Button></div>
        </div>
    </div>

    <Modal open={showModal} title="Confirm transfer" onclose={() => (showModal = false)} width="460px">
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
    .brand {
        font-weight: 700;
        letter-spacing: 0.08em;
        padding-right: 16px;
        border-right: 1px solid var(--au-border);
    }
    .brand span {
        color: var(--au-action);
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
    .overworld {
        display: flex;
        flex-direction: column;
        gap: 16px;
        align-content: start;
    }
    .menu {
        background: var(--au-bg);
        color: var(--au-text);
        border-radius: var(--au-radius);
        box-shadow: var(--au-shadow-2);
        overflow: hidden;
    }
    .menu__head {
        display: flex;
        justify-content: space-between;
        padding: 12px 16px;
        font-weight: 700;
        background: var(--au-bg-alt);
    }
    .menu__item {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 10px 16px;
        border: 0;
        border-left: 4px solid transparent;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
    }
    .menu__item:hover {
        background: var(--au-bg-shade);
    }
    .menu__item.is-active {
        border-left-color: var(--au-action);
        background: var(--au-bg-shade);
        font-weight: 700;
    }
    .menu__item:disabled {
        opacity: 0.5;
    }
    .menu__item .au-mono,
    .menu__item :global(.au-tag) {
        margin-left: auto;
    }
    .menu__foot {
        padding: 8px 16px;
        font-size: 13px;
        color: var(--au-muted);
        background: var(--au-bg-alt-shade);
        display: flex;
        gap: 6px;
        align-items: center;
    }
</style>
