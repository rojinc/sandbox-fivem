<script>
    /** GOLD text input. bind:value; `invalid` paints the error border. */
    let {
        value = $bindable(''),
        type = 'text',
        id,
        placeholder,
        disabled = false,
        invalid = false,
        block = true,
        mono = false,
        size = 'md',
        width,
        class: className = '',
        ...rest
    } = $props();
</script>

<input
    {id}
    {type}
    {placeholder}
    {disabled}
    bind:value
    class="au-input {className}"
    class:au-input--invalid={invalid}
    class:au-input--block={block}
    class:au-input--sm={size === 'sm'}
    class:au-mono={mono}
    style={width ? `width:${width}` : undefined}
    aria-invalid={invalid || undefined}
    {...rest}
/>

<style>
    .au-input {
        min-height: 44px;
        padding: var(--au-s2) var(--au-s3);
        border: 3px solid var(--au-input-border);
        border-radius: var(--au-radius);
        background: var(--au-input-bg);
        color: var(--au-input-text);
        font-size: var(--au-fs-sm);
        line-height: var(--au-lh);
        transition: border-color var(--au-fast) var(--au-ease);
    }
    .au-input--block {
        display: block;
        width: 100%;
    }
    .au-input--sm {
        min-height: 36px;
        padding: var(--au-s1) var(--au-s2);
        font-size: var(--au-fs-xs);
        border-width: 2px;
    }
    .au-input::placeholder {
        color: var(--au-input-placeholder);
    }
    .au-input--invalid {
        border-color: var(--au-error);
    }
    .au-input:disabled {
        background: var(--au-bg-shade);
        color: var(--au-muted);
        cursor: not-allowed;
    }
    .au-input[type='number']::-webkit-inner-spin-button,
    .au-input[type='number']::-webkit-outer-spin-button {
        -webkit-appearance: none;
    }
</style>
