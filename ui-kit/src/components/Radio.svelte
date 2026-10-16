<script>
    import { uid } from '../util.js';

    /** <Radio bind:group={choice} value="a" label="A" /> */
    let { group = $bindable(), value, label, name, id = uid('rd'), disabled = false, class: className = '', children, ...rest } = $props();
</script>

<label class="au-radio {className}" class:au-radio--disabled={disabled}>
    <input type="radio" {id} {name} {value} bind:group {disabled} class="au-radio__input" {...rest} />
    <span class="au-radio__dot" aria-hidden="true"></span>
    <span class="au-radio__label">{label}{@render children?.()}</span>
</label>

<style>
    .au-radio {
        display: inline-flex;
        align-items: center;
        gap: var(--au-s3);
        min-height: 28px;
        cursor: pointer;
        font-size: var(--au-fs-xs);
    }
    .au-radio--disabled {
        opacity: 0.45;
        cursor: not-allowed;
    }
    .au-radio__input {
        position: absolute;
        opacity: 0;
        width: 1px;
        height: 1px;
    }
    .au-radio__dot {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        border: 1px solid var(--au-border-strong);
        border-radius: 50%;
        background: var(--au-input-bg);
        position: relative;
    }
    .au-radio__dot::after {
        content: '';
        position: absolute;
        inset: 4px;
        border-radius: 50%;
        background: var(--au-action);
        transform: scale(0);
        transition: transform var(--au-fast) var(--au-ease);
    }
    .au-radio__input:checked + .au-radio__dot {
        border-color: var(--au-action);
    }
    .au-radio__input:checked + .au-radio__dot::after {
        transform: scale(1);
    }
    .au-radio__input:focus-visible + .au-radio__dot {
        outline: 2px solid var(--au-focus);
        outline-offset: 2px;
    }
</style>
