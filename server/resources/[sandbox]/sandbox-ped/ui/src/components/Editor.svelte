<script>
    import { Header, SideNav, Button, PageAlert, formatMoney } from '@sandbox/ui-kit';
    import { app, price, selectSection } from '../state/app.svelte.js';
    import { pedState } from '../state/ped.svelte.js';
    import { MODES, MAX_TATTOOS, sectionDef } from '../data/sections.js';
    import SectionBody from './sections/SectionBody.svelte';
    import CameraBar from './CameraBar.svelte';

    /**
     * The editor docked on the right third of the screen, so the ped stays in
     * view on the left: identity header, section list, the open section's
     * controls, camera row and the save / cancel footer.
     */
    let { height } = $props();

    const mode = $derived(MODES[app.mode]);
    const tattoos = $derived(pedState.ped.customization.tattoos);
    // Zone sections show how many tattoo slots each zone holds.
    const sections = $derived(
        (mode?.sections ?? [])
            .map(sectionDef)
            .filter(Boolean)
            .map((s) => {
                const n = s.zone ? tattoos.filter((t) => t.Zone === s.zone).length : 0;
                return n ? { ...s, badge: n } : s;
            }),
    );
    const current = $derived(sectionDef(app.section) ?? sections[0]);
    const cost = $derived(price());
    const subline = $derived(current?.naked ? `${tattoos.length} of ${MAX_TATTOOS} tattoo slots used` : undefined);

    // Long lists get group headings (Face, Hair, Body, Clothing, Tattoos).
    const groups = $derived.by(() => {
        if (sections.length <= 6) return [{ title: undefined, items: sections }];
        const out = [];
        for (const s of sections) {
            let g = out.find((x) => x.title === s.group);
            if (!g) out.push((g = { title: s.group, items: [] }));
            g.items.push(s);
        }
        return out;
    });

    let scroller = $state();
    $effect(() => {
        void app.section;
        if (scroller) scroller.scrollTop = 0;
    });

    const errorText = $derived(
        app.error === 'payment'
            ? `Your changes are not saved. You need ${formatMoney(cost)} in cash to pay for them.`
            : app.error === 'save'
              ? 'Your character was not saved. Try saving again.'
              : null,
    );
</script>

<aside class="ped-panel" style:height="{height}px" aria-label="Character editor">
    <Header eyebrow={mode?.eyebrow} title={current?.title} {subline} class="ped-panel__header">
        {#snippet actions()}
            {#if app.mode !== 'CREATOR'}
                <div class="ped-total">
                    <span class="ped-total__label">Total</span>
                    <strong class="ped-total__value au-mono">{formatMoney(cost)}</strong>
                </div>
            {/if}
        {/snippet}
    </Header>

    <div class="ped-panel__body">
        <div class="ped-panel__nav">
            {#each groups as g (g.title ?? 'all')}
                <SideNav title={g.title} items={g.items} active={app.section} onselect={(item) => selectSection(item.id)} class="ped-nav-group" />
            {/each}
        </div>
        <div class="ped-panel__content" bind:this={scroller} inert={app.busy || undefined}>
            {#key app.section}
                <SectionBody section={app.section} />
            {/key}
        </div>
    </div>

    <CameraBar />

    <footer class="ped-panel__footer">
        {#if errorText}
            <PageAlert type="error" compact>{errorText}</PageAlert>
        {/if}
        <div class="ped-panel__actions">
            <Button
                disabled={app.saving || app.busy}
                onclick={() => {
                    app.error = null;
                    app.dialog = 'save';
                }}
            >{app.mode === 'CREATOR' ? 'Save character' : 'Save changes'}</Button>
            {#if mode?.canCancel}
                <Button variant="secondary" disabled={app.saving} onclick={() => (app.dialog = 'cancel')}>Cancel</Button>
            {/if}
        </div>
    </footer>
</aside>

<style>
    .ped-panel {
        position: fixed;
        top: 0;
        right: 0;
        width: 640px;
        display: flex;
        flex-direction: column;
        background: var(--au-bg);
        color: var(--au-text);
        border-left: 1px solid var(--au-border);
    }
    .ped-panel :global(.ped-panel__header) {
        flex-shrink: 0;
    }
    .ped-total {
        display: flex;
        align-items: baseline;
        gap: var(--au-s2);
        font-size: var(--au-fs-xs);
    }
    .ped-total__label {
        color: var(--au-muted);
    }
    .ped-total__value {
        font-size: var(--au-fs-sm);
    }
    .ped-panel__body {
        flex: 1;
        min-height: 0;
        display: flex;
    }
    .ped-panel__nav {
        width: 184px;
        flex-shrink: 0;
        overflow-y: auto;
        padding: var(--au-s4) 0;
        border-right: 1px solid var(--au-border);
    }
    .ped-panel__nav :global(.ped-nav-group + .ped-nav-group) {
        margin-top: var(--au-s4);
    }
    .ped-panel__content {
        flex: 1;
        min-width: 0;
        overflow-y: auto;
        padding: var(--au-s5) var(--au-s5) var(--au-s4) var(--au-s6);
    }
    .ped-panel__footer {
        flex-shrink: 0;
        padding: var(--au-s3) var(--au-s5) var(--au-s4);
        border-top: 1px solid var(--au-border);
    }
    .ped-panel__footer :global(.au-alert) {
        margin-bottom: var(--au-s3);
    }
    .ped-panel__actions {
        display: flex;
        align-items: center;
        gap: var(--au-s3);
    }
</style>
