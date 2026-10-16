<script>
    import Icon from './Icon.svelte';
    import { uid } from '../util.js';

    let { title, open = $bindable(false), class: className = '', children } = $props();
    const id = uid('acc');
</script>

<div class="au-accordion {className}" class:is-open={open}>
    <button type="button" class="au-accordion__title" aria-expanded={open} aria-controls={id} onclick={() => (open = !open)}>
        <span>{title}</span>
        <span class="au-accordion__chev"><Icon icon="chevron-down" /></span>
    </button>
    {#if open}<div class="au-accordion__body" {id}>{@render children?.()}</div>{/if}
</div>

<style>
    .au-accordion {
        border-bottom: 1px solid var(--au-border);
    }
    .au-accordion__title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--au-s3);
        width: 100%;
        padding: var(--au-s3) 0;
        border: 0;
        background: transparent;
        color: var(--au-text);
        font: inherit;
        font-size: var(--au-fs-xs);
        font-weight: 500;
        text-align: left;
        cursor: pointer;
    }
    .au-accordion__title:hover {
        color: var(--au-action);
    }
    .au-accordion__chev {
        display: flex;
        color: var(--au-muted);
        transition: transform var(--au-fast) var(--au-ease);
    }
    .is-open .au-accordion__chev {
        transform: rotate(180deg);
    }
    .au-accordion__body {
        padding: 0 0 var(--au-s4);
        color: var(--au-muted);
        font-size: var(--au-fs-xs);
    }
</style>
