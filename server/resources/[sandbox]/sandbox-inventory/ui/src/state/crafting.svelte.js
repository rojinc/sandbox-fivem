/** The open crafting bench (SET_BENCH) and the state of each recipe row. */
export const crafting = $state({
    bench: null,
    recipes: [], // { id, result: { name, count }, items: [{ name, count }], cooldown? }
    cooldowns: {}, // recipeId -> expiry in ms
    search: '',
    qty: {}, // recipeId -> string typed in the amount field
    busy: null, // recipeId being crafted
    result: null, // { tone: 'success' | 'error', text }
});

export function resetCrafting() {
    crafting.bench = null;
    crafting.recipes = [];
    crafting.cooldowns = {};
    crafting.search = '';
    crafting.qty = {};
    crafting.busy = null;
    crafting.result = null;
}
