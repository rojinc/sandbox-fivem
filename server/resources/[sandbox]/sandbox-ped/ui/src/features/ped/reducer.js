import { createReducer } from '@reduxjs/toolkit';
import { TEMPLATE_PED } from './template.js';

/**
 * The ped being edited. Lua owns the truth (SET_PED_DATA); every control also
 * applies its change here optimistically so the panel reflects it instantly.
 * The `ped/*` actions mirror the NUI callbacks one to one (see usePedActions).
 */
export const initialState = { gender: 0, ped: TEMPLATE_PED };

export default createReducer(initialState, (b) => {
    b.addCase('SET_PED_DATA', (s, a) => {
        if (a.payload?.ped && typeof a.payload.ped === 'object') s.ped = a.payload.ped;
        if (a.payload?.gender !== undefined) s.gender = Number(a.payload.gender) || 0;
    });
    b.addCase('SET_HAIR_COLOR_RGB', (s, a) => {
        const { name, type, rgb } = a.payload ?? {};
        const slot = s.ped.customization?.colors?.[name]?.[type];
        if (slot && typeof slot === 'object' && rgb) slot.rgb = rgb;
    });
    b.addCase('UI_RESET', () => initialState);

    b.addCase('ped/headBlend', (s, a) => {
        const { face, type, value } = a.payload;
        const f = s.ped.customization.face;
        if (!f[face]) f[face] = { index: 0, texture: 0, mix: 0 };
        f[face][type] = value;
    });
    b.addCase('ped/faceFeature', (s, a) => {
        const { index, value } = a.payload;
        const f = s.ped.customization.face;
        if (!f.features || typeof f.features !== 'object') f.features = {};
        f.features[index] = value;
    });
    b.addCase('ped/overlay', (s, a) => {
        const { type, extraType, value } = a.payload;
        const o = s.ped.customization.overlay?.[type];
        if (o) o[extraType] = value;
    });
    b.addCase('ped/component', (s, a) => {
        const { name, type, value } = a.payload;
        const c = s.ped.customization.components?.[name];
        if (c) c[type] = value;
    });
    b.addCase('ped/prop', (s, a) => {
        const { name, type, value } = a.payload;
        const p = s.ped.customization.props?.[name];
        if (p) p[type] = value;
    });
    b.addCase('ped/hairColor', (s, a) => {
        const { name, type, value } = a.payload;
        const c = s.ped.customization.colors?.[name]?.[type];
        if (c) c.index = value;
    });
    b.addCase('ped/hairOverlay', (s, a) => {
        s.ped.customization.hairOverlay = a.payload.value;
    });
    b.addCase('ped/eyeColor', (s, a) => {
        s.ped.customization.eyeColor = a.payload.value;
    });
    b.addCase('ped/model', (s, a) => {
        s.ped.model = a.payload.value;
    });
    b.addCase('ped/tattooAdd', (s, a) => {
        if (!Array.isArray(s.ped.customization.tattoos)) s.ped.customization.tattoos = [];
        s.ped.customization.tattoos.push({ Name: '', Collection: '', Hash: '', Zone: a.payload.type });
    });
    b.addCase('ped/tattooRemove', (s, a) => {
        if (Array.isArray(s.ped.customization.tattoos)) s.ped.customization.tattoos.splice(a.payload.index, 1);
    });
    b.addCase('ped/tattooSet', (s, a) => {
        if (Array.isArray(s.ped.customization.tattoos)) s.ped.customization.tattoos[a.payload.index] = a.payload.data;
    });
});
