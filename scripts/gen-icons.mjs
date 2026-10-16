#!/usr/bin/env node
/**
 * Generate ui-kit/src/icons/set.js: the Tabler outline icons every NUI can
 * draw by name, plus the alias table that turns Font Awesome names (which the
 * Lua code sends at runtime) into Tabler names.
 *
 *   npm run icons
 *
 * Included: every Tabler name in BASE below, every icon name found in the
 * Lua code under server/resources, and every name the alias tables know.
 * Unknown names fall back to "point" at runtime, so the bundle stays small.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ICON_ALIASES as FA_ALIASES } from '../ui-kit/src/icons/fa-aliases.js';
import { TABLER_ALIASES } from '../ui-kit/src/icons/tabler-aliases.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outline = JSON.parse(readFileSync(path.join(ROOT, 'node_modules/@tabler/icons/tabler-nodes-outline.json'), 'utf8'));
const filled = JSON.parse(readFileSync(path.join(ROOT, 'node_modules/@tabler/icons/tabler-nodes-filled.json'), 'utf8'));

// Icons the interfaces use directly.
const BASE = `
x check plus minus search settings dots dots-vertical refresh loader-2 pin edit pencil copy trash logout login
arrow-left arrow-right arrow-up arrow-down chevron-left chevron-right chevron-up chevron-down caret-up caret-down
alert-circle alert-triangle info-circle circle-check circle-x help-circle bell bell-ringing lock lock-open
eye eye-off user users user-circle user-plus user-minus id id-badge-2 home building building-bank building-store
map map-pin map-2 compass navigation world clock calendar hourglass history
heart heartbeat shield shield-half shield-check shield-lock first-aid-kit medical-cross pill brain barbell
meat glass-full coffee cup beer bottle tools-kitchen-2 bread cookie pizza soup
car car-crash gas-station gauge flame bulb steering-wheel engine motorbike bike truck ambulance key
radio device-mobile device-tablet device-laptop device-tv device-floppy microphone microphone-off volume volume-off
phone phone-call phone-off phone-x phone-outgoing phone-incoming message messages message-dots mail send
camera photo music player-play player-pause player-stop wifi antenna antenna-bars-5 battery
cash credit-card coins moneybag pig-money receipt file-text file-invoice file-dollar wallet currency-dollar trending-up trending-down
package packages box shopping-cart shopping-bag tools tool hammer gavel scale target crosshair
power urgent speakerphone star crown diamond trophy flag sparkles wand
point circle square checkbox list list-check menu-2 layout-grid table filter sort-ascending sort-descending
external-link link link-off download upload printer clipboard clipboard-check notes file folder folders
door-exit door-enter armchair bed hanger shirt sunglasses eyeglass mask ghost walk run swimming
dice-5 cards device-gamepad terminal-2 cpu code
`.split(/\s+/).filter(Boolean);
const FILLED = ['heart', 'shield', 'circle', 'star', 'bell', 'map-pin', 'droplet', 'bolt', 'flame', 'microphone', 'player-play', 'player-pause'];

function luaIconNames() {
    const names = new Set();
    const re = /["']?icon["']?\s*[=:]\s*["']([^"']+)["']/gi;
    const walk = (dir) => {
        for (const f of readdirSync(dir)) {
            const p = path.join(dir, f);
            if (f === 'node_modules' || f === 'dist' || f.startsWith('.')) continue;
            const st = statSync(p);
            if (st.isDirectory()) walk(p);
            else if (f.endsWith('.lua')) {
                for (const m of readFileSync(p, 'utf8').matchAll(re)) names.add(m[1]);
            }
        }
    };
    walk(path.join(ROOT, 'server/resources'));
    return names;
}

/** "fas fa-car", "fa-solid fa-car", "car" -> "car" */
export function bareName(input) {
    let name = null;
    for (const part of String(input).trim().toLowerCase().split(/\s+/)) {
        if (!part || part === 'fa' || part === 'fa-fw') continue;
        if (/^(fa[a-z]?|fa-(solid|regular|light|thin|duotone|brands|sharp))$/.test(part)) continue;
        name = part.replace(/^fa-/, '');
    }
    return name;
}

const HEURISTICS = [
    (n) => n.replace(/xmark/g, 'x'),
    (n) => n.replace(/-slash$/, '-off'),
    (n) => n.replace(/^circle-(.+)$/, '$1-circle'),
    (n) => n.replace(/^(.+)-circle$/, 'circle-$1'),
    (n) => n.replace(/^house/, 'home'),
    (n) => n.replace(/-(alt|simple|solid|sharp|on)$/, ''),
    (n) => n.replace(/^(person|user)-/, ''),
    (n) => n.split('-').slice(0, -1).join('-'),
    (n) => n.split('-').slice(1).join('-'),
];

function resolve(name, depth = 0) {
    if (!name || depth > 4) return null;
    if (TABLER_ALIASES[name] && outline[TABLER_ALIASES[name]]) return TABLER_ALIASES[name];
    if (outline[name]) return name;
    if (FA_ALIASES[name] && FA_ALIASES[name] !== name) {
        const r = resolve(FA_ALIASES[name], depth + 1);
        if (r) return r;
    }
    if (depth === 0) {
        for (const h of HEURISTICS) {
            const n2 = h(name);
            if (n2 && n2 !== name && (outline[n2] || TABLER_ALIASES[n2])) return resolve(n2, depth + 1);
        }
    }
    return null;
}

const wanted = new Set(BASE);
const aliases = {};
const unresolved = [];
const candidates = new Set([...luaIconNames()].map(bareName).filter(Boolean));
for (const k of Object.keys(TABLER_ALIASES)) candidates.add(k);
for (const [k, v] of Object.entries(FA_ALIASES)) {
    candidates.add(k);
    candidates.add(v);
}
for (const name of candidates) {
    const r = resolve(name);
    if (!r) {
        unresolved.push(name);
        continue;
    }
    wanted.add(r);
    if (r !== name) aliases[name] = r;
}
for (const n of [...wanted]) if (!outline[n]) wanted.delete(n);

const icons = {};
for (const n of [...wanted].sort()) icons[n] = outline[n];
const filledIcons = {};
for (const n of FILLED) if (filled[n]) filledIcons[n] = filled[n];

const header = `// Generated by scripts/gen-icons.mjs from @tabler/icons (MIT). Do not edit; run \`npm run icons\`.\n`;
const body =
    `${header}export const OUTLINE = ${JSON.stringify(icons)};\n` +
    `export const FILLED = ${JSON.stringify(filledIcons)};\n` +
    `export const ALIASES = ${JSON.stringify(aliases)};\n`;
writeFileSync(path.join(ROOT, 'ui-kit/src/icons/set.js'), body);
const luaNames = [...luaIconNames()].map(bareName).filter(Boolean);
const luaMissing = [...new Set(luaNames.filter((n) => !resolve(n)))];
console.log(`icons: ${Object.keys(icons).length} outline, ${Object.keys(filledIcons).length} filled, ${Object.keys(aliases).length} aliases, ${(body.length / 1024).toFixed(0)} KB`);
console.log(`Lua icon names without a Tabler match (fall back to "point"): ${luaMissing.length ? luaMissing.join(', ') : 'none'}`);
