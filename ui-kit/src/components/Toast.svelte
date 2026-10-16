<script>
    import Icon from './Icon.svelte';
    import RichText from './RichText.svelte';

    /**
     * Notification card: the whole background carries the type colour.
     * type: info | success | warning | error | neutral. `message` may hold
     * the framework's light markup (sanitised).
     */
    let { type = 'neutral', message, icon, title, pinned = false, class: className = '' } = $props();

    const ICONS = { info: 'info-circle', success: 'circle-check', warning: 'alert-triangle', error: 'alert-circle', neutral: 'bell' };
    const kind = $derived(ICONS[type] ? type : 'neutral');
</script>

<div class="au-toast au-toast--{kind} {className}" role={kind === 'error' ? 'alert' : 'status'}>
    <span class="au-toast__icon"><Icon icon={icon || ICONS[kind]} stroke={2} /></span>
    <div class="au-toast__body">
        {#if title}<div class="au-toast__title">{title}</div>{/if}
        <RichText text={message} tag="div" />
    </div>
    {#if pinned}<span class="au-toast__pin" aria-label="Pinned"><Icon icon="pin" /></span>{/if}
</div>

<style>
    .au-toast {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        width: 340px;
        padding: 10px 14px;
        background: #2a2e33;
        color: #f1f3f5;
        font-size: var(--au-fs-xs);
        line-height: 1.4;
    }
    .au-toast--info {
        background: #1d3f5e;
    }
    .au-toast--success {
        background: #1a4a33;
    }
    .au-toast--warning {
        background: #4d3b10;
    }
    .au-toast--error {
        background: #5a2020;
    }
    .au-toast__icon {
        font-size: 18px;
        display: flex;
        opacity: 0.95;
    }
    .au-toast--info .au-toast__icon {
        color: #9fd0ff;
    }
    .au-toast--success .au-toast__icon {
        color: #8ee6b8;
    }
    .au-toast--warning .au-toast__icon {
        color: #ffd479;
    }
    .au-toast--error .au-toast__icon {
        color: #ffa8a0;
    }
    .au-toast__body {
        flex: 1;
        min-width: 0;
        padding-top: 1px;
    }
    .au-toast__title {
        font-weight: 700;
    }
    .au-toast__pin {
        font-size: 14px;
        opacity: 0.6;
        display: flex;
        padding-top: 2px;
    }
</style>
