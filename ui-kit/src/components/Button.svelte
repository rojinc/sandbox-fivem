<script>
    import Icon from './Icon.svelte';

    /**
     * GOLD button. variant: primary | secondary | tertiary | danger.
     * size: sm | md | lg. Pass `href` to render a link that looks like a button.
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
    <a
        {href}
        class="au-btn au-btn--{variant} au-btn--{size} {className}"
        class:au-btn--block={block}
        aria-disabled={disabled || undefined}
        {...rest}
    >
        {#if icon}<Icon {icon} />{/if}
        {#if children}<span class="au-btn__label">{@render children()}</span>{/if}
        {#if iconRight}<Icon icon={iconRight} />{/if}
    </a>
{:else}
    <button
        {type}
        class="au-btn au-btn--{variant} au-btn--{size} {className}"
        class:au-btn--block={block}
        class:is-loading={loading}
        disabled={disabled || loading}
        {...rest}
    >
        {#if loading}
            <Icon icon="circle-notch" spin />
        {:else if icon}
            <Icon {icon} />
        {/if}
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
        min-height: 44px;
        padding: var(--au-s2) var(--au-s5);
        border: 3px solid var(--au-action);
        border-radius: var(--au-radius);
        background: var(--au-action);
        color: var(--au-action-contrast);
        font-weight: 700;
        font-size: var(--au-fs-sm);
        line-height: var(--au-lh);
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
        border-color: var(--au-action-hover);
        color: var(--au-action-contrast);
        text-decoration: none;
    }
    .au-btn:active {
        transform: translateY(1px);
    }
    .au-btn--secondary {
        background: transparent;
        color: var(--au-action);
    }
    .au-btn--secondary:hover {
        background: var(--au-action);
        border-color: var(--au-action);
        color: var(--au-action-contrast);
    }
    .au-btn--tertiary {
        background: transparent;
        border-color: transparent;
        color: var(--au-action);
        font-weight: 400;
        text-decoration: underline;
        text-underline-offset: 2px;
    }
    .au-btn--tertiary:hover {
        background: var(--au-bg-shade);
        border-color: transparent;
        color: var(--au-action-hover);
        text-decoration-thickness: 2px;
    }
    .au-btn--danger {
        background: var(--au-error);
        border-color: var(--au-error);
        color: #fff;
    }
    .au-btn--danger:hover {
        background: #a80000;
        border-color: #a80000;
        color: #fff;
    }
    .au-btn--sm {
        min-height: 34px;
        padding: var(--au-s1) var(--au-s3);
        font-size: var(--au-fs-xs);
        border-width: 2px;
    }
    .au-btn--lg {
        min-height: 52px;
        padding: var(--au-s3) var(--au-s8);
        font-size: var(--au-fs-md);
    }
    .au-btn--block {
        display: flex;
        width: 100%;
    }
    .au-btn:disabled,
    .au-btn[aria-disabled='true'] {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
        pointer-events: none;
    }
    .au-btn__label {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
    }
</style>
