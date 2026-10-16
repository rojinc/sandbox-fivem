/**
 * Lua -> UI message routing. Every SendNUIMessage({ type, data }) listed in
 * CONTRACT.md lands here and mutates the rune state modules directly.
 */
import { onNui } from '@sandbox/ui-kit/nui';
import { asList } from './lib/item.js';
import { catalog, setItems, addItem, resetItems } from './state/catalog.svelte.js';
import { app, pushAlert } from './state/app.svelte.js';
import { crafting, resetCrafting } from './state/crafting.svelte.js';
import { inv, setPlayer, setSecondary, mergeSecondary, resetInventories, lockSlot, unlockSlot } from './state/inventory.svelte.js';
import { clearInteraction } from './state/ui.svelte.js';

const HOTBAR_MS = 5000;
let hotbarTimer = null;

export function installBridge() {
    /* --------------------------------------------------------- items */
    onNui('ITEMS_UNLOADED', () => (catalog.loaded = false));
    onNui('RESET_ITEMS', () => resetItems());
    onNui('SET_ITEMS', (d = {}) => setItems(d.items));
    onNui('ADD_ITEM', (d = {}) => addItem(d.id, d.item));
    onNui('ITEMS_LOADED', () => (catalog.loaded = true));
    onNui('SET_SCHEMS', (d) => (catalog.schematics = d && typeof d === 'object' ? d : {}));

    /* ------------------------------------------------------ settings */
    onNui('UPDATE_SETTINGS', (d = {}) => {
        const s = d.settings ?? {};
        app.settings = {
            muted: typeof s.muted === 'boolean' ? s.muted : app.settings.muted,
            useBank: typeof s.useBank === 'boolean' ? s.useBank : app.settings.useBank,
        };
    });

    /* ------------------------------------------------------- screens */
    onNui('SET_MODE', (d = {}) => (app.mode = d.mode === 'crafting' ? 'crafting' : 'inventory'));
    onNui('SET_BENCH', (d = {}) => {
        resetCrafting();
        crafting.bench = d.bench ?? null;
        crafting.recipes = asList(d.recipes);
        crafting.cooldowns = d.cooldowns && typeof d.cooldowns === 'object' ? { ...d.cooldowns } : {};
    });
    onNui('APP_SHOW', () => {
        app.visible = true;
        app.crashed = false;
    });
    onNui('APP_HIDE', () => {
        app.visible = false;
        clearInteraction();
        resetInventories();
        resetCrafting();
        // Lua sends SET_MODE before every crafting open, but not before every plain open.
        app.mode = 'inventory';
    });
    onNui('RESET_INVENTORY', () => resetInventories());

    /* --------------------------------------------------- inventories */
    onNui('SET_PLAYER_INVENTORY', (d = {}) => setPlayer(d));
    onNui('SET_SECONDARY_INVENTORY', (d = {}) => setSecondary(d));
    onNui('SHOW_SECONDARY_INVENTORY', () => (inv.showSecondary = true));
    onNui('SET_INVENTORIES', (d = {}) => {
        if (d.player) setPlayer({ inventory: d.player.inventory ?? inv.player.inventory });
        if (d.secondary) mergeSecondary({ inventory: d.secondary.inventory ?? inv.secondary.inventory });
    });
    onNui('SET_PLAYER_SLOT', (d = {}) => unlockSlot('player', d.slot));
    onNui('SET_SECONDARY_SLOT', (d = {}) => unlockSlot('secondary', d.slot));
    onNui('USE_ITEM_PLAYER', (d = {}) => lockSlot('player', d.originSlot));
    onNui('SLOT_NOT_USED', (d = {}) => unlockSlot('player', d.originSlot));
    onNui('USE_IN_PROGRESS', (d = {}) => (inv.inUse = Boolean(d.state)));

    /* --------------------------------------------- hotbar and weapon */
    onNui('SET_EQUIPPED', (d = {}) => (app.equipped = d.item || null));
    onNui('HOTBAR_SHOW', (d = {}) => {
        app.hotbar = { showing: true, items: asList(d.items), shownAt: Date.now() };
        if (d.equipped !== undefined) app.equipped = d.equipped || null;
        clearTimeout(hotbarTimer);
        hotbarTimer = setTimeout(() => (app.hotbar.showing = false), HOTBAR_MS);
    });
    onNui('HOTBAR_HIDE', () => {
        clearTimeout(hotbarTimer);
        app.hotbar.showing = false;
    });

    /* ------------------------------------------------- notices, tips */
    onNui('ADD_ALERT', (d = {}) => pushAlert(d.alert));
    onNui('OPEN_STATIC_TOOLTIP', (d = {}) => (app.staticTooltip = d.item || null));
    onNui('CLOSE_STATIC_TOOLTIP', () => (app.staticTooltip = null));
}

