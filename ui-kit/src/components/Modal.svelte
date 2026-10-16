<script>
    import Icon from './Icon.svelte';
    import { onEscape } from '../nui.js';
    import { uid } from '../util.js';

    /** Dialog on a dimmed backdrop. Escape and backdrop clicks call onclose. */
    let { open = true, title, eyebrow, onclose, width = '520px', backdrop = true, closeLabel = 'Close', class: className = '', children, actions } = $props();

    const titleId = uid('dlg');

    $effect(() => {
        if (!open || !onclose) return undefined;
        return onEscape(() => onclose());
    });
</script>

{#if open}
    <div
        class="au-modal"
        class:au-modal--backdrop={backdrop}
        role="presentation"
        onclick={(e) => {
            if (backdrop && e.target === e.currentTarget) onclose?.();
        }}
    >
        <div class="au-modal__panel {className}" role="dialog" aria-modal="true" aria-labelledby={title ? titleId : undefined} style="width:{width}">
            {#if title || onclose}
                <div class="au-modal__head">
                    <div class="au-modal__heading">
                        {#if eyebrow}<strong class="au-modal__eyebrow">{eyebrow}</strong>{/if}
                        {#if title}<h2 class="au-modal__title" id={titleId}>{title}</h2>{/if}
                    </div>
                    {#if onclose}
                        <button type="button" class="au-modal__close" aria-label={closeLabel} onclick={() => onclose()}><Icon icon="x" /></button>
                    {/if}
                </div>
            {/if}
            <div class="au-modal__body">{@render children?.()}</div>
            {#if actions}<div class="au-modal__actions">{@render actions()}</div>{/if}
        </div>
    </div>
{/if}

<style>
    .au-modal {
        position: fixed;
        inset: 0;
        display: grid;
        place-items: center;
        padding: var(--au-s6);
        z-index: 1000;
        animation: au-fade-in var(--au-normal) var(--au-ease);
    }
    .au-modal--backdrop {
        background: rgba(8, 9, 10, 0.6);
    }
    .au-modal__panel {
        max-width: 100%;
        max-height: 100%;
        display: flex;
        flex-direction: column;
        background: var(--au-bg);
        color: var(--au-text);
        border: 1px solid var(--au-border);
        border-radius: var(--au-radius-lg);
        box-shadow: var(--au-shadow-2);
        animation: au-rise-in var(--au-normal) var(--au-ease);
    }
    .au-modal__head {
        display: flex;
        align-items: flex-start;
        gap: var(--au-s3);
        padding: var(--au-s5) var(--au-s6) 0;
    }
    .au-modal__heading {
        flex: 1;
        min-width: 0;
    }
    .au-modal__eyebrow {
        display: block;
        color: var(--au-action);
        font-size: var(--au-fs-xxs);
        letter-spacing: 0.08em;
        text-transform: uppercase;
        margin-bottom: 2px;
    }
    .au-modal__title {
        margin: 0;
        font-size: var(--au-fs-md);
    }
    .au-modal__close {
        border: 0;
        background: transparent;
        color: var(--au-muted);
        font-size: 20px;
        padding: 4px;
        margin: -4px -8px 0 0;
        border-radius: var(--au-radius);
        cursor: pointer;
        display: flex;
    }
    .au-modal__close:hover {
        color: var(--au-text);
        background: var(--au-bg-alt);
    }
    .au-modal__body {
        flex: 1;
        min-height: 0;
        overflow: auto;
        padding: var(--au-s4) var(--au-s6);
        font-size: var(--au-fs-xs);
    }
    .au-modal__actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--au-s2);
        padding: 0 var(--au-s6) var(--au-s5);
    }
</style>
