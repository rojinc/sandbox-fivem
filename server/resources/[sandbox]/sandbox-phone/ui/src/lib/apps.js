/**
 * Which apps this character can use, and how each one is drawn on the home
 * screen. Mirrors the old useMyApps hook and Phone:IsAppUsable in Lua.
 */
import { phone } from '../state/phone.svelte.js';
import { data } from '../state/data.svelte.js';

/** Tabler names for the app tiles (the catalogue sends Font Awesome names, several with no Tabler twin). */
const APP_ICONS = {
    phone: 'phone',
    messages: 'message',
    contacts: 'address-book',
    store: 'building-store',
    settings: 'settings',
    email: 'mail',
    bank: 'building-bank',
    loans: 'file-dollar',
    twitter: 'speakerphone',
    chatter: 'messages',
    adverts: 'tag',
    redline: 'flag',
    blueline: 'stopwatch',
    comanager: 'briefcase',
    labor: 'shovel',
    crypto: 'coins',
    dyn8: 'sign-right',
    homemanage: 'home',
    garage: 'car-garage',
    pingem: 'map-pin',
    calculator: 'calculator',
    documents: 'file-text',
    services: 'clipboard-list',
    chopper: 'tools',
    media: 'photo',
    music: 'music',
};

export function appIcon(app) {
    if (!app) return 'device-mobile';
    if (APP_ICONS[app.name]) return APP_ICONS[app.name];
    const icon = Array.isArray(app.icon) ? app.icon[app.icon.length - 1] : app.icon;
    return icon || 'device-mobile';
}

function hasJob(jobs, workplaces, grades) {
    const mine = data.player?.Jobs;
    if (!jobs || !Array.isArray(mine)) return false;
    return mine.some(
        (j) => jobs[j.Id] && (!workplaces || workplaces[j.Workplace?.Id]) && (!grades || grades[j.Grade?.Id]),
    );
}

function hasJobPermission(key) {
    const perms = data.JobPermissions;
    if (!key || !perms || Array.isArray(perms)) return false;
    return Object.values(perms).some((p) => p && p[key]);
}

function hasPhonePermission(app, perm) {
    const p = data.player?.PhonePermissions;
    return Boolean(p && app && perm && p[app] && p[app][perm]);
}

function hasReputation(rep, value = 0) {
    const reps = data.player?.Reputations;
    return Boolean(reps && reps[rep] !== undefined && reps[rep] >= value);
}

function hasCharState(state) {
    const s = data.player?.States;
    return Array.isArray(s) && s.includes(state);
}

export function canUse(app) {
    if (!app) return false;
    if (phone.limited && app.name !== 'phone') return false;
    const r = app.restricted;
    if (!r) return true;
    return Boolean(
        (r.job && hasJob(r.job, r.workplace, r.grade)) ||
            (r.state && hasCharState(r.state)) ||
            (r.jobPermission && hasJobPermission(r.jobPermission)) ||
            (r.phonePermission && hasPhonePermission(app.name, r.phonePermission)) ||
            (r.reputation && hasReputation(r.reputation, r.reputationAmount || 0)),
    );
}

/** { [name]: AppDef } for every app this character can open right now. */
export function myApps() {
    const out = {};
    for (const [key, app] of Object.entries(phone.apps ?? {})) {
        if (!app) continue;
        const name = app.name ?? key;
        const def = app.name ? app : { ...app, name };
        if (canUse(def)) out[name] = def;
    }
    return out;
}

export function installed() {
    return data.player?.Apps?.installed ?? [];
}
