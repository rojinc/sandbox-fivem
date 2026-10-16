/**
 * Lua -> UI message routing. Every SendNUIMessage({ type, data }) listed in
 * CONTRACT.md lands here and updates the rune state modules.
 */
import { onNui } from '@sandbox/ui-kit/nui';
import { app, setMode, setPricing, setTattoos, setWhitelistedPeds, resetApp } from './state/app.svelte.js';
import { setPedData, resetPed } from './state/ped.svelte.js';
import { setMaxDrawable, setMaxTexture, setHairColoursMax, setHairColourRgb, loadHairPalette, resetCatalog } from './state/catalog.svelte.js';
import { MODES } from './data/sections.js';

export function installBridge() {
    onNui('SET_STATE', (d = {}) => setMode(d?.state));
    onNui('APP_SHOW', () => {
        if (!app.mode) return;
        app.visible = true;
        loadHairPalette();
    });
    onNui('SET_PED_DATA', (d = {}) => setPedData(d ?? {}));
    onNui('SET_PRICING', (d = {}) => setPricing(d?.pricing));
    onNui('SET_TATTOOS_DATA', (d = {}) => setTattoos(d?.data));
    onNui('SET_WL_PEDS', (d = {}) => setWhitelistedPeds(d?.data));
    onNui('SET_HAIR_COLORS_MAX', (d = {}) => setHairColoursMax(d ?? {}));
    onNui('SET_HAIR_COLOR_RGB', (d = {}) => setHairColourRgb(d ?? {}));
    onNui('SET_MAX_DRAWABLE', (d = {}) => setMaxDrawable(d ?? {}));
    onNui('SET_MAX_TEXTURE', (d = {}) => setMaxTexture(d ?? {}));
    onNui('UI_RESET', () => {
        resetApp();
        resetPed();
        resetCatalog();
    });
    // CLOSE_LIST_MENU (client/wardrobe.lua) is meant for sandbox-base's list menu: nothing to do here.

    // Preview harness only (scripts/preview.mjs posts { raw: { previewSection, previewDialog, previewError } }).
    // These objects have no `type`, so onNui never sees them and Lua never sends them.
    window.addEventListener('message', (e) => {
        const d = e.data;
        if (!d || typeof d !== 'object' || d.type !== undefined) return;
        if (typeof d.previewSection === 'string' && MODES[app.mode]?.sections.includes(d.previewSection)) app.section = d.previewSection;
        if (d.previewDialog === 'save' || d.previewDialog === 'cancel') app.dialog = d.previewDialog;
        if (d.previewError === 'payment' || d.previewError === 'save') app.error = d.previewError;
        if (typeof d.previewNaked === 'boolean') app.naked = d.previewNaked;
    });
}
