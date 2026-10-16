import { createReducer } from '@reduxjs/toolkit';

/**
 * Ranges the game reports back on request:
 *  - drawables[type][componentId] = list of drawable ids allowed in this store (SET_MAX_DRAWABLE)
 *  - textures[type][componentId]  = number of textures of the current drawable (SET_MAX_TEXTURE)
 *  - hairColors / hairOverlays     = SET_HAIR_COLORS_MAX
 *  - palette[colorId] = "rgb(r, g, b)" collected through GetPedHairRgbColor with name "palette"
 */
export const initialState = {
    drawables: { components: {}, props: {} },
    textures: { components: {}, props: {} },
    hairColors: 0,
    hairOverlays: 0,
    palette: {},
};

export const invalidateCatalog = () => ({ type: 'catalog/invalidate' });

const kindOf = (bucket, type) => (bucket[type] ? type : 'components');

export default createReducer(initialState, (b) => {
    b.addCase('SET_MAX_DRAWABLE', (s, a) => {
        const { id, type, max } = a.payload ?? {};
        if (id === undefined) return;
        s.drawables[kindOf(s.drawables, type)][id] = Array.isArray(max) ? max.map(Number) : [];
    });
    b.addCase('SET_MAX_TEXTURE', (s, a) => {
        const { id, type, max } = a.payload ?? {};
        if (id === undefined) return;
        s.textures[kindOf(s.textures, type)][id] = Number(max) || 0;
    });
    b.addCase('SET_HAIR_COLORS_MAX', (s, a) => {
        s.hairColors = Number(a.payload?.max) || 0;
        s.hairOverlays = Number(a.payload?.maxOverlays) || 0;
    });
    b.addCase('SET_HAIR_COLOR_RGB', (s, a) => {
        const { name, type, rgb } = a.payload ?? {};
        if (name === 'palette' && rgb) s.palette[Number(type)] = rgb;
    });
    b.addCase('UI_RESET', () => initialState);
    b.addCase('catalog/invalidate', (s) => {
        s.drawables = { components: {}, props: {} };
        s.textures = { components: {}, props: {} };
    });
});
