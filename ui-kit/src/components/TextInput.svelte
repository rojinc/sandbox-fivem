<script>
    /** Text input. bind:value; `invalid` paints the error border. */
    let { value = $bindable(''), type = 'text', id, placeholder, disabled = false, invalid = false, block = true, mono = false, size = 'md', width, class: className = '', ...rest } = $props();
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
        height: 40px;
        padding: 0 var(--au-s3);
        border: 1px solid var(--au-input-border);
        border-radius: var(--au-radius);
        background: var(--au-input-bg);
        color: var(--au-input-text);
        font-size: var(--au-fs-xs);
        transition: border-color var(--au-fast) var(--au-ease);
    }
    .au-input:hover {
        border-color: #5a6068;
    }
    .au-input:focus {
        border-color: var(--au-action);
    }
    .au-input--block {
        display: block;
        width: 100%;
    }
    .au-input--sm {
        height: 32px;
        padding: 0 var(--au-s2);
        font-size: 13px;
    }
    .au-input::placeholder {
        color: var(--au-input-placeholder);
    }
    .au-input--invalid {
        border-color: var(--au-error);
    }
    .au-input:disabled {
        color: var(--au-hint);
        border-color: var(--au-border);
        cursor: not-allowed;
    }
    .au-input[type='number']::-webkit-inner-spin-button,
    .au-input[type='number']::-webkit-outer-spin-button {
        -webkit-appearance: none;
    }
</style>
