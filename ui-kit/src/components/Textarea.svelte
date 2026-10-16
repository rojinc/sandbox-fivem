<script>
    let { value = $bindable(''), id, placeholder, rows = 4, disabled = false, invalid = false, block = true, class: className = '', ...rest } = $props();
</script>

<textarea {id} {rows} {placeholder} {disabled} bind:value class="au-textarea {className}" class:au-textarea--invalid={invalid} class:au-textarea--block={block} aria-invalid={invalid || undefined} {...rest}></textarea>

<style>
    .au-textarea {
        padding: var(--au-s2) var(--au-s3);
        border: 2px solid var(--au-input-border);
        border-radius: var(--au-radius);
        background: var(--au-input-bg);
        color: var(--au-input-text);
        font-size: var(--au-fs-xs);
        line-height: var(--au-lh);
        resize: vertical;
    }
    .au-textarea:focus {
        outline: 3px solid var(--au-focus);
        outline-offset: 0;
        box-shadow: inset 0 0 0 2px var(--au-ink);
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
        color: var(--au-hint);
        cursor: not-allowed;
    }
</style>
