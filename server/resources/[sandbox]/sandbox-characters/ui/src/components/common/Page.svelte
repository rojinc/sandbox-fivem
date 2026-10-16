<script>
    import logo from '../../assets/logo.webp';

    /**
     * The full-screen page every state sits on: identity block top-left
     * (wordmark, eyebrow, title, muted subline), then a main column and an
     * optional right column (`side` snippet) of plain text sections.
     */
    let { title, subline, side, children } = $props();
</script>

<div class="page">
    <header class="page__head">
        <img class="page__logo" src={logo} alt="" draggable="false" />
        <div class="page__identity">
            <strong class="page__eyebrow">Sandbox RP</strong>
            <h1 class="page__title">{title}</h1>
            {#if subline}<div class="page__subline">{subline}</div>{/if}
        </div>
    </header>

    <div class="page__body" class:page__body--single={!side}>
        <main class="page__main">{@render children?.()}</main>
        {#if side}
            <aside class="page__side">{@render side()}</aside>
        {/if}
    </div>
</div>

<style>
    .page {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 1760px;
        margin: 0 auto;
        padding: 56px 80px 48px;
        animation: au-fade-in var(--au-normal) var(--au-ease);
    }
    .page__head {
        display: flex;
        align-items: center;
        gap: 24px;
        padding-bottom: 28px;
        border-bottom: 1px solid var(--au-border);
    }
    .page__logo {
        height: 52px;
        width: auto;
        flex-shrink: 0;
    }
    .page__identity {
        min-width: 0;
    }
    .page__eyebrow {
        display: block;
        color: var(--au-action);
        font-size: var(--au-fs-xxs);
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }
    .page__title {
        margin: 4px 0 0;
        font-size: var(--au-fs-xl);
        font-weight: 700;
    }
    .page__subline {
        margin-top: 4px;
        color: var(--au-muted);
        font-size: var(--au-fs-xs);
    }
    .page__body {
        flex: 1;
        min-height: 0;
        display: grid;
        grid-template-columns: minmax(0, 1fr) 400px;
        gap: 80px;
        padding-top: 32px;
    }
    .page__body--single {
        grid-template-columns: minmax(0, 1fr);
    }
    .page__main,
    .page__side {
        min-width: 0;
        min-height: 0;
        overflow: auto;
    }
    .page__main {
        display: flex;
        flex-direction: column;
    }
    .page__side {
        padding-top: 8px;
    }
</style>
