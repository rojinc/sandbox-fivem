/**
 * Session state: what Lua opened (SET_STATE + APP_SHOW), pricing, the tattoo
 * catalogue, whitelisted peds, and the editor's own state (section, camera,
 * undress preview, dialogs, saving).
 */
import { fetchNui } from '@sandbox/ui-kit/nui';
import { MODES, sectionDef } from '../data/sections.js';
import { pedState } from './ped.svelte.js';

export const DEFAULT_PRICING = { CREATOR: 0, BARBER: 100, SHOP: 100, TATTOO: 100, SURGERY: 2500 };

export const app = $state({
    visible: false,
    mode: '', // CREATOR | SHOP | BARBER | TATTOO | SURGERY
    pricing: { ...DEFAULT_PRICING },
    tattoos: [], // SET_TATTOOS_DATA catalogue
    whitelistedPeds: [], // SET_WL_PEDS
    section: null,
    camera: 0,
    naked: false, // the player's own undress choice
    busy: false, // a ped model is loading
    dialog: null, // 'save' | 'cancel' | null
    saving: false,
    error: null,
});

const asList = (v) => (Array.isArray(v) ? v : v && typeof v === 'object' ? Object.values(v) : []);

export function setMode(state) {
    const mode = String(state ?? '');
    app.mode = MODES[mode] ? mode : '';
    app.section = MODES[mode]?.sections[0] ?? null;
    app.camera = 0;
    app.naked = false;
    app.busy = false;
    app.dialog = null;
    app.saving = false;
    app.error = null;
    resetNakedSync();
}

export function setPricing(p) {
    if (p && typeof p === 'object') app.pricing = { ...DEFAULT_PRICING, ...p };
}

export function setTattoos(data) {
    app.tattoos = asList(data).filter((t) => t && typeof t === 'object' && t.Name);
}

export function setWhitelistedPeds(data) {
    app.whitelistedPeds = asList(data).filter((p) => p && typeof p.model === 'string' && p.model);
}

export function hide() {
    app.visible = false;
    app.dialog = null;
    app.saving = false;
    app.naked = false;
    resetNakedSync(); // Lua puts the clothes back itself on Save and Cancel
}

export function resetApp() {
    hide();
    app.mode = '';
    app.section = null;
    app.error = null;
    app.busy = false;
    app.camera = 0;
    app.pricing = { ...DEFAULT_PRICING };
    app.tattoos = [];
    app.whitelistedPeds = [];
}

export function selectSection(id) {
    if (!id || id === app.section) return;
    fetchNui('FrontEndSound', { sound: 'SELECT' });
    app.section = id;
}

export function setCamera(view) {
    fetchNui('FrontEndSound', { sound: 'SELECT' });
    app.camera = view;
    fetchNui('ChangeCamera', view);
}

/* ----------------------------------------------------- undress preview */

const FREEMODE = ['mp_m_freemode_01', 'mp_f_freemode_01'];

/** ToggleNekked only knows the multiplayer ped's clothing slots. */
export function isFreemode() {
    const m = pedState.ped.model;
    return !m || FREEMODE.includes(m);
}

/** Tattoo sections show bare skin, as the old UI did. */
export function forcedNaked() {
    return Boolean(sectionDef(app.section)?.naked) && isFreemode();
}

export function wantNaked() {
    return app.visible && (forcedNaked() || (app.naked && isFreemode()));
}

let sentNaked = false;
function resetNakedSync() {
    sentNaked = false;
}

/** Called from an effect: tells Lua when the wanted state differs from what it last heard. */
export function syncNaked(want) {
    if (want === sentNaked) return;
    sentNaked = want;
    fetchNui('ToggleNekked', want);
}

/* ------------------------------------------------------ save / cancel */

export function price() {
    const key = MODES[app.mode]?.priceKey;
    return Math.max(0, Number(app.pricing?.[key]) || 0);
}

export async function confirmSave() {
    if (app.saving) return;
    app.saving = true;
    app.error = null;
    let ok = false;
    try {
        ok = await fetchNui('Save');
    } catch {
        ok = false;
    }
    app.saving = false;
    app.dialog = null;
    if (ok === true || (ok && ok !== 'false')) {
        hide();
        return;
    }
    app.error = app.mode === 'CREATOR' ? 'save' : 'payment';
}

export function confirmCancel() {
    hide();
    fetchNui('Cancel');
}
