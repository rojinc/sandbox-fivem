<script>
    import { sound } from '../../state/ped.svelte.js';

    /**
     * Flat grid of 24px colour squares from the palette the game reports
     * (colour id -> "rgb(r, g, b)"). Only colours whose RGB has arrived are drawn.
     */
    let { palette = {}, count = 0, value = 0, onchange, label } = $props();

    const ids = $derived(Array.from({ length: count }, (_, i) => i).filter((i) => palette[i]));
</script>

{#if ids.length}
    <div class="ped-swatches" role="radiogroup" aria-label={label}>
        {#each ids as i (i)}
            <button
                type="button"
                class="ped-swatch"
                class:is-selected={i === value}
                role="radio"
                aria-checked={i === value}
                aria-label="Colour {i + 1}"
                title="Colour {i + 1}"
                style:background={palette[i]}
                onclick={() => {
                    if (i === value) return;
                    sound('SELECT');
                    onchange?.(i);
                }}
            ></button>
        {/each}
    </div>
{/if}

<style>
    .ped-swatches {
        display: grid;
        grid-template-columns: repeat(auto-fill, 24px);
        gap: 4px;
        padding: 4px 0 var(--au-s2) 4px;
    }
    .ped-swatch {
        width: 24px;
        height: 24px;
        padding: 0;
        border: 0;
        border-radius: 0;
        cursor: pointer;
    }
    .ped-swatch.is-selected {
        outline: 2px solid var(--au-ink);
        outline-offset: 2px;
    }
    .ped-swatch:focus-visible {
        outline: 3px solid var(--au-focus);
        outline-offset: 1px;
    }
</style>
