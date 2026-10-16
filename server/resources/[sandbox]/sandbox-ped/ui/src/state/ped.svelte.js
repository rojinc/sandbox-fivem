/**
 * The ped being edited. Lua owns the truth (SET_PED_DATA); every control also
 * applies its change here so the editor reflects it at once, then calls the
 * matching NUI callback, which applies it to the ped in game. Callback bodies
 * are exactly what client/nui.lua reads.
 */
import { fetchNui } from '@sandbox/ui-kit/nui';

const face = (mix) => ({ index: 0, texture: 0, mix });
const overlay = (id) => ({ id, index: 0, opacity: 100, disabled: true });
const colourPair = () => ({ color1: { index: 0, rgb: 'rgb(0, 0, 0)' }, color2: { index: 0, rgb: 'rgb(0, 0, 0)' } });
const component = (componentId) => ({ componentId, drawableId: 0, textureId: 0, paletteId: 0 });
const prop = (componentId) => ({ componentId, drawableId: 0, textureId: 0, disabled: true });

/** Mirror of TemplateData in server/ped.lua, so the editor renders before SET_PED_DATA. */
export function templatePed() {
    return {
        model: '',
        customization: {
            face: { face1: face(50), face2: face(50), face3: face(100), features: Array(20).fill(0) },
            eyeColor: 0,
            overlay: {
                blemish: overlay(0),
                facialhair: overlay(1),
                eyebrows: overlay(2),
                ageing: overlay(3),
                makeup: overlay(4),
                blush: overlay(5),
                complexion: overlay(6),
                sundamage: overlay(7),
                lipstick: overlay(8),
                freckles: overlay(9),
                chesthair: overlay(10),
                bodyblemish: overlay(11),
                addbodyblemish: overlay(12),
            },
            colors: { hair: colourPair(), facialhair: colourPair(), eyebrows: colourPair(), chesthair: colourPair() },
            components: {
                face: component(0),
                mask: component(1),
                hair: component(2),
                torso: component(3),
                leg: component(4),
                bag: component(5),
                shoes: component(6),
                accessory: component(7),
                undershirt: component(8),
                kevlar: component(9),
                badge: component(10),
                torso2: component(11),
            },
            props: { hat: prop(0), glass: prop(1), ear: prop(2), watch: prop(6), bracelet: prop(7) },
            tattoos: [],
            hairOverlay: -1,
        },
    };
}

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);

/**
 * Face features are keyed by feature number in Lua (SetPedFaceFeature stores
 * features[index], ApplyToPed reads features[i] or features[tostring(i)]).
 * A Lua table that is a plain 1..n sequence arrives as a JSON array whose
 * first element is Lua key 1, so array position k is feature k + 1.
 */
function readFeatures(raw) {
    const out = Array(20).fill(0);
    if (Array.isArray(raw)) {
        for (let n = 1; n < 20; n += 1) out[n] = num(raw[n - 1]);
    } else if (isObj(raw)) {
        for (let n = 0; n < 20; n += 1) out[n] = num(raw[n] ?? raw[String(n)]);
    }
    return out;
}

const list = (v) => (Array.isArray(v) ? v : isObj(v) ? Object.values(v) : []);

/** Fill every key the editor binds to, keeping whatever Lua sent. */
export function normalisePed(raw) {
    const t = templatePed();
    if (!isObj(raw)) return t;
    const c = isObj(raw.customization) ? raw.customization : {};
    const out = { ...raw, model: typeof raw.model === 'string' ? raw.model : '', customization: { ...c } };
    const oc = out.customization;
    const f = isObj(c.face) ? c.face : {};
    oc.face = {
        face1: { ...t.customization.face.face1, ...(f.face1 ?? {}) },
        face2: { ...t.customization.face.face2, ...(f.face2 ?? {}) },
        face3: { ...t.customization.face.face3, ...(f.face3 ?? {}) },
        features: readFeatures(f.features),
    };
    oc.eyeColor = num(c.eyeColor);
    oc.overlay = {};
    for (const [k, v] of Object.entries(t.customization.overlay)) oc.overlay[k] = { ...v, ...(isObj(c.overlay?.[k]) ? c.overlay[k] : {}) };
    oc.colors = {};
    for (const [k, v] of Object.entries(t.customization.colors)) {
        const src = isObj(c.colors?.[k]) ? c.colors[k] : {};
        oc.colors[k] = { color1: { ...v.color1, ...(src.color1 ?? {}) }, color2: { ...v.color2, ...(src.color2 ?? {}) } };
    }
    oc.components = {};
    for (const [k, v] of Object.entries(t.customization.components)) oc.components[k] = { ...v, ...(isObj(c.components?.[k]) ? c.components[k] : {}) };
    oc.props = {};
    for (const [k, v] of Object.entries(t.customization.props)) oc.props[k] = { ...v, ...(isObj(c.props?.[k]) ? c.props[k] : {}) };
    oc.tattoos = list(c.tattoos).filter(isObj);
    oc.hairOverlay = typeof c.hairOverlay === 'number' ? c.hairOverlay : -1;
    return out;
}

export const pedState = $state({ gender: 0, ped: templatePed() });

export function setPedData(d = {}) {
    if (isObj(d.ped)) pedState.ped = normalisePed(d.ped);
    if (d.gender !== undefined) pedState.gender = Number(d.gender) === 1 ? 1 : 0;
}

export function resetPed() {
    pedState.gender = 0;
    pedState.ped = templatePed();
}

export const sound = (name) => fetchNui('FrontEndSound', { sound: name });

const cz = () => pedState.ped.customization;

/** One helper per NUI callback that changes the ped. */
export const act = {
    headBlend(faceKey, type, value) {
        cz().face[faceKey][type] = value;
        fetchNui('SetPedHeadBlendData', { face: faceKey, type, value });
    },
    faceFeature(index, value) {
        cz().face.features[index] = value;
        fetchNui('SetPedFaceFeature', { index, value });
    },
    overlay(type, extraType, value) {
        cz().overlay[type][extraType] = value;
        fetchNui('SetPedHeadOverlay', { type, extraType, value });
    },
    component(name, type, value) {
        cz().components[name][type] = value;
        fetchNui('SetPedComponentVariation', { name, type, value });
    },
    prop(name, type, value) {
        cz().props[name][type] = value;
        fetchNui('SetPedPropIndex', { name, type, value });
    },
    hairColour(name, type, value) {
        cz().colors[name][type].index = value;
        fetchNui('SetPedHairColor', { name, type, value });
    },
    hairOverlay(value) {
        cz().hairOverlay = value;
        fetchNui('SetPedHairOverlay', { value });
    },
    eyeColour(value) {
        cz().eyeColor = value;
        fetchNui('SetPedEyeColor', { value });
    },
    tattooAdd(zone) {
        cz().tattoos.push({ Name: '', Collection: '', Hash: '', Zone: zone });
        fetchNui('AddPedTattoo', { type: zone });
    },
    tattooRemove(index) {
        cz().tattoos.splice(index, 1);
        fetchNui('RemovePedTattoo', { index });
    },
    tattooSet(index, data) {
        cz().tattoos[index] = { ...data };
        fetchNui('SetPedTattoo', { index, data: { ...data } });
    },
};
