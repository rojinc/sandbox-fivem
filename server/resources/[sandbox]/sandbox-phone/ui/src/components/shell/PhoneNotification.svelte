<script>
    import { Icon, Button, timeAgo } from '@sandbox/ui-kit';
    import { fetchNui } from '@sandbox/ui-kit/nui';
    import { appIcon } from '../../lib/apps.js';
    import { plain, toMs } from '../../lib/format.js';
    import { hideNotification, collapse, isPersistent } from '../../state/notify.svelte.js';
    import { openApp } from '../../state/router.svelte.js';
    import { share } from '../../state/misc.svelte.js';
    import { clock } from '../../state/clock.svelte.js';

    /**
     * One phone notification in the kit Toast look: app and time, title,
     * text, and its actions (open, accept, decline) when the phone is open.
     */
    let { n, app, interactive = false } = $props();

    const persistent = $derived(isPersistent(n));
    const isCall = $derived(app?.name === 'phone');
    const acceptLabel = $derived(isCall ? 'Answer' : 'Accept');
    const cancelLabel = $derived(isCall ? (n.action?.accept ? 'Decline' : 'Hang up') : 'Decline');
    const when = $derived(timeAgo(toMs(n.time) || n.received, clock.now));
    const text = $derived(plain(n.description));

    function view() {
        if (!persistent) hideNotification(n.id);
        if (n.action?.view === 'USE_SHARE') {
            share.open = true;
            return;
        }
        if (app?.name) openApp(app.name, n.action?.view ?? '');
    }
    function accept() {
        hideNotification(n.id);
        fetchNui('AcceptPopup', { event: n.action?.accept, data: n.data });
    }
    function cancel() {
        hideNotification(n.id);
        fetchNui('CancelPopup', { event: n.action?.cancel, data: n.data });
    }
    function tap() {
        if (!interactive) return;
        if (persistent) collapse(n.id);
        else hideNotification(n.id);
    }
</script>

<div class="note" role={isCall ? 'alert' : 'status'}>
    <span class="note__icon"><Icon icon={appIcon(app)} stroke={2} /></span>
    <div class="note__body">
        <button type="button" class="note__tap" onclick={tap} disabled={!interactive} aria-label={persistent ? 'Make smaller' : 'Dismiss'}>
            <span class="note__meta"><span class="note__app">{app?.label ?? 'Phone'}</span><span class="note__time">{when}</span></span>
            <span class="note__title">{plain(n.title)}</span>
            {#if text && !(n.collapsed && interactive)}<span class="note__text">{text}</span>{/if}
        </button>
        {#if interactive && (n.action?.view || n.action?.accept || n.action?.cancel)}
            <div class="note__actions">
                {#if n.action?.accept}<Button size="sm" onclick={accept}>{acceptLabel}</Button>{/if}
                {#if n.action?.cancel}<Button size="sm" variant="secondary" onclick={cancel}>{cancelLabel}</Button>{/if}
                {#if n.action?.view !== undefined && n.action?.view !== null && n.action?.view !== false}
                    <Button size="sm" variant="tertiary" onclick={view}>Open {app?.label ?? 'app'}</Button>
                {/if}
            </div>
        {/if}
    </div>
</div>

<style>
    .note {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 10px 12px;
        background: var(--au-bg-alt-shade);
        color: var(--au-text);
        font-size: var(--au-fs-xs);
        line-height: 1.4;
    }
    .note__icon {
        display: flex;
        padding-top: 2px;
        font-size: 18px;
    }
    .note__body {
        flex: 1;
        min-width: 0;
    }
    .note__tap {
        display: block;
        width: 100%;
        padding: 0;
        border: 0;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
    }
    .note__tap:disabled {
        cursor: default;
    }
    .note__tap:focus-visible {
        outline: 3px solid var(--au-focus);
        outline-offset: 2px;
    }
    .note__meta {
        display: flex;
        justify-content: space-between;
        gap: var(--au-s2);
        color: var(--au-muted);
    }
    .note__app {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .note__time {
        flex-shrink: 0;
    }
    .note__title {
        display: block;
        font-weight: 700;
        overflow-wrap: anywhere;
    }
    .note__text {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        overflow-wrap: anywhere;
    }
    .note__actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--au-s2);
        margin-top: var(--au-s2);
    }
</style>
