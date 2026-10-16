<script>
    import Icon from './Icon.svelte';
    import { faCircleInfo, faCircleCheck, faTriangleExclamation, faCircleExclamation, faXmark } from '@fortawesome/free-solid-svg-icons';

    /** GOLD page alert. type: info | success | warning | error. */
    let { type = 'info', title, icon, compact = false, onclose, class: className = '', children } = $props();

    const ICONS = { info: faCircleInfo, success: faCircleCheck, warning: faTriangleExclamation, error: faCircleExclamation };
    const kind = $derived(ICONS[type] ? type : 'info');
</script>

<div class="au-alert au-alert--{kind} {className}" class:au-alert--compact={compact} role={kind === 'error' ? 'alert' : 'status'}>
    <span class="au-alert__icon"><Icon icon={icon ?? ICONS[kind]} /></span>
    <div class="au-alert__content">
        {#if title}<div class="au-alert__title">{title}</div>{/if}
        {#if children}<div class="au-alert__body">{@render children()}</div>{/if}
    </div>
    {#if onclose}
        <button type="button" class="au-alert__close" aria-label="Dismiss" onclick={onclose}><Icon icon={faXmark} /></button>
    {/if}
</div>

<style>
    .au-alert {
        --alert-color: var(--au-info);
        display: flex;
        align-items: flex-start;
        gap: var(--au-s3);
        padding: var(--au-s4) var(--au-s5);
        border-left: 8px solid var(--alert-color);
        background: var(--au-bg-shade);
        color: var(--au-text);
        margin: 0 0 var(--au-s4);
    }
    .au-alert--compact {
        padding: var(--au-s2) var(--au-s3);
        border-left-width: 6px;
        gap: var(--au-s2);
    }
    .au-alert--success {
        --alert-color: var(--au-success);
    }
    .au-alert--warning {
        --alert-color: var(--au-warning);
    }
    .au-alert--error {
        --alert-color: var(--au-error);
    }
    .au-alert__icon {
        color: var(--alert-color);
        font-size: 22px;
        line-height: 1;
        padding-top: 2px;
    }
    .au-alert--compact .au-alert__icon {
        font-size: 18px;
    }
    .au-alert__content {
        flex: 1;
        min-width: 0;
    }
    .au-alert__title {
        font-weight: 700;
        margin-bottom: 2px;
    }
    .au-alert__body :global(p:last-child) {
        margin-bottom: 0;
    }
    .au-alert__close {
        border: 0;
        background: transparent;
        color: var(--au-muted);
        cursor: pointer;
        padding: 2px 4px;
        border-radius: var(--au-radius);
        font-size: 18px;
        line-height: 1;
    }
    .au-alert__close:hover {
        color: var(--au-text);
        background: var(--au-bg-alt);
    }
</style>
