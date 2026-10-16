/** SetPedFaceFeature indices (0..19), grouped for the Features section. */
export const FACE_FEATURE_GROUPS = [
    {
        title: 'Nose',
        items: [
            { label: 'Width', index: 0 },
            { label: 'Peak height', index: 1 },
            { label: 'Peak length', index: 2 },
            { label: 'Bone height', index: 3 },
            { label: 'Peak lowering', index: 4 },
            { label: 'Bone twist', index: 5 },
        ],
    },
    {
        title: 'Eyebrows',
        items: [
            { label: 'Height', index: 6 },
            { label: 'Length', index: 7 },
        ],
    },
    {
        title: 'Cheeks',
        items: [
            { label: 'Bone height', index: 8 },
            { label: 'Bone width', index: 9 },
            { label: 'Width', index: 10 },
        ],
    },
    {
        title: 'Eyes & lips',
        items: [
            { label: 'Eye opening', index: 11 },
            { label: 'Lip thickness', index: 12 },
        ],
    },
    {
        title: 'Jaw',
        items: [
            { label: 'Width', index: 13 },
            { label: 'Length', index: 14 },
        ],
    },
    {
        title: 'Chin',
        items: [
            { label: 'Height', index: 15 },
            { label: 'Length', index: 16 },
            { label: 'Width', index: 17 },
            { label: 'Dimple', index: 18 },
        ],
    },
    {
        title: 'Neck',
        items: [{ label: 'Thickness', index: 19 }],
    },
];

export const EYE_COLORS = [
    'Black',
    'Light blue / green',
    'Dark blue',
    'Brown',
    'Dark brown',
    'Light brown',
    'Blue',
    'Light blue',
    'Pink',
    'Yellow',
    'Purple',
    'Black',
    'Dark green',
    'Light brown',
    'Yellow / black pattern',
    'Light spiral',
    'Chromatic red',
    'Chromatic red / blue',
    'Black & blue',
    'Red & white',
    'Green snake',
    'Red snake',
    'Dark blue snake',
    'Dark yellow',
    'Bright yellow',
    'Solid black',
    'Blue & black devil',
    'Small white pupil',
    'Glossed over',
];

/** Head-blend shape/skin indices go 0..46 (as the previous UI allowed). */
export const HEAD_BLEND_MAX = 46;
