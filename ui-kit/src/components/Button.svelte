<script>
    import Icon from './Icon.svelte';

    /**
     * variant: primary | secondary | tertiary | danger. size: sm | md | lg.
     * `icon` / `iconRight` take icon names. `href` renders a link.
     */
    let {
        variant = 'primary',
        size = 'md',
        block = false,
        disabled = false,
        loading = false,
        type = 'button',
        icon,
        iconRight,
        href,
        class: className = '',
        children,
        ...rest
    } = $props();
</script>

{#if href}
    <a {href} class="au-btn au-btn--{variant} au-btn--{size} {className}" class:au-btn--block={block} aria-disabled={disabled || undefined} {...rest}>
        {#if icon}<Icon {icon} />{/if}
        {#if children}<span class="au-btn__label">{@render children()}</span>{/if}
        {#if iconRight}<Icon icon={iconRight} />{/if}
    </a>
{:else}
    <button {type} class="au-btn au-btn--{variant} au-btn--{size} {className}" class:au-btn--block={block} class:is-loading={loading} disabled={disabled || loading} {...rest}>
        {#if loading}<Icon icon="loader-2" class="au-btn__spin" />{:else if icon}<Icon {icon} />{/if}
        {#if children}<span class="au-btn__label">{@render children()}</span>{/if}
        {#if iconRight}<Icon icon={iconRight} />{/if}
    </button>
{/if}

<style>
    .au-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--au-s2);
        height: 40px;
        padding: 0 var(--au-s4);
        border: 1px solid transparent;
        border-radius: var(--au-radius);
        background: var(--au-action);
        color: var(--au-action-contrast);
        font-size: var(--au-fs-xs);
        font-weight: 500;
        line-height: 1;
        text-decoration: none;
        white-space: nowrap;
        cursor: pointer;
        user-select: none;
        transition:
            background var(--au-fast) var(--au-ease),
            border-color var(--au-fast) var(--au-ease),
            color var(--au-fast) var(--au-ease);
    }
    .au-btn:hover {
        background: var(--au-action-hover);
        text-decoration: none;
    }
    .au-btn--secondary {
        background: transparent;
        border-color: var(--au-border-strong);
        color: var(--au-text);
    }
    .au-btn--secondary:hover {
        background: var(--au-bg-alt);
        border-color: var(--au-border-strong);
    }
    .au-btn--tertiary {
        background: transparent;
        color: var(--au-action);
        padding: 0 var(--au-s2);
    }
    .au-btn--tertiary:hover {
        background: var(--au-action-soft);
    }
    .au-btn--danger {
        background: var(--au-error-bg);
        color: #ffcfca;
    }
    .au-btn--danger:hover {
        background: #5a2525;
    }
    .au-btn--sm {
        height: 32px;
        padding: 0 var(--au-s3);
        font-size: 13px;
    }
    .au-btn--lg {
        height: 48px;
        padding: 0 var(--au-s6);
        font-size: var(--au-fs-sm);
    }
    .au-btn--block {
        display: flex;
        width: 100%;
    }
    .au-btn:disabled,
    .au-btn[aria-disabled='true'] {
        opacity: 0.45;
        cursor: not-allowed;
        pointer-events: none;
    }
    .au-btn__label {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .au-btn :global(.au-btn__spin) {
        animation: au-spin 0.8s linear infinite;
    }
</style>
