/**
 * Permission checks the old hooks did (useMyStates, useMyJob,
 * useJobPermissions, usePermissions, useReputation, useMyApps), as plain
 * functions over the data store.
 */
import { data, asMap, asList } from '../state/data.svelte.js';

export function hasState(state) {
    const states = asList(data.player?.States);
    return Boolean(state) && states.includes(state);
}

function hasStates(checking) {
    if (Array.isArray(checking)) return checking.every((s) => hasState(s));
    if (checking && typeof checking === 'object') return Object.values(checking).every((s) => hasState(s));
    return hasState(checking);
}

/** jobs / workplaces / grades are maps of ids, as in the old useMyJob. */
export function hasJob(jobs, workplaces = null, grades = null) {
    const mine = asList(data.player?.Jobs);
    if (!jobs) return false;
    const j = typeof jobs === 'string' ? { [jobs]: true } : asMap(jobs);
    return mine.some((job) => {
        if (!j[job.Id]) return false;
        if (workplaces && !asMap(workplaces)[job.Workplace?.Id]) return false;
        if (grades && !asMap(grades)[job.Grade?.Id]) return false;
        return true;
    });
}

/** A job permission for the job the player is on duty for (BizWiz pages). */
export function hasJobPerm(permission, job = data.onDuty) {
    if (!permission) return true;
    const perms = asMap(data.JobPermissions);
    if (job) return Boolean(asMap(perms[job])[permission]);
    return Object.values(perms).some((p) => Boolean(asMap(p)[permission]));
}

export function hasLaptopPerm(app, permission) {
    if (!app || !permission) return false;
    return Boolean(asMap(asMap(data.player?.LaptopPermissions)[app])[permission]);
}

export function hasRep(rep, value = 0) {
    const reps = asMap(data.player?.Reputations);
    return Boolean(rep) && reps[rep] !== undefined && Number(reps[rep]) >= value;
}

/** The old useMyApps: an app with `restricted` needs every listed check to pass. */
export function canUseApp(app) {
    if (!app) return false;
    const r = app.restricted;
    if (!r || typeof r !== 'object' || Array.isArray(r)) return true;
    return Object.keys(r).every((type) => {
        switch (type) {
            case 'job':
                return hasJob(r.job);
            case 'state':
                return hasStates(r.state);
            case 'jobPermission':
                return hasJobPerm(r.jobPermission, false);
            case 'laptopPermission':
                return hasLaptopPerm(app.name, r.laptopPermission);
            case 'reputation':
                return hasRep(r.reputation, r.reputationAmount || 0);
            case 'reputationAmount':
                return true;
            default:
                return false;
        }
    });
}
