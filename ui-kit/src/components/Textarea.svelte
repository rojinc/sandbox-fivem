<script>
    let {
        value = $bindable(''),
        id,
        placeholder,
        rows = 4,
        disabled = false,
        invalid = false,
        block = true,
        class: className = '',
        ...rest
    } = $props();
</script>

<textarea
    {id}
    {rows}
    {placeholder}
    {disabled}
    bind:value
    class="au-textarea {className}"
    class:au-textarea--invalid={invalid}
    class:au-textarea--block={block}
    aria-invalid={invalid || undefined}
    {...rest}
></textarea>

<style>
    .au-textarea {
        padding: var(--au-s2) var(--au-s3);
        border: 3px solid var(--au-input-border);
        border-radius: var(--au-radius);
        background: var(--au-input-bg);
        color: var(--au-input-text);
        font-size: var(--au-fs-sm);
        line-height: var(--au-lh);
        resize: vertical;
        min-height: 44px;
    }
    .au-textarea--block {
        display: block;
        width: 100%;
    }
    .au-textarea::placeholder {
        color: var(--au-input-placeholder);
    }
    .au-textarea--invalid {
        border-color: var(--au-error);
    }
    .au-textarea:disabled {
        background: var(--au-bg-shade);
        color: var(--au-muted);
        cursor: not-allowed;
    }
</style>
