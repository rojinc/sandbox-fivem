<script>
    import { Icon } from '@sandbox/ui-kit';
    import { optionLabel } from '../lib/items.js';

    /**
     * Every option of a SELECT row, opened with Enter or a click on its value.
     * `active` is the keyboard highlight, `current` the saved value (ticked).
     */
    let { options = [], active = 0, current = -1, label, onhover, onpick } = $props();

    let el = $state();

    $effect(() => {
        const i = active;
        el?.querySelector(`[data-option="${i}"]`)?.scrollIntoView({ block: 'nearest' });
    });
</script>

<div class="options" role="listbox" aria-label={label} bind:this={el}>
    {#each options as opt, i (i)}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div
            class="option"
            class:is-active={i === active}
            role="option"
            tabindex="-1"
            aria-selected={i === current}
            data-option={i}
            onpointermove={() => onhover?.(i)}
            onclick={(e) => {
                e.stopPropagation();
                onpick?.(i);
            }}
        >
            <span class="option__label">{optionLabel(opt)}</span>
            {#if i === current}<span class="option__tick"><Icon icon="check" stroke={2.5} /></span>{/if}
        </div>
    {/each}
</div>

<style>
    .options {
        max-height: 272px;
        overflow-y: auto;
        border: 2px solid var(--au-ink);
        background: var(--au-input-bg);
    }
    .option {
        display: flex;
        align-items: center;
        gap: var(--au-s3);
        min-height: 40px;
        padding: 6px var(--au-s3);
        font-size: var(--au-fs-xs);
        cursor: pointer;
    }
    .option.is-active {
        background: var(--au-bg-alt-shade);
        font-weight: 700;
    }
    .option__label {
        flex: 1;
        min-width: 0;
    }
    .option__tick {
        display: flex;
        font-size: 18px;
    }
</style>
