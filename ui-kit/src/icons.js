/**
 * Icon registry. Font Awesome free icon definitions are registered by the
 * app (all of `fas` when Lua sends icon names at runtime, or just the few it
 * needs) and looked up by name, with the Pro -> free alias map applied.
 *
 *   import { fas } from '@fortawesome/free-solid-svg-icons';
 *   registerIcons(fas);
 *   <Icon icon="heart" />  <Icon icon="far fa-heart" />  <Icon icon={faHeart} />
 */
import { ICON_ALIASES } from './icon-aliases.js';

const registry = new Map();
const warned = new Set();

const PREFIX_FALLBACK = {
    fas: 'fas',
    far: 'far',
    fab: 'fab',
    fad: 'fas',
    fal: 'fas',
    fat: 'fas',
    fass: 'fas',
    fasr: 'far',
    fasl: 'fas',
    fast: 'fas',
    fadr: 'far',
    fadl: 'fas',
    fadt: 'fas',
    'fa-solid': 'fas',
    'fa-regular': 'far',
    'fa-brands': 'fab',
    'fa-duotone': 'fas',
    'fa-light': 'fas',
    'fa-thin': 'fas',
    'fa-sharp': 'fas',
};

/** Register every definition in the given packs (`fas`, `far`, `fab` or `{ faHeart, ... }`). */
export function registerIcons(...packs) {
    for (const pack of packs) {
        if (!pack) continue;
        for (const def of Object.values(pack)) {
            if (def && def.prefix && def.iconName && def.icon) registry.set(`${def.prefix}/${def.iconName}`, def);
        }
    }
}

function normalise(name) {
    return String(name)
        .trim()
        .toLowerCase()
        .replace(/^fa-/, '');
}

/** Turn any accepted icon reference into { prefix, name } or { def }. */
export function parseIcon(input) {
    if (!input) return null;
    if (Array.isArray(input)) {
        const prefix = PREFIX_FALLBACK[String(input[0]).toLowerCase()] ?? 'fas';
        return input[1] ? { prefix, name: normalise(input[1]) } : null;
    }
    if (typeof input === 'object') {
        if (input.icon && input.iconName) return { def: input };
        const name = input.iconName ?? input.name;
        return name ? { prefix: PREFIX_FALLBACK[input.prefix] ?? 'fas', name: normalise(name) } : null;
    }
    let prefix = 'fas';
    let name = null;
    for (const part of String(input).trim().split(/\s+/)) {
        const p = part.toLowerCase();
        if (!p || p === 'fa' || p === 'fa-fw') continue;
        if (PREFIX_FALLBACK[p]) prefix = PREFIX_FALLBACK[p];
        else if (p.startsWith('fa-')) name = p.slice(3);
        else if (!name) name = p;
    }
    return name ? { prefix, name } : null;
}

/** Resolve to a Font Awesome definition, applying aliases and prefix fallbacks. */
export function resolveIcon(input, fallback = 'circle-dot') {
    const parsed = parseIcon(input);
    if (parsed?.def) return parsed.def;
    if (parsed) {
        const names = [parsed.name];
        let alias = ICON_ALIASES[parsed.name];
        for (let i = 0; alias && i < 3 && !names.includes(alias); i += 1) {
            names.push(alias);
            alias = ICON_ALIASES[alias];
        }
        const prefixes = [parsed.prefix, 'fas', 'far', 'fab'];
        for (const name of names) {
            for (const prefix of prefixes) {
                const def = registry.get(`${prefix}/${name}`);
                if (def) return def;
            }
        }
        if (!warned.has(parsed.name)) {
            warned.add(parsed.name);
            console.warn(`[icons] not found: ${String(input)}`);
        }
    }
    return fallback ? resolveIcon(fallback, null) : null;
}

export function hasIcon(input) {
    return Boolean(resolveIcon(input, null));
}

export { ICON_ALIASES };
