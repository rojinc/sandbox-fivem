/**
 * The ten wallpapers the laptop has always offered, keyed as LaptopSettings
 * stores them ("wallpaper", "wallpaper2" ... "wallpaper10"). Any other value
 * is a custom image link.
 */
import w1 from '../assets/wallpapers/1.webp';
import w2 from '../assets/wallpapers/2.webp';
import w3 from '../assets/wallpapers/3.webp';
import w4 from '../assets/wallpapers/4.webp';
import w5 from '../assets/wallpapers/5.webp';
import w6 from '../assets/wallpapers/6.webp';
import w7 from '../assets/wallpapers/7.webp';
import w8 from '../assets/wallpapers/8.webp';
import w9 from '../assets/wallpapers/9.webp';
import w10 from '../assets/wallpapers/10.webp';
import t1 from '../assets/wallpapers/thumbs/1.webp';
import t2 from '../assets/wallpapers/thumbs/2.webp';
import t3 from '../assets/wallpapers/thumbs/3.webp';
import t4 from '../assets/wallpapers/thumbs/4.webp';
import t5 from '../assets/wallpapers/thumbs/5.webp';
import t6 from '../assets/wallpapers/thumbs/6.webp';
import t7 from '../assets/wallpapers/thumbs/7.webp';
import t8 from '../assets/wallpapers/thumbs/8.webp';
import t9 from '../assets/wallpapers/thumbs/9.webp';
import t10 from '../assets/wallpapers/thumbs/10.webp';

export const DEFAULT_WALLPAPER = 'wallpaper';

export const WALLPAPERS = [
    { key: 'wallpaper', label: 'City park at sunset', file: w1, thumb: t1 },
    { key: 'wallpaper2', label: 'Red mountain range', file: w2, thumb: t2 },
    { key: 'wallpaper3', label: 'Surf on sand', file: w3, thumb: t3 },
    { key: 'wallpaper4', label: 'Towers in fog', file: w4, thumb: t4 },
    { key: 'wallpaper5', label: 'Canyon at night', file: w5, thumb: t5 },
    { key: 'wallpaper6', label: 'Hot air balloons', file: w6, thumb: t6 },
    { key: 'wallpaper7', label: 'Milky Way over peaks', file: w7, thumb: t7 },
    { key: 'wallpaper8', label: 'Dark sea', file: w8, thumb: t8 },
    { key: 'wallpaper9', label: 'Panda in the grass', file: w9, thumb: t9 },
    { key: 'wallpaper10', label: 'Mountain at dusk', file: w10, thumb: t10 },
];

const byKey = Object.fromEntries(WALLPAPERS.map((w) => [w.key, w]));

export function isPreset(value) {
    return Boolean(byKey[value]);
}

/** Image URL for a stored setting: a preset file, a custom https link, or the default. */
export function wallpaperUrl(value) {
    if (byKey[value]) return byKey[value].file;
    if (typeof value === 'string' && /^https:\/\//i.test(value.trim())) return value.trim();
    return byKey[DEFAULT_WALLPAPER].file;
}
