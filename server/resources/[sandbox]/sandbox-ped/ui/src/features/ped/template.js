/** Mirror of TemplateData in server/ped.lua so the UI renders before SET_PED_DATA. */
const face = (mix) => ({ index: 0, texture: 0, mix });
const overlay = (id) => ({ id, index: 0, opacity: 100, disabled: true });
const colorPair = () => ({
    color1: { index: 0, rgb: 'rgb(0, 0, 0)' },
    color2: { index: 0, rgb: 'rgb(0, 0, 0)' },
});
const component = (componentId) => ({ componentId, drawableId: 0, textureId: 0, paletteId: 0 });
const prop = (componentId) => ({ componentId, drawableId: 0, textureId: 0, disabled: true });

export const TEMPLATE_PED = {
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
        colors: { hair: colorPair(), facialhair: colorPair(), eyebrows: colorPair(), chesthair: colorPair() },
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
    },
};
