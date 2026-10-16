/**
 * Ranges the game reports on request:
 *  - drawables[kind][componentId]: drawable ids this store sells (SET_MAX_DRAWABLE)
 *  - textures[kind][componentId]: texture count of the drawable last asked about (SET_MAX_TEXTURE)
 *  - hairColours / hairOverlays: SET_HAIR_COLORS_MAX
 *  - palette[colourId] = "rgb(r, g, b)", collected through GetPedHairRgbColor with name "palette"
 * kind is "components" or "props".
 */
import { fetchNui } from '@sandbox/ui-kit/nui';

const empty = () => ({ components: {}, props: {} });

export const catalog = $state({
    drawables: empty(),
    textures: empty(),
    hairColours: 0,
    hairOverlays: 0,
    palette: {},
    generation: 0, // bumped when the ped model changes and every range must be asked for again
});

const CALLBACKS = {
    components: { drawables: 'GetNumberOfPedDrawableVariations', textures: 'GetNumberOfPedTextureVariations' },
    props: { drawables: 'GetNumberOfPedPropDrawableVariations', textures: 'GetNumberOfPedPropTextureVariations' },
};
const kindOf = (type) => (type === 'props' ? 'props' : 'components');

const asked = new Set();
let paletteFor = 0;

/** Ask once per model for the drawables a slot offers. */
export function ensureDrawables(kind, componentId) {
    const key = `${catalog.generation}:${kind}:${componentId}`;
    if (asked.has(key) || catalog.drawables[kind][componentId] !== undefined) return;
    asked.add(key);
    fetchNui(CALLBACKS[kind].drawables, { componentId });
}

/** Texture count of the worn drawable; asked again whenever the drawable changes. */
export function requestTextures(kind, componentId, drawableId) {
    fetchNui(CALLBACKS[kind].textures, { componentId, drawableId });
}

export function setMaxDrawable(d = {}) {
    if (d.id === undefined || d.id === null) return;
    const max = Array.isArray(d.max) ? d.max : d.max && typeof d.max === 'object' ? Object.values(d.max) : [];
    catalog.drawables[kindOf(d.type)][d.id] = max.map(Number).filter(Number.isFinite);
}

export function setMaxTexture(d = {}) {
    if (d.id === undefined || d.id === null) return;
    catalog.textures[kindOf(d.type)][d.id] = Math.max(0, Number(d.max) || 0);
}

/** Hair palette: how many colours, then the RGB of each one. */
export function loadHairPalette() {
    if (!catalog.hairColours) fetchNui('GetNumHairColors');
}

export function setHairColoursMax(d = {}) {
    catalog.hairColours = Math.max(0, Number(d.max) || 0);
    catalog.hairOverlays = Math.max(0, Number(d.maxOverlays) || 0);
    if (catalog.hairColours && paletteFor !== catalog.hairColours) {
        paletteFor = catalog.hairColours;
        for (let i = 0; i < catalog.hairColours; i += 1) fetchNui('GetPedHairRgbColor', { colorId: i, type: i, name: 'palette' });
    }
}

export function setHairColourRgb(d = {}) {
    if (d.name === 'palette' && typeof d.rgb === 'string') catalog.palette[Number(d.type)] = d.rgb;
}

/** The ped model changed: every drawable and texture range is different. */
export function invalidateRanges() {
    catalog.drawables = empty();
    catalog.textures = empty();
    catalog.generation += 1;
}

export function resetCatalog() {
    invalidateRanges();
    catalog.hairColours = 0;
    catalog.hairOverlays = 0;
    catalog.palette = {};
    asked.clear();
    paletteFor = 0;
}
