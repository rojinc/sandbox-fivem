/**
 * Which role the terminal serves and what it may open. Ported from the old
 * Jobs/links.js route tables.
 */
import { app, hasPerm } from '../state/app.svelte.js';
import { store } from '../state/data.svelte.js';

export function resolveRole() {
    const job = app.job;
    if (store.prison) return 'public-prison';
    switch (job?.Id) {
        case 'police':
            return 'police';
        case 'government':
            switch (job?.Workplace?.Id) {
                case 'doj':
                    return 'doj';
                case 'dattorney':
                    return 'da';
                case 'publicdefenders':
                    return 'publicdefenders';
                default:
                    return 'government';
            }
        case 'prison':
            return 'doc';
        case 'ems':
            return 'ems';
        default:
            return app.attorney ? 'attorney' : 'public';
    }
}

const PAGES = {
    police: ['dashboard', 'people', 'vehicles', 'properties', 'firearms', 'warrants', 'bolos', 'reports', 'charges', 'roster', 'library', 'admin'],
    doj: ['dashboard', 'people', 'vehicles', 'properties', 'firearms', 'warrants', 'reports', 'charges', 'roster', 'library', 'admin'],
    da: ['dashboard', 'people', 'vehicles', 'properties', 'firearms', 'warrants', 'reports', 'charges', 'roster', 'library', 'admin'],
    publicdefenders: ['dashboard', 'people', 'vehicles', 'properties', 'firearms', 'warrants', 'reports', 'charges', 'library'],
    government: ['dashboard', 'warrants', 'charges', 'library'],
    ems: ['dashboard', 'people', 'vehicles', 'reports', 'roster', 'library', 'admin'],
    doc: ['dashboard', 'people', 'vehicles', 'reports', 'inmates', 'charges', 'roster', 'library', 'admin'],
    attorney: ['dashboard', 'people', 'warrants', 'reports', 'charges', 'library'],
    public: ['dashboard', 'warrants', 'charges', 'library'],
    'public-prison': ['visitation'],
};

const LABELS = {
    dashboard: 'Dashboard',
    people: 'People',
    vehicles: 'Vehicles',
    properties: 'Properties',
    firearms: 'Firearms',
    warrants: 'Warrants',
    bolos: 'BOLOs',
    reports: 'Reports',
    charges: 'Charges',
    roster: 'Roster',
    library: 'Library',
    inmates: 'Inmates',
    admin: 'Admin',
    visitation: 'Visitation',
};

/** High-command permission that opens the permission manager, per role. */
export const adminPermissionFor = { police: 'PD_HIGH_COMMAND', doj: 'DOJ_JUDGE', da: 'GOV_DA', ems: 'SAFD_HIGH_COMMAND', doc: 'DOC_HIGH_COMMAND' };
export const permissionJobFor = { police: 'police', doj: 'government', da: 'government', ems: 'ems', doc: 'prison' };
export const fleetJobFor = { police: 'police', ems: 'ems', doc: 'prison' };
export const rosterJobFor = { police: 'police', doj: 'government', da: 'government', ems: 'ems', doc: 'prison', attorney: 'government' };

export function adminSections(role = resolveRole()) {
    const out = [];
    if (adminPermissionFor[role] && hasPerm(adminPermissionFor[role])) out.push('permissions');
    if (fleetJobFor[role] && hasPerm('FLEET_MANAGEMENT')) out.push('fleet');
    if (hasPerm(true)) out.push('system');
    return out;
}

export function pagesFor(role = resolveRole()) {
    return (PAGES[role] ?? PAGES.public).filter((p) => p !== 'admin' || adminSections(role).length > 0);
}

export function navItems(role = resolveRole()) {
    return pagesFor(role).map((id) => ({ id, label: LABELS[id] }));
}

/** Pages that belong to a nav section (records open under their list). */
export const SECTION_OF = {
    person: 'people',
    vehicle: 'vehicles',
    report: 'reports',
    'report-edit': 'reports',
    warrant: 'warrants',
    firearm: 'firearms',
    'bolo-new': 'bolos',
    'notice-new': 'dashboard',
};

const SHORT = {
    lspd: 'LSPD',
    bcso: 'BCSO',
    sast: 'SAST',
    sasp: 'SASP',
    guardius: 'Guardius',
    safd: 'EMS',
    doctors: 'EMS',
    corrections: 'DOC',
    doj: 'DOJ',
    dattorney: 'DA',
    publicdefenders: 'OPD',
    mayoroffice: 'Mayor',
};

const JOB_SHORT = { police: 'Police', ems: 'EMS', prison: 'DOC', government: 'Government' };

/** The acronym in the header eyebrow: the department, as written. */
export function departmentShort() {
    const role = resolveRole();
    if (role === 'public-prison') return 'DOC';
    const wp = app.job?.Workplace?.Id;
    if (wp && SHORT[wp]) return SHORT[wp];
    if (app.job?.Id && JOB_SHORT[app.job.Id]) return JOB_SHORT[app.job.Id];
    return app.attorney ? 'DOJ' : 'San Andreas';
}

export function departmentName() {
    const role = resolveRole();
    if (role === 'public-prison') return 'San Andreas Department of Corrections';
    if (app.job?.Workplace?.Name) return app.job.Workplace.Name;
    if (app.job?.Name) return app.job.Name;
    return app.attorney ? 'San Andreas Department of Justice' : 'State of San Andreas';
}

export function terminalTitle() {
    switch (resolveRole()) {
        case 'police':
        case 'ems':
        case 'doc':
            return 'Mobile data terminal';
        case 'public-prison':
            return 'Inmate visitation';
        case 'public':
        case 'government':
            return 'Public records';
        default:
            return 'Electronic records system';
    }
}

/** "Callsign 1-A-12, Sergeant Jordan Reyes" */
export function signedInLine() {
    const u = app.user;
    if (!u) return '';
    const name = [app.job?.Grade?.Name, u.First, u.Last].filter(Boolean).join(' ');
    return u.Callsign && app.job ? `Callsign ${u.Callsign}, ${name}` : name;
}
