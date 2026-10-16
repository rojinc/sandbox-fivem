/**
 * Icon lookup. Every interface draws Tabler outline icons by name; Font
 * Awesome names coming from Lua ("fas fa-car", "gas-pump") resolve through
 * the alias table generated into set.js. Unknown names resolve to "point".
 */
import { OUTLINE, FILLED, ALIASES } from './set.js';

const warned = new Set();

/** "fas fa-car" / "fa-solid fa-car" / "car" -> "car" */
export function bareIconName(input) {
    if (!input || typeof input !== 'string') return null;
    let name = null;
    for (const part of input.trim().toLowerCase().split(/\s+/)) {
        if (!part || part === 'fa' || part === 'fa-fw') continue;
        if (/^(fa[a-z]?|fa-(solid|regular|light|thin|duotone|brands|sharp))$/.test(part)) continue;
        name = part.replace(/^fa-/, '');
    }
    return name;
}

/** Tabler name for any accepted input, or null. */
export function iconName(input) {
    const bare = bareIconName(input);
    if (!bare) return null;
    if (OUTLINE[bare]) return bare;
    if (ALIASES[bare]) return ALIASES[bare];
    return null;
}

/** Node list ([tag, attrs][]) for an icon; falls back to `fallback`. */
export function resolveIcon(input, { filled = false, fallback = 'point' } = {}) {
    const name = iconName(input);
    if (name) {
        if (filled && FILLED[name]) return { name, nodes: FILLED[name], filled: true };
        return { name, nodes: OUTLINE[name], filled: false };
    }
    if (input && !warned.has(input)) {
        warned.add(input);
        console.warn(`[icons] no icon for "${input}"`);
    }
    return fallback ? { name: fallback, nodes: OUTLINE[fallback], filled: false } : null;
}

export function hasIcon(input) {
    return Boolean(iconName(input));
}
