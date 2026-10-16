<script>
    import Icon from './Icon.svelte';
    import { faXmark } from '@fortawesome/free-solid-svg-icons';
    import { onEscape } from '../nui.js';
    import { uid } from '../util.js';

    /**
     * Dialog on a dimmed backdrop. Escape and backdrop clicks call onclose.
     * Render it conditionally ({#if open}) or pass `open`.
     */
    let {
        open = true,
        title,
        onclose,
        width = '560px',
        dark = false,
        backdrop = true,
        closeLabel = 'Close',
        class: className = '',
        children,
        actions,
    } = $props();

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
        <div
            class="au-modal__panel {className}"
            class:au-dark={dark}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            style="width:{width}"
        >
            {#if title || onclose}
                <div class="au-modal__head">
                    {#if title}<h2 class="au-modal__title" id={titleId}>{title}</h2>{/if}
                    {#if onclose}
                        <button type="button" class="au-modal__close" aria-label={closeLabel} onclick={() => onclose()}>
                            <Icon icon={faXmark} />
                        </button>
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
        background: rgba(10, 20, 24, 0.55);
    }
    .au-modal__panel {
        max-width: 100%;
        max-height: 100%;
        display: flex;
        flex-direction: column;
        background: var(--au-bg);
        color: var(--au-text);
        border-radius: var(--au-radius);
        box-shadow: var(--au-shadow-2);
        animation: au-rise-in var(--au-normal) var(--au-ease);
    }
    .au-modal__head {
        display: flex;
        align-items: flex-start;
        gap: var(--au-s3);
        padding: var(--au-s5) var(--au-s6) 0;
    }
    .au-modal__title {
        flex: 1;
        margin: 0;
        font-size: var(--au-fs-lg);
    }
    .au-modal__close {
        border: 0;
        background: transparent;
        color: var(--au-muted);
        font-size: 22px;
        line-height: 1;
        padding: 2px 6px;
        margin: -4px -8px 0 0;
        border-radius: var(--au-radius);
        cursor: pointer;
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
    }
    .au-modal__actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--au-s2);
        padding: 0 var(--au-s6) var(--au-s6);
    }
</style>
