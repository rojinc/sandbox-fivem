<script>
    import Icon from './Icon.svelte';

    /** Label + hint + error for one control. Pass the same `id` to the control. */
    let { label, hint, error, id, required = false, class: className = '', children } = $props();
</script>

<div class="au-field {className}">
    {#if label}
        <label class="au-field__label" for={id}>{label}{#if required}<span class="au-field__required" aria-hidden="true">*</span>{/if}</label>
    {/if}
    {#if hint}<div class="au-field__hint" id={id ? `${id}-hint` : undefined}>{hint}</div>{/if}
    <div class="au-field__control" class:is-invalid={Boolean(error)}>{@render children?.()}</div>
    {#if error}
        <div class="au-field__error" id={id ? `${id}-error` : undefined} role="alert"><Icon icon="alert-circle" />{error}</div>
    {/if}
</div>

<style>
    .au-field {
        display: block;
        margin: 0 0 var(--au-s4);
    }
    .au-field__label {
        display: block;
        font-size: var(--au-fs-xs);
        font-weight: 500;
        margin-bottom: var(--au-s1);
    }
    .au-field__required {
        color: var(--au-error);
        margin-left: 2px;
    }
    .au-field__hint {
        color: var(--au-hint);
        font-size: 13px;
        margin-bottom: var(--au-s2);
    }
    .au-field__control.is-invalid :global(input),
    .au-field__control.is-invalid :global(select),
    .au-field__control.is-invalid :global(textarea) {
        border-color: var(--au-error);
    }
    .au-field__error {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--au-error);
        font-size: 13px;
        margin-top: var(--au-s1);
    }
</style>
