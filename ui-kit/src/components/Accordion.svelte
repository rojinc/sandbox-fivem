<script>
    import Icon from './Icon.svelte';
    import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
    import { uid } from '../util.js';

    let { title, open = $bindable(false), class: className = '', children } = $props();
    const id = uid('acc');
</script>

<div class="au-accordion {className}" class:is-open={open}>
    <button type="button" class="au-accordion__title" aria-expanded={open} aria-controls={id} onclick={() => (open = !open)}>
        <span class="au-accordion__icon"><Icon icon={open ? faMinus : faPlus} /></span>
        <span>{title}</span>
    </button>
    {#if open}
        <div class="au-accordion__body" {id}>{@render children?.()}</div>
    {/if}
</div>

<style>
    .au-accordion {
        border-top: 1px solid var(--au-border);
    }
    .au-accordion:last-child {
        border-bottom: 1px solid var(--au-border);
    }
    .au-accordion__title {
        display: flex;
        align-items: center;
        gap: var(--au-s3);
        width: 100%;
        padding: var(--au-s3) var(--au-s2);
        border: 0;
        background: transparent;
        color: var(--au-action);
        font: inherit;
        font-weight: 700;
        text-align: left;
        cursor: pointer;
    }
    .au-accordion__title:hover {
        background: var(--au-bg-shade);
        color: var(--au-action-hover);
    }
    .au-accordion__icon {
        display: grid;
        place-items: center;
        width: 24px;
        height: 24px;
        border: 2px solid currentColor;
        border-radius: var(--au-radius);
        font-size: 12px;
        flex-shrink: 0;
    }
    .au-accordion__body {
        padding: var(--au-s2) var(--au-s2) var(--au-s4) 44px;
    }
</style>
