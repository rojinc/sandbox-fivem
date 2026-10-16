/**
 * Head overlays (ped.customization.overlay.<key>). `max` is the highest style
 * index the game offers. `colors` is how many colour indices the overlay takes
 * (color1, color2): client/ped.lua ApplyToPed tints them from the makeup
 * palette, whose RGB values Lua does not expose, so they are picked by index.
 * The style ranges are the ones the previous UI offered.
 */
export const OVERLAYS = {
    blemish: { label: 'Blemishes', max: 23 },
    facialhair: { label: 'Facial hair', max: 28 },
    eyebrows: { label: 'Eyebrows', max: 28 },
    ageing: { label: 'Ageing', max: 14 },
    makeup: { label: 'Makeup', max: 74, colors: 2 },
    blush: { label: 'Blush', max: 6, colors: 1 },
    complexion: { label: 'Complexion', max: 11 },
    sundamage: { label: 'Sun damage', max: 10 },
    lipstick: { label: 'Lipstick', max: 9, colors: 1 },
    freckles: { label: 'Moles and freckles', max: 10 },
    chesthair: { label: 'Chest hair', max: 16, colors: 1 },
    bodyblemish: { label: 'Body blemishes', max: 10 },
    addbodyblemish: { label: 'More body blemishes', max: 1 },
};

/** Makeup palette size (colour indices 0..63). */
export const OVERLAY_COLOURS = 64;
