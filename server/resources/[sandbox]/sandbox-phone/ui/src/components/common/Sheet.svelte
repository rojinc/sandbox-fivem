<script>
    import { onDestroy } from 'svelte';
    import { uid } from '@sandbox/ui-kit';
    import { pushSheet, popSheet } from '../../state/sheet.svelte.js';

    /**
     * A dialog inside the phone screen: dims the screen, holds a title, the
     * body and a row of actions. Escape and a tap on the dimmed area close it.
     */
    let { open = false, title, onclose, actions, children } = $props();
    const id = uid('sheet');

    $effect(() => {
        if (open) pushSheet(id, () => onclose?.());
        else popSheet(id);
    });
    onDestroy(() => popSheet(id));
</script>

{#if open}
    <div
        class="sheet"
        role="presentation"
        onclick={(e) => {
            if (e.target === e.currentTarget) onclose?.();
        }}
    >
        <div class="sheet__panel" role="dialog" aria-modal="true" aria-labelledby="{id}-t">
            {#if title}<h2 class="sheet__title" id="{id}-t">{title}</h2>{/if}
            <div class="sheet__body">{@render children?.()}</div>
            {#if actions}<div class="sheet__actions">{@render actions()}</div>{/if}
        </div>
    </div>
{/if}

<style>
    .sheet {
        position: absolute;
        inset: 0;
        z-index: 40;
        display: flex;
        align-items: flex-end;
        background: rgba(8, 9, 10, 0.6);
    }
    .sheet__panel {
        width: 100%;
        max-height: 85%;
        display: flex;
        flex-direction: column;
        background: var(--au-bg);
        border-top: 4px solid var(--au-ink);
        color: var(--au-text);
    }
    .sheet__title {
        margin: 0;
        padding: var(--au-s4) var(--au-s4) var(--au-s2);
        font-size: var(--au-fs-sm);
    }
    .sheet__body {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding: var(--au-s2) var(--au-s4);
        font-size: var(--au-fs-xs);
    }
    .sheet__body :global(p:last-child) {
        margin-bottom: 0;
    }
    .sheet__actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--au-s3);
        padding: var(--au-s3) var(--au-s4) var(--au-s4);
    }
</style>
