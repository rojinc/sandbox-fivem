<script>
    /** A record, item or person shown as one unit. */
    let { title, subtitle, clickable = false, selected = false, padded = true, onclick, class: className = '', header, footer, children, ...rest } = $props();
</script>

<svelte:element
    this={clickable ? 'button' : 'div'}
    type={clickable ? 'button' : undefined}
    class="au-card {className}"
    class:au-card--clickable={clickable}
    class:au-card--selected={selected}
    class:au-card--padded={padded}
    {onclick}
    {...rest}
>
    {#if header}
        <div class="au-card__header">{@render header()}</div>
    {:else if title}
        <div class="au-card__header">
            <div class="au-card__title">{title}</div>
            {#if subtitle}<div class="au-card__subtitle">{subtitle}</div>{/if}
        </div>
    {/if}
    <div class="au-card__body">{@render children?.()}</div>
    {#if footer}<div class="au-card__footer">{@render footer()}</div>{/if}
</svelte:element>

<style>
    .au-card {
        display: flex;
        flex-direction: column;
        width: 100%;
        text-align: left;
        border: 1px solid var(--au-border);
        border-radius: var(--au-radius-lg);
        background: var(--au-bg-shade);
        color: var(--au-text);
        font: inherit;
        padding: 0;
        margin: 0;
    }
    .au-card--clickable {
        cursor: pointer;
        transition:
            border-color var(--au-fast) var(--au-ease),
            background var(--au-fast) var(--au-ease);
    }
    .au-card--clickable:hover {
        background: var(--au-bg-alt);
    }
    .au-card--selected {
        border-color: var(--au-action);
    }
    .au-card__header {
        padding: var(--au-s3) var(--au-s4) 0;
    }
    .au-card__title {
        font-weight: 500;
    }
    .au-card__subtitle {
        color: var(--au-muted);
        font-size: 13px;
    }
    .au-card--padded .au-card__body {
        padding: var(--au-s3) var(--au-s4) var(--au-s4);
    }
    .au-card__body {
        flex: 1;
    }
    .au-card__footer {
        padding: var(--au-s3) var(--au-s4);
        border-top: 1px solid var(--au-border);
    }
</style>
