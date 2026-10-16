<script>
    /** Small status label. tone: default | action | success | warning | error | info. `solid` fills it. */
    let { tone = 'default', solid = false, class: className = '', children } = $props();
</script>

<span class="au-tag au-tag--{tone} {className}" class:au-tag--solid={solid}>{@render children?.()}</span>

<style>
    .au-tag {
        --fg: var(--au-muted);
        --bg: var(--au-bg-alt);
        display: inline-flex;
        align-items: center;
        gap: 4px;
        height: 22px;
        padding: 0 8px;
        border-radius: var(--au-radius);
        font-size: var(--au-fs-xxs);
        font-weight: 500;
        white-space: nowrap;
        color: var(--fg);
        background: var(--bg);
    }
    .au-tag--action,
    .au-tag--info {
        --fg: var(--au-info);
        --bg: var(--au-info-bg);
    }
    .au-tag--success {
        --fg: var(--au-success);
        --bg: var(--au-success-bg);
    }
    .au-tag--warning {
        --fg: var(--au-warning);
        --bg: var(--au-warning-bg);
    }
    .au-tag--error {
        --fg: var(--au-error);
        --bg: var(--au-error-bg);
    }
    .au-tag--solid {
        color: var(--au-action-contrast);
        background: var(--fg);
    }
    .au-tag--default.au-tag--solid {
        color: var(--au-text);
        background: var(--au-bg-alt-shade);
    }
</style>
