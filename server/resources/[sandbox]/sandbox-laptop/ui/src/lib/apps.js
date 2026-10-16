/**
 * Which apps the player can see, in their desktop order, and how to draw an
 * app tile.
 */
import { laptop } from '../state/laptop.svelte.js';
import { data, asList } from '../state/data.svelte.js';
import { canUseApp } from './perms.js';

export function appDef(name) {
    return laptop.apps[name] ?? null;
}

/** Usable apps in the order of LaptopApps.home, then any other usable app. */
export function desktopApps() {
    const all = Object.values(laptop.apps).filter((a) => !a.hidden && canUseApp(a));
    const home = asList(data.player?.LaptopApps?.home);
    if (!home.length) return all;
    const ordered = home.map((n) => all.find((a) => a.name === n)).filter(Boolean);
    return ordered;
}

/** The app a notification belongs to: an installed app by name, or an inline { label, icon, color }. */
export function notificationApp(n) {
    if (n?.app && typeof n.app === 'object' && !Array.isArray(n.app)) return { name: null, label: n.app.label ?? '', icon: n.app.icon, color: n.app.color };
    const def = appDef(n?.app);
    return def && canUseApp(def) ? def : null;
}

/** Ink or light icon on a tile colour, whichever reads better. */
export function tileInk(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(String(hex ?? '').trim());
    if (!m) return 'light';
    const n = parseInt(m[1], 16);
    const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    const lum = 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
    return lum > 0.3 ? 'dark' : 'light';
}

export function isVeryDark(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(String(hex ?? '').trim());
    if (!m) return false;
    const n = parseInt(m[1], 16);
    return ((n >> 16) & 255) + ((n >> 8) & 255) + (n & 255) < 120;
}
