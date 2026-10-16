import { createReducer } from '@reduxjs/toolkit';

/**
 * Session state: what Lua opened (SET_STATE / APP_SHOW), pricing, the tattoo
 * catalogue and the whitelisted ped list, plus UI-only bits (camera, naked
 * preview, navigation). Message types and payload fields are the Lua contract
 * (see ui/CONTRACT.md); `ui/*` actions are local.
 */
export const DEFAULT_PRICING = { CREATOR: 0, BARBER: 100, SHOP: 100, TATTOO: 100, SURGERY: 2500 };

export const initialState = {
    visible: false,
    state: '',
    pricing: DEFAULT_PRICING,
    tattoos: [],
    whitelistedPeds: [],
    camera: 0,
    naked: false,
    forcedNaked: false,
    busy: false,
    nav: { category: null, section: 0 },
};

export const hide = () => ({ type: 'ui/hide' });
export const setCamera = (cam) => ({ type: 'ui/setCamera', payload: { cam } });
export const setNaked = (naked) => ({ type: 'ui/setNaked', payload: { naked } });
export const forceNaked = (forced) => ({ type: 'ui/forceNaked', payload: { forced } });
export const setBusy = (busy) => ({ type: 'ui/setBusy', payload: { busy } });
export const navigate = (category, section = 0) => ({ type: 'ui/navigate', payload: { category, section } });

const list = (v) => (Array.isArray(v) ? v : []);

export default createReducer(initialState, (b) => {
    b.addCase('APP_SHOW', (s) => {
        s.visible = true;
    });
    b.addCase('SET_STATE', (s, a) => {
        s.state = String(a.payload?.state ?? '');
        s.nav = { category: null, section: 0 };
        s.naked = false;
        s.forcedNaked = false;
        s.busy = false;
    });
    b.addCase('SET_PRICING', (s, a) => {
        if (a.payload?.pricing && typeof a.payload.pricing === 'object') {
            s.pricing = { ...DEFAULT_PRICING, ...a.payload.pricing };
        }
    });
    b.addCase('SET_TATTOOS_DATA', (s, a) => {
        s.tattoos = list(a.payload?.data);
    });
    b.addCase('SET_WL_PEDS', (s, a) => {
        s.whitelistedPeds = list(a.payload?.data).filter((p) => p && p.model);
    });
    b.addCase('UI_RESET', () => initialState);

    b.addCase('ui/hide', (s) => {
        s.visible = false;
        s.naked = false;
        s.forcedNaked = false;
        s.busy = false;
    });
    b.addCase('ui/setCamera', (s, a) => {
        s.camera = a.payload.cam;
    });
    b.addCase('ui/setNaked', (s, a) => {
        s.naked = Boolean(a.payload.naked);
    });
    b.addCase('ui/forceNaked', (s, a) => {
        s.forcedNaked = Boolean(a.payload.forced);
    });
    b.addCase('ui/setBusy', (s, a) => {
        s.busy = Boolean(a.payload.busy);
    });
    b.addCase('ui/navigate', (s, a) => {
        s.nav = { category: a.payload.category ?? null, section: Number(a.payload.section) || 0 };
    });
});
