<script>
    import { uid } from '../util.js';

    let { checked = $bindable(false), label, id = uid('cb'), disabled = false, class: className = '', children, ...rest } = $props();
</script>

<label class="au-check {className}" class:au-check--disabled={disabled}>
    <input type="checkbox" {id} bind:checked {disabled} class="au-check__input" {...rest} />
    <span class="au-check__box" aria-hidden="true">
        <svg viewBox="0 0 24 24" class="au-check__tick"><path d="M5 12l5 5l10 -10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" /></svg>
    </span>
    <span class="au-check__label">{label}{@render children?.()}</span>
</label>

<style>
    .au-check {
        display: inline-flex;
        align-items: center;
        gap: var(--au-s3);
        min-height: 28px;
        cursor: pointer;
        font-size: var(--au-fs-xs);
    }
    .au-check--disabled {
        opacity: 0.45;
        cursor: not-allowed;
    }
    .au-check__input {
        position: absolute;
        opacity: 0;
        width: 1px;
        height: 1px;
    }
    .au-check__box {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        border: 1px solid var(--au-border-strong);
        border-radius: var(--au-radius);
        background: var(--au-input-bg);
        color: var(--au-action-contrast);
        display: grid;
        place-items: center;
        transition:
            background var(--au-fast) var(--au-ease),
            border-color var(--au-fast) var(--au-ease);
    }
    .au-check__tick {
        width: 14px;
        height: 14px;
        opacity: 0;
        transition: opacity var(--au-fast) var(--au-ease);
    }
    .au-check__input:checked + .au-check__box {
        background: var(--au-action);
        border-color: var(--au-action);
    }
    .au-check__input:checked + .au-check__box .au-check__tick {
        opacity: 1;
    }
    .au-check__input:focus-visible + .au-check__box {
        outline: 2px solid var(--au-focus);
        outline-offset: 2px;
    }
</style>
