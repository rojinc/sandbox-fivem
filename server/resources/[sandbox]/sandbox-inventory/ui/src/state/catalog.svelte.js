/** Item definitions and crafting schematics sent by Lua. */
export const catalog = $state({
    /** name -> ItemDef. Always replaced with a new object, so readers update on SET_ITEMS and ADD_ITEM. */
    items: {},
    loaded: false,
    /** schematicId -> { result: { name, count }, items: [{ name, count }] } */
    schematics: {},
});

export function setItems(items) {
    catalog.items = items && typeof items === 'object' ? { ...items } : {};
}

export function addItem(id, item) {
    if (!id || !item) return;
    catalog.items = { ...catalog.items, [id]: item };
}

export function resetItems() {
    catalog.items = {};
    catalog.loaded = false;
}
