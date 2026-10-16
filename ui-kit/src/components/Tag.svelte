<script>
    /** Rectangular GOLD tag. `tone`: default | action | success | warning | error | info. */
    let { tone = 'default', solid = false, class: className = '', children } = $props();
</script>

<span class="au-tag au-tag--{tone} {className}" class:au-tag--solid={solid}>{@render children?.()}</span>

<style>
    .au-tag {
        --tag-color: var(--au-border);
        display: inline-block;
        padding: 1px var(--au-s2);
        border: 1px solid var(--tag-color);
        border-radius: var(--au-radius);
        font-size: var(--au-fs-xs);
        line-height: 1.5;
        white-space: nowrap;
        color: var(--au-text);
        background: transparent;
    }
    .au-tag--action {
        --tag-color: var(--au-action);
    }
    .au-tag--success {
        --tag-color: var(--au-success);
    }
    .au-tag--warning {
        --tag-color: var(--au-warning);
    }
    .au-tag--error {
        --tag-color: var(--au-error);
    }
    .au-tag--info {
        --tag-color: var(--au-info);
    }
    .au-tag--solid {
        background: var(--tag-color);
        border-color: var(--tag-color);
        color: #fff;
        font-weight: 700;
    }
    .au-tag--default.au-tag--solid {
        background: var(--au-bg-alt-shade);
        color: var(--au-text);
    }
    .au-tag--warning.au-tag--solid {
        color: #313131;
    }
</style>
