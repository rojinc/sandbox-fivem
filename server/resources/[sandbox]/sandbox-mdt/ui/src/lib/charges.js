/** Charge maths, unchanged from the old terminal (jail months are not multiplied by count). */
import { store } from '../state/data.svelte.js';
import { list } from './api.js';
import { ParoleMultiplier } from './data.js';

/** [{ id, count }] -> the charge definitions with counts, dropping unknown ids. */
export function resolveCharges(selected) {
    const defs = list(store.charges);
    return list(selected)
        .map((c) => {
            const def = defs.find((d) => d.id == c.id);
            return def ? { ...def, id: c.id, count: Number(c.count) || 1 } : null;
        })
        .filter(Boolean);
}

export function chargeTotals(resolved) {
    const months = resolved.reduce((a, c) => a + (Number(c.jail) || 0), 0);
    const fine = resolved.reduce((a, c) => a + (Number(c.fine) || 0) * c.count, 0);
    const points = resolved.reduce((a, c) => a + (Number(c.points) || 0) * c.count, 0);
    const felony = resolved.some((c) => Number(c.type) > 2);
    const infraction = !resolved.some((c) => Number(c.type) > 1);
    return { months, fine, points, felony, infraction };
}

/** Sentence after a reduction (percent) and any parole time carried over. */
export function sentenceFor(totals, { type = '', value = 0 } = {}, paroleCarry = 0) {
    const pct = Math.min(100, Math.max(0, Number(value) || 0)) / 100;
    const jail = Math.ceil(paroleCarry + (type === 'months' ? totals.months * (1 - pct) : totals.months));
    const fine = Math.ceil(type === 'fine' ? totals.fine * (1 - pct) : totals.fine);
    return { jail, fine, points: totals.points, parole: Math.ceil(jail * ParoleMultiplier) };
}

export const sortCharges = (arr) => [...arr].sort((a, b) => a.type - b.type || (a.jail ?? 0) - (b.jail ?? 0) || (a.fine ?? 0) - (b.fine ?? 0) || String(a.title).localeCompare(String(b.title)));

/** Merge repeated convictions into one row per charge. */
export function mergeConvictions(convictions) {
    const out = [];
    for (const c of list(convictions)) {
        const i = out.findIndex((x) => x.id == c.id);
        if (i >= 0) out[i] = { ...out[i], count: out[i].count + (Number(c.count) || 1) };
        else out.push({ ...c, count: Number(c.count) || 1 });
    }
    return resolveCharges(out);
}
