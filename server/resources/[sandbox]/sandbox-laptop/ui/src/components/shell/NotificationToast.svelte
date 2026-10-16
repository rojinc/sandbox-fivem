<script>
    import { Toast } from '@sandbox/ui-kit';
    import { isPersistent } from '../../state/notify.svelte.js';

    /**
     * One laptop notification in the kit Toast look. The app's icon marks
     * where it came from. With `onopen` the whole toast is a button that
     * opens the app.
     */
    let { n, app, onopen = null } = $props();

    const title = $derived(n.title || app?.label || 'Notification');
    const message = $derived(n.description ?? '');
</script>

{#if onopen}
    <button type="button" class="toast-button" onclick={onopen} aria-label="{title}. Open {app?.label ?? 'app'}">
        <Toast type="neutral" icon={app?.icon} {title} {message} pinned={isPersistent(n)} />
    </button>
{:else}
    <Toast type="neutral" icon={app?.icon} {title} {message} pinned={isPersistent(n)} />
{/if}

<style>
    .toast-button {
        display: block;
        padding: 0;
        border: 0;
        background: transparent;
        color: inherit;
        text-align: left;
        cursor: pointer;
    }
    .toast-button:hover :global(.au-toast) {
        background: var(--au-bg-alt-shade);
    }
    .toast-button:focus-visible {
        outline: 3px solid var(--au-focus);
        outline-offset: 0;
    }
</style>
