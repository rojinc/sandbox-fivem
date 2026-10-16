<script>
    import Icon from './Icon.svelte';

    /** Message on a tinted background. type: info | success | warning | error | neutral. */
    let { type = 'info', title, icon, compact = false, onclose, class: className = '', children } = $props();

    const ICONS = { info: 'info-circle', success: 'circle-check', warning: 'alert-triangle', error: 'alert-circle', neutral: 'bell' };
    const kind = $derived(ICONS[type] ? type : 'info');
</script>

<div class="au-alert au-alert--{kind} {className}" class:au-alert--compact={compact} role={kind === 'error' ? 'alert' : 'status'}>
    <span class="au-alert__icon"><Icon icon={icon ?? ICONS[kind]} /></span>
    <div class="au-alert__content">
        {#if title}<div class="au-alert__title">{title}</div>{/if}
        {#if children}<div class="au-alert__body">{@render children()}</div>{/if}
    </div>
    {#if onclose}
        <button type="button" class="au-alert__close" aria-label="Dismiss" onclick={onclose}><Icon icon="x" /></button>
    {/if}
</div>

<style>
    .au-alert {
        --tone: var(--au-info);
        --tone-bg: var(--au-info-bg);
        display: flex;
        align-items: flex-start;
        gap: var(--au-s3);
        padding: var(--au-s3) var(--au-s4);
        border-radius: var(--au-radius-lg);
        background: var(--tone-bg);
        color: var(--au-text);
        margin: 0 0 var(--au-s4);
        font-size: var(--au-fs-xs);
    }
    .au-alert--compact {
        padding: var(--au-s2) var(--au-s3);
        gap: var(--au-s2);
    }
    .au-alert--success {
        --tone: var(--au-success);
        --tone-bg: var(--au-success-bg);
    }
    .au-alert--warning {
        --tone: var(--au-warning);
        --tone-bg: var(--au-warning-bg);
    }
    .au-alert--error {
        --tone: var(--au-error);
        --tone-bg: var(--au-error-bg);
    }
    .au-alert--neutral {
        --tone: var(--au-muted);
        --tone-bg: var(--au-bg-alt);
    }
    .au-alert__icon {
        color: var(--tone);
        font-size: 18px;
        line-height: 1;
        display: flex;
        padding-top: 1px;
    }
    .au-alert__content {
        flex: 1;
        min-width: 0;
    }
    .au-alert__title {
        font-weight: 500;
    }
    .au-alert__body {
        color: rgba(233, 235, 238, 0.85);
    }
    .au-alert__body :global(p:last-child) {
        margin-bottom: 0;
    }
    .au-alert__close {
        border: 0;
        background: transparent;
        color: var(--au-muted);
        cursor: pointer;
        padding: 2px;
        border-radius: var(--au-radius);
        font-size: 16px;
        display: flex;
    }
    .au-alert__close:hover {
        color: var(--au-text);
    }
</style>
