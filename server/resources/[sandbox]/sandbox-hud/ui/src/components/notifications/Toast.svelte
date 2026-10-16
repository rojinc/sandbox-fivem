<script>
    import { Icon, RichText } from '@sandbox/ui-kit';
    import { ui } from '../../state/ui.svelte.js';

    /** One GOLD page-alert style toast. Timed toasts remove themselves. */
    let { notification } = $props();

    const TYPE_ICON = { success: 'circle-check', warning: 'triangle-exclamation', error: 'circle-xmark', info: 'circle-info' };
    const TONE = { success: 'var(--au-success)', warning: 'var(--au-warning)', error: 'var(--au-error)', info: 'var(--au-info)' };
    const tone = $derived(TONE[notification.type] ?? 'var(--au-light-action)');
    const persistent = $derived(!(notification.duration > 0));

    function remove() {
        ui.notifications = ui.notifications.filter((n) => n._id !== notification._id);
    }

    $effect(() => {
        if (notification.hide) {
            remove();
            return undefined;
        }
        if (persistent) return undefined;
        const t = setTimeout(remove, notification.duration);
        return () => clearTimeout(t);
    });
</script>

<div class="toast" style="--tone:{tone};{notification.style?.alert ? '' : ''}" role={notification.type === 'error' ? 'alert' : 'status'}>
    <span class="toast__icon"><Icon icon={notification.icon || TYPE_ICON[notification.type] || 'bell'} /></span>
    <div class="toast__body"><RichText text={notification.message} tag="div" /></div>
    {#if persistent}<span class="toast__pin"><Icon icon="thumbtack" /></span>{/if}
    {#if !persistent}
        <span class="toast__timer" style="animation-duration:{notification.duration}ms"></span>
    {/if}
</div>

<style>
    .toast {
        position: relative;
        display: flex;
        align-items: flex-start;
        gap: 10px;
        width: 340px;
        padding: 10px 12px 12px;
        border-left: 6px solid var(--tone);
        border-radius: var(--au-radius);
        background: var(--au-light-bg);
        color: var(--au-light-text);
        box-shadow: var(--au-shadow-1);
        overflow: hidden;
    }
    .toast__icon {
        color: var(--tone);
        font-size: 18px;
        line-height: 1;
        padding-top: 2px;
    }
    .toast__body {
        flex: 1;
        min-width: 0;
        font-size: 14px;
        line-height: 1.4;
    }
    .toast__pin {
        color: var(--au-light-muted);
        font-size: 11px;
        padding-top: 4px;
    }
    .toast__timer {
        position: absolute;
        left: 0;
        bottom: 0;
        height: 3px;
        width: 100%;
        background: var(--tone);
        transform-origin: left;
        animation: toast-timer linear forwards;
    }
    @keyframes toast-timer {
        from {
            transform: scaleX(1);
        }
        to {
            transform: scaleX(0);
        }
    }
</style>
