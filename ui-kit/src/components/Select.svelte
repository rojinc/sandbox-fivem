<script>
    /**
     * Native select styled like the text input.
     * options: [{ value, label, disabled? }] or option children.
     */
    let {
        value = $bindable(''),
        id,
        options = [],
        placeholder,
        disabled = false,
        invalid = false,
        block = true,
        size = 'md',
        class: className = '',
        children,
        ...rest
    } = $props();
</script>

<span class="au-select-wrap" class:au-select-wrap--block={block}>
    <select
        {id}
        {disabled}
        bind:value
        class="au-select {className}"
        class:au-select--invalid={invalid}
        class:au-select--sm={size === 'sm'}
        aria-invalid={invalid || undefined}
        {...rest}
    >
        {#if placeholder}<option value="" disabled>{placeholder}</option>{/if}
        {#each options as opt (opt.value)}
            <option value={opt.value} disabled={opt.disabled}>{opt.label ?? opt.value}</option>
        {/each}
        {@render children?.()}
    </select>
    <svg class="au-select__chevron" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
</span>

<style>
    .au-select-wrap {
        position: relative;
        display: inline-block;
    }
    .au-select-wrap--block {
        display: block;
        width: 100%;
    }
    .au-select {
        width: 100%;
        min-height: 44px;
        padding: var(--au-s2) var(--au-s10) var(--au-s2) var(--au-s3);
        border: 3px solid var(--au-input-border);
        border-radius: var(--au-radius);
        background: var(--au-input-bg);
        color: var(--au-input-text);
        font-size: var(--au-fs-sm);
        line-height: var(--au-lh);
        appearance: none;
        -webkit-appearance: none;
        cursor: pointer;
    }
    .au-select--sm {
        min-height: 36px;
        padding: var(--au-s1) var(--au-s8) var(--au-s1) var(--au-s2);
        font-size: var(--au-fs-xs);
        border-width: 2px;
    }
    .au-select--invalid {
        border-color: var(--au-error);
    }
    .au-select:disabled {
        background: var(--au-bg-shade);
        color: var(--au-muted);
        cursor: not-allowed;
    }
    .au-select__chevron {
        position: absolute;
        right: var(--au-s3);
        top: 50%;
        width: 18px;
        height: 18px;
        margin-top: -9px;
        color: var(--au-input-text);
        pointer-events: none;
    }
</style>
