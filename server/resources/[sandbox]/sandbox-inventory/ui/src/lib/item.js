/**
 * Item helpers shared by the grids, tooltips, hotbar and crafting table.
 * Pure functions: they take the item definitions map as an argument.
 */
import { resourceName } from '@sandbox/ui-kit/nui';

/** Weight unit shown after every weight. The Lua defines no unit; the user asked for kg. */
export const WEIGHT_UNIT = 'kg';

/** The definition used when Lua sent a slot whose item is not in the item list. */
export const FALLBACK_ITEM = Object.freeze({
    name: 'ph',
    label: 'Unknown item',
    description: 'This item has no definition. Ask staff to run /reloaditems, and report it if it stays.',
    invalid: true,
    price: 0,
    isStackable: false,
    type: -1,
    rarity: -1,
    weight: 0,
});

export const ITEM_TYPES = {
    1: 'Consumable',
    2: 'Weapon',
    3: 'Tool',
    4: 'Crafting ingredient',
    5: 'Collectable',
    6: 'Junk',
    7: 'Unknown',
    8: 'Evidence',
    9: 'Ammunition',
    10: 'Container',
    11: 'Gem',
    12: 'Paraphernalia',
    13: 'Wearable',
    14: 'Contraband',
    15: 'Gang chain',
    16: 'Weapon attachment',
    17: 'Crafting schematic',
    18: 'Device',
    19: 'Explosive device',
};

export const RARITIES = {
    1: 'Common',
    2: 'Uncommon',
    3: 'Rare',
    4: 'Epic',
    5: 'Objective',
    6: 'Legendary',
    7: 'Exotic',
};

/** Lua arrays cross the bridge as objects when they are sparse. */
export function asList(v) {
    if (Array.isArray(v)) return v.filter(Boolean);
    if (v && typeof v === 'object') return Object.values(v).filter(Boolean);
    return [];
}

/** Old Lua-table syntax (`[k] = v`) to JSON, as the previous UI did. */
function luaToJson(src) {
    return src.replace(/\[([^[\]]+)\]\s*=/g, (s, k) => `${k} :`).replace(/,(\s*)\}/gm, (s, k) => `${k}}`);
}

/** MetaData arrives as an object or as the JSON string stored in the database. */
export function parseMeta(meta) {
    if (!meta) return {};
    if (typeof meta === 'object') return meta;
    if (typeof meta !== 'string') return {};
    try {
        const v = JSON.parse(meta);
        return v && typeof v === 'object' ? v : {};
    } catch {
        try {
            const v = JSON.parse(luaToJson(meta));
            return v && typeof v === 'object' ? v : {};
        } catch {
            return {};
        }
    }
}

export function itemDef(items, name) {
    if (!name) return null;
    return items[name] ?? FALLBACK_ITEM;
}

export function itemLabel(instance, def) {
    const md = parseMeta(instance?.MetaData);
    return md.CustomItemLabel || def?.label || instance?.Label || 'Unknown item';
}

const IMAGE_ROOT = () => `https://cfx-nui-${resourceName()}/ui/images/items/`;

/** Image candidates in order; the cell tries the next one when one fails to load. */
export function imageSources(instance, def) {
    const md = parseMeta(instance?.MetaData);
    const smd = parseMeta(def?.staticMetadata);
    const out = [];
    if (typeof md.CustomItemImage === 'string' && md.CustomItemImage) out.push(md.CustomItemImage);
    if (typeof smd.CustomItemImage === 'string' && smd.CustomItemImage) out.push(smd.CustomItemImage);
    const base = def?.iconOverride || def?.name || instance?.Name;
    if (base) out.push(`${IMAGE_ROOT()}${encodeURIComponent(base)}.webp`);
    out.push(`${IMAGE_ROOT()}ph.webp`);
    return [...new Set(out)];
}

/** Remaining durability in percent (can go below zero), or null when the item does not wear. */
export function durabilityOf(instance, def, nowSec = Date.now() / 1000) {
    if (!def?.durability || !instance?.CreateDate) return null;
    return Math.ceil(100 - ((Math.floor(nowSec) - Number(instance.CreateDate)) / Number(def.durability)) * 100);
}

export function isBroken(instance, def, nowSec) {
    const d = durabilityOf(instance, def, nowSec);
    return d !== null && d <= 0;
}

/** Highest count one slot can hold (0 when the item does not stack). */
export function stackMax(def) {
    const n = Number(def?.isStackable);
    return Number.isFinite(n) && n > 0 ? n : 0;
}

export function inventoryWeight(list, items) {
    let w = 0;
    for (const s of list) {
        if (!s) continue;
        w += (Number(items[s.Name]?.weight) || 0) * (Number(s.Count) || 0);
    }
    return w;
}

const weightFmt = new Intl.NumberFormat('en-AU', { maximumFractionDigits: 2 });
export function formatWeight(n) {
    return weightFmt.format(Math.max(0, Number(n) || 0));
}

const moneyFmt = new Intl.NumberFormat('en-AU', { maximumFractionDigits: 0 });
export function formatPrice(n) {
    return `$${moneyFmt.format(Math.max(0, Number(n) || 0))}`;
}

const countFmt = new Intl.NumberFormat('en-AU');
export function formatCount(n) {
    return countFmt.format(Number(n) || 0);
}

/** Unit price of a slot in a shop or player shop (0 is free). */
export function unitPrice(instance, def, inv) {
    if (inv?.free) return 0;
    if (inv?.playerShop) return Number(instance?.Price) || 0;
    return Number(instance?.Price ?? def?.price) || 0;
}

export function typeLabel(def) {
    return ITEM_TYPES[def?.type] ?? (def?.type === -1 ? 'Missing definition' : String(def?.type ?? 'Item'));
}

export function rarityLabel(def) {
    return RARITIES[def?.rarity] ?? null;
}

const dateFmt = new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
/** "16 October 2026" from a unix time (s or ms) or a date string. */
export function formatLongDate(value) {
    if (value === null || value === undefined || value === '') return '';
    let d;
    if (typeof value === 'number') d = new Date(value < 1e12 ? value * 1000 : value);
    else d = new Date(value);
    return Number.isNaN(d.getTime()) ? String(value) : dateFmt.format(d);
}

/** "in 3 h", "in 12 min", "now" for a time in the future (ms). */
export function formatUntil(ms, now = Date.now()) {
    const s = Math.max(0, Math.round((Number(ms) - now) / 1000));
    if (s <= 0) return 'now';
    if (s < 60) return `in ${s} s`;
    const m = Math.round(s / 60);
    if (m < 60) return `in ${m} min`;
    const h = Math.floor(m / 60);
    const rm = m % 60;
    if (h < 24) return rm ? `in ${h} h ${rm} min` : `in ${h} h`;
    const d = Math.floor(h / 24);
    const rh = h % 24;
    return rh ? `in ${d} d ${rh} h` : `in ${d} d`;
}
