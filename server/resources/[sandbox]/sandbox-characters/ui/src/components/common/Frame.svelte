<script>
    import { AppShell, Kbd } from '@sandbox/ui-kit';
    import logo from '../../assets/logo.webp';

    /**
     * The gov page every screen sits in: navy header band with the wordmark,
     * title and subline, a white content column with an optional right column
     * (`side` snippet), and a footer band with the key hints.
     *
     * hints: [{ keys: ['Enter'], label: 'Play' }]
     */
    let { title, subline, hints = [], side, children } = $props();
</script>

<div class="cs-frame">
    <AppShell {title} {subline} padded={false}>
        {#snippet brand()}
            <img class="frame__logo" src={logo} alt="SandboxRP" draggable="false" />
        {/snippet}
        {#snippet footer()}
            <span class="frame__foot-brand">SandboxRP</span>
            <span class="frame__hints">
                {#each hints as h (h.label)}
                    <span class="frame__hint">
                        {#each h.keys as k (k)}<Kbd>{k}</Kbd>{/each}
                        <span>{h.label}</span>
                    </span>
                {/each}
            </span>
        {/snippet}

        <div class="frame__columns" class:frame__columns--single={!side}>
            <div class="frame__main">{@render children?.()}</div>
            {#if side}
                <aside class="frame__side">{@render side()}</aside>
            {/if}
        </div>
    </AppShell>
</div>

<style>
    .frame__logo {
        height: 44px;
        width: auto;
        margin-right: 8px;
    }
    .frame__columns {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 400px;
        height: 100%;
    }
    .frame__columns--single {
        grid-template-columns: minmax(0, 1fr);
    }
    .frame__main {
        min-width: 0;
        overflow: auto;
        padding: 24px 32px 32px;
    }
    .frame__side {
        min-width: 0;
        overflow: auto;
        padding: 24px 32px 32px 28px;
        border-left: 1px solid var(--au-bg-alt-shade);
    }
    .frame__foot-brand {
        font-weight: 700;
        color: var(--au-text);
    }
    .frame__hints {
        display: flex;
        align-items: center;
        gap: 24px;
        margin-left: auto;
    }
    .frame__hint {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        white-space: nowrap;
    }
</style>
