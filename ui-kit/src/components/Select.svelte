<script>
    import Icon from './Icon.svelte';

    /** Native select. options: [{ value, label, disabled? }] or option children. */
    let { value = $bindable(''), id, options = [], placeholder, disabled = false, invalid = false, block = true, size = 'md', class: className = '', children, ...rest } = $props();
</script>

<span class="au-select-wrap" class:au-select-wrap--block={block}>
    <select {id} {disabled} bind:value class="au-select {className}" class:au-select--invalid={invalid} class:au-select--sm={size === 'sm'} aria-invalid={invalid || undefined} {...rest}>
        {#if placeholder}<option value="" disabled>{placeholder}</option>{/if}
        {#each options as opt (opt.value)}
            <option value={opt.value} disabled={opt.disabled}>{opt.label ?? opt.value}</option>
        {/each}
        {@render children?.()}
    </select>
    <span class="au-select__chevron"><Icon icon="chevron-down" /></span>
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
        height: 40px;
        padding: 0 var(--au-s10) 0 var(--au-s3);
        border: 1px solid var(--au-input-border);
        border-radius: var(--au-radius);
        background: var(--au-input-bg);
        color: var(--au-input-text);
        font-size: var(--au-fs-xs);
        appearance: none;
        -webkit-appearance: none;
        cursor: pointer;
    }
    .au-select:focus {
        border-color: var(--au-action);
    }
    .au-select option {
        background: var(--au-bg-shade);
        color: var(--au-text);
    }
    .au-select--sm {
        height: 32px;
        padding: 0 var(--au-s8) 0 var(--au-s2);
        font-size: 13px;
    }
    .au-select--invalid {
        border-color: var(--au-error);
    }
    .au-select:disabled {
        color: var(--au-hint);
        cursor: not-allowed;
    }
    .au-select__chevron {
        position: absolute;
        right: var(--au-s3);
        top: 50%;
        transform: translateY(-50%);
        color: var(--au-muted);
        pointer-events: none;
        display: flex;
    }
</style>
