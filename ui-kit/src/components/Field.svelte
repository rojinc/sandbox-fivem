<script>
    /** Label + hint + error wrapper for one form control. Pass the same `id` to the control. */
    let { label, hint, error, id, required = false, class: className = '', children } = $props();
</script>

<div class="au-field {className}" class:au-field--error={Boolean(error)}>
    {#if label}
        <label class="au-field__label" for={id}>
            {label}{#if required}<span class="au-field__required" aria-hidden="true"> *</span>{/if}
        </label>
    {/if}
    {#if hint}<div class="au-field__hint" id={id ? `${id}-hint` : undefined}>{hint}</div>{/if}
    {#if error}
        <div class="au-field__error" id={id ? `${id}-error` : undefined} role="alert">
            <strong>Error:</strong> {error}
        </div>
    {/if}
    <div class="au-field__control">{@render children?.()}</div>
</div>

<style>
    .au-field {
        display: block;
        margin: 0 0 var(--au-s4);
    }
    .au-field--error {
        border-left: 4px solid var(--au-error);
        padding-left: var(--au-s3);
    }
    .au-field__label {
        display: block;
        font-weight: 700;
        margin-bottom: var(--au-s1);
    }
    .au-field__required {
        color: var(--au-error);
    }
    .au-field__hint {
        color: var(--au-hint);
        font-size: var(--au-fs-xs);
        margin-bottom: var(--au-s1);
    }
    .au-field__error {
        color: var(--au-error);
        font-size: var(--au-fs-xs);
        margin-bottom: var(--au-s1);
    }
    .au-field__control {
        margin-top: var(--au-s1);
    }
</style>
