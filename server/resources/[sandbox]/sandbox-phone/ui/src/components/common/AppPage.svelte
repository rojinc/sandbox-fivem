<script>
    import { Icon } from '@sandbox/ui-kit';
    import { back } from '../../state/router.svelte.js';

    /**
     * One app screen: a compact header (back control, bold title, actions on
     * the right) over a scrolling body, with an optional bar pinned below.
     */
    let { title, onback, backable = true, actions, footer, flush = false, bodyEl = $bindable(), class: className = '', children } = $props();
</script>

<section class="page {className}">
    <header class="page__head">
        {#if backable}
            <button type="button" class="page__back" aria-label="Back" onclick={() => (onback ? onback() : back())}>
                <Icon icon="chevron-left" stroke={2} />
            </button>
        {:else}
            <span class="page__gap"></span>
        {/if}
        <h1 class="page__title">{title}</h1>
        {#if actions}<div class="page__actions">{@render actions()}</div>{/if}
    </header>
    <div class="page__body" class:page__body--flush={flush} bind:this={bodyEl}>
        {@render children?.()}
    </div>
    {#if footer}<div class="page__foot">{@render footer()}</div>{/if}
</section>

<style>
    .page {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--au-bg);
        color: var(--au-text);
    }
    .page__head {
        display: flex;
        align-items: center;
        gap: var(--au-s1);
        min-height: 52px;
        padding: 0 var(--au-s2) 0 var(--au-s1);
        border-bottom: 4px solid var(--au-ink);
        flex-shrink: 0;
    }
    .page__back {
        display: grid;
        place-items: center;
        width: 44px;
        height: 44px;
        border: 0;
        background: transparent;
        color: var(--au-text);
        font-size: 22px;
        cursor: pointer;
        flex-shrink: 0;
    }
    .page__gap {
        width: var(--au-s3);
    }
    .page__back:hover {
        background: var(--au-bg-alt);
    }
    .page__title {
        flex: 1;
        min-width: 0;
        margin: 0;
        font-size: var(--au-fs-sm);
        line-height: 1.25;
        font-weight: 700;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .page__actions {
        display: flex;
        align-items: center;
        gap: var(--au-s1);
        flex-shrink: 0;
    }
    .page__body {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        overflow-x: hidden;
    }
    .page__foot {
        flex-shrink: 0;
        border-top: 1px solid var(--au-border);
        background: var(--au-bg-shade);
    }
    /* Header actions are short text buttons; keep them compact inside the 52px bar. */
    .page__actions :global(.au-btn) {
        margin-bottom: 3px;
    }
</style>
