/**
 * Head overlays (ped.customization.overlay.<key>). `max` is the highest style
 * index the game offers; `colors` is how many colour slots the overlay has
 * (1 = color1, 2 = color1 + color2). `palette: 'hair'` means the game colours
 * it from the hair palette, so swatches can be shown.
 */
export const OVERLAYS = {
    blemish: { key: 'blemish', id: 0, label: 'Blemishes', max: 23 },
    facialhair: { key: 'facialhair', id: 1, label: 'Facial hair', max: 28 },
    eyebrows: { key: 'eyebrows', id: 2, label: 'Eyebrows', max: 28 },
    ageing: { key: 'ageing', id: 3, label: 'Ageing', max: 14 },
    makeup: { key: 'makeup', id: 4, label: 'Makeup', max: 74, colors: 2 },
    blush: { key: 'blush', id: 5, label: 'Blush', max: 6, colors: 1 },
    complexion: { key: 'complexion', id: 6, label: 'Complexion', max: 11 },
    sundamage: { key: 'sundamage', id: 7, label: 'Sun damage', max: 10 },
    lipstick: { key: 'lipstick', id: 8, label: 'Lipstick', max: 9, colors: 1 },
    freckles: { key: 'freckles', id: 9, label: 'Moles & freckles', max: 10 },
    chesthair: { key: 'chesthair', id: 10, label: 'Chest hair', max: 16, colors: 1 },
    bodyblemish: { key: 'bodyblemish', id: 11, label: 'Body blemishes', max: 10 },
    addbodyblemish: { key: 'addbodyblemish', id: 12, label: 'Extra body blemishes', max: 1 },
};

export const OVERLAY_COLOR_MAX = 63;
