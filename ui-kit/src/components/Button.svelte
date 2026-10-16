<script>
    import Icon from './Icon.svelte';

    /**
     * variant: primary (ink) | secondary | tertiary (link-like) | danger. size: sm | md | lg.
     * Datum buttons: square, a 3px base bar, gold on focus. One primary per screen.
     */
    let { variant = 'primary', size = 'md', block = false, disabled = false, loading = false, type = 'button', icon, iconRight, href, class: className = '', children, ...rest } = $props();
</script>

{#if href}
    <a {href} class="au-btn au-btn--{variant} au-btn--{size} {className}" class:au-btn--block={block} aria-disabled={disabled || undefined} {...rest}>
        {#if icon}<Icon {icon} stroke={2} />{/if}
        {#if children}<span class="au-btn__label">{@render children()}</span>{/if}
        {#if iconRight}<Icon icon={iconRight} stroke={2} />{/if}
    </a>
{:else}
    <button {type} class="au-btn au-btn--{variant} au-btn--{size} {className}" class:au-btn--block={block} class:is-loading={loading} disabled={disabled || loading} {...rest}>
        {#if loading}<Icon icon="loader-2" class="au-btn__spin" stroke={2} />{:else if icon}<Icon {icon} stroke={2} />{/if}
        {#if children}<span class="au-btn__label">{@render children()}</span>{/if}
        {#if iconRight}<Icon icon={iconRight} stroke={2} />{/if}
    </button>
{/if}

<style>
    .au-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--au-s2);
        min-height: 44px;
        padding: 8px 16px 7px;
        border: 2px solid transparent;
        border-radius: 0;
        background: var(--au-ink);
        color: var(--au-on-ink);
        box-shadow: 0 3px 0 var(--au-bar);
        margin-bottom: 3px;
        font: 700 var(--au-fs-xs) / 1.2 var(--au-font);
        text-decoration: none;
        white-space: nowrap;
        cursor: pointer;
        user-select: none;
        transition: background-color var(--au-fast) var(--au-ease);
    }
    .au-btn:hover {
        background: var(--au-muted);
        color: var(--au-on-ink);
        text-decoration: none;
    }
    .au-btn:active {
        transform: translateY(3px);
        box-shadow: none;
    }
    .au-btn:focus-visible {
        outline: 3px solid transparent;
        background: var(--au-focus);
        color: var(--au-on-focus);
        border-color: var(--au-focus);
        box-shadow: 0 3px 0 var(--au-on-focus);
    }
    .au-btn--secondary {
        background: var(--au-bg-alt);
        color: var(--au-text);
        box-shadow: 0 3px 0 var(--au-border);
    }
    .au-btn--secondary:hover {
        background: var(--au-bg-alt-shade);
        color: var(--au-text);
    }
    .au-btn--tertiary {
        background: transparent;
        color: var(--au-action);
        box-shadow: none;
        margin-bottom: 0;
        padding-inline: 4px;
        font-weight: 400;
        text-decoration: underline;
        text-decoration-thickness: 1px;
        text-underline-offset: 0.18em;
    }
    .au-btn--tertiary:hover {
        background: transparent;
        color: var(--au-action-hover);
        text-decoration: underline;
        text-decoration-thickness: 3px;
    }
    .au-btn--tertiary:active {
        transform: none;
    }
    .au-btn--danger {
        background: var(--au-error);
        color: #1a0907;
        box-shadow: 0 3px 0 #7a2a24;
    }
    .au-btn--danger:hover {
        background: #ffb3ab;
        color: #1a0907;
    }
    .au-btn--sm {
        min-height: 36px;
        padding: 5px 12px 4px;
    }
    .au-btn--lg {
        min-height: 52px;
        padding: 12px 20px 11px;
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
