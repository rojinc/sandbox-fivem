/** Frame images and the wallpapers that ship with the phone. */
import frameDefault from '../assets/frames/default.png';
import frameBlue from '../assets/frames/blue.png';
import frameGold from '../assets/frames/gold.png';
import framePink from '../assets/frames/pink.png';
import frameWhite from '../assets/frames/white.png';
import wall1 from '../assets/wallpapers/1.webp';
import wall2 from '../assets/wallpapers/2.webp';
import wall5 from '../assets/wallpapers/5.webp';
import wall8 from '../assets/wallpapers/8.webp';
import wall12 from '../assets/wallpapers/12.webp';
import wall25 from '../assets/wallpapers/25.webp';

/**
 * Each frame is a 500x1000 image with a transparent screen. `screen` is the
 * hole measured on the image (left, top, right, bottom in image pixels).
 */
export const FRAMES = {
    default: { src: frameDefault, label: 'Graphite', screen: [12, 34, 488, 971] },
    blue: { src: frameBlue, label: 'Blue', screen: [8, 36, 488, 970] },
    gold: { src: frameGold, label: 'Gold', screen: [17, 43, 488, 971] },
    pink: { src: framePink, label: 'Pink', screen: [11, 43, 487, 970] },
    white: { src: frameWhite, label: 'White', screen: [16, 42, 488, 968] },
};

export function frameFor(name) {
    return FRAMES[name] ?? FRAMES.default;
}

/** Keys match PhoneSettings.wallpaper values saved by the old phone. */
export const WALLPAPERS = {
    wallpaper: { src: wall1, label: 'SandboxRP' },
    wallpaper2: { src: wall2, label: 'City towers' },
    wallpaper5: { src: wall5, label: 'Mountains' },
    wallpaper8: { src: wall8, label: 'Night skyline' },
    wallpaper12: { src: wall12, label: 'Street' },
    wallpaper25: { src: wall25, label: 'Nebula' },
};

/** A saved key, a custom https image link, or the default. */
export function wallpaperSrc(value) {
    if (value && WALLPAPERS[value]) return WALLPAPERS[value].src;
    if (typeof value === 'string' && /^https:\/\/\S+$/i.test(value)) return value;
    return WALLPAPERS.wallpaper.src;
}
