<script>
    import { Modal, Button, fetchNui, onKey } from '@sandbox/ui-kit';
    import { ui } from '../../state/ui.svelte.js';

    /** Ingredient mixture picker for the meth table (client/hud.lua Meth, client/meth.lua). */
    const INGREDIENTS = ['Acetone', 'Battery acid', 'Iodine crystals', 'Sulfuric acid', 'Phosphorus', 'Gasoline', 'Lithium', 'Anhydrous ammonia'];
    const meth = $derived(ui.meth);
    const count = $derived(Math.max(0, Math.min(8, Number(meth.config.ingredients) || 0)));
    const maxCook = $derived(Number(meth.config.cookTimeMax ?? meth.config.maxCookTime) || 60);
    let amounts = $state(Array(8).fill(0));
    let cookTime = $state(1);

    $effect(() => {
        if (meth.showing) {
            amounts = Array(8).fill(0);
            cookTime = 1;
        }
    });

    const cancel = () => fetchNui('Meth:Cancel');
    const start = () => fetchNui('Meth:Start', { tableId: meth.config.tableId, ingredients: amounts.slice(0, count), cookTime });

    onKey('Escape', () => (meth.showing ? cancel() : false));
</script>

{#if meth.showing}
    <div class="hud-ui">
        <Modal title="Select ingredient mixture" onclose={cancel} width="460px">
            <div class="sliders">
                {#each Array.from({ length: count }, (_, i) => i) as i (i)}
                    <label class="slider">
                        <span class="slider__meta"><span>{INGREDIENTS[i] ?? `Ingredient ${i + 1}`}</span><span class="au-mono">{amounts[i]}%</span></span>
                        <input type="range" min="0" max="100" step="1" bind:value={amounts[i]} />
                    </label>
                {/each}
                <label class="slider">
                    <span class="slider__meta"><span>Cook time</span><span class="au-mono">{cookTime} min</span></span>
                    <input type="range" min="1" max={maxCook} step="1" bind:value={cookTime} />
                </label>
            </div>
            {#snippet actions()}
                <Button variant="secondary" onclick={cancel}>Cancel</Button>
                <Button icon="fire" onclick={start}>Start cooking</Button>
            {/snippet}
        </Modal>
    </div>
{/if}

<style>
    .sliders {
        display: flex;
        flex-direction: column;
        gap: 14px;
    }
    .slider {
        display: block;
    }
    .slider__meta {
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        font-weight: 700;
        margin-bottom: 4px;
    }
    input[type='range'] {
        width: 100%;
        height: 8px;
        appearance: none;
        -webkit-appearance: none;
        background: var(--au-bg-alt-shade);
        border-radius: 4px;
        outline: none;
        cursor: pointer;
    }
    input[type='range']::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: var(--au-action);
        border: 3px solid #fff;
        box-shadow: 0 0 0 1px var(--au-action);
    }
    input[type='range']:focus-visible {
        outline: 3px solid var(--au-focus);
        outline-offset: 2px;
    }
</style>
