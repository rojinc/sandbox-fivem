/**
 * Which role the terminal shows and the navigation for it. Ported from the
 * old Jobs/links.js + Jobs/*.jsx route tables.
 */

export function resolveRole({ govJob, attorney, prison }) {
    if (prison) return 'public-prison';
    switch (govJob?.Id) {
        case 'police':
            return 'police';
        case 'government':
            switch (govJob?.Workplace?.Id) {
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
            return attorney ? 'attorney' : 'public';
    }
}

const home = { label: 'Home', icon: 'house', path: '/' };
const roster = (icon = 'user-tie') => ({ label: 'Roster', icon, path: '/roster' });
const reports = { label: 'Reports', icon: 'file-lines', path: '/reports' };
const warrants = { label: 'Warrants', icon: 'file-contract', path: '/warrants' };
const people = { label: 'People', icon: 'user', path: '/people' };
const vehicles = { label: 'Vehicles', icon: 'car', path: '/vehicles' };
const properties = { label: 'Properties', icon: 'house-chimney', path: '/properties' };
const firearms = { label: 'Firearms', icon: 'gun', path: '/firearms' };
const penal = { label: 'Penal Code', icon: 'gavel', path: '/penal-code' };
const library = { label: 'Document Library', icon: 'book', path: '/library' };
const fleet = { label: 'Fleet', icon: 'truck', path: '/fleet-manager', permission: 'FLEET_MANAGEMENT' };
const prisoners = { label: 'Inmate Management', icon: 'handcuffs', path: '/prisoners' };
const permissions = (permission) => ({ label: 'Permissions', icon: 'crown', path: '/admin/permissions', permission });

const systemAdmin = [
    { section: 'System' },
    { label: 'Permissions', icon: 'terminal', path: '/system/gov-permissions', permission: true },
    { label: 'Full Roster', icon: 'terminal', path: '/system/gov-roster', permission: true },
    { label: 'Charges', icon: 'terminal', path: '/system/charges', permission: true },
];

const NAV = {
    police: [home, roster('user-shield'), reports, warrants, people, vehicles, properties, firearms, penal, library, fleet, permissions('PD_HIGH_COMMAND'), ...systemAdmin],
    doj: [home, roster(), reports, warrants, people, vehicles, properties, firearms, penal, library, permissions('DOJ_JUDGE'), ...systemAdmin],
    da: [home, roster(), reports, warrants, people, vehicles, properties, firearms, penal, library, permissions('GOV_DA'), ...systemAdmin],
    publicdefenders: [home, reports, warrants, people, vehicles, properties, firearms, penal, library],
    government: [home, warrants, penal, library],
    ems: [home, roster('user-doctor'), reports, people, vehicles, fleet, library, permissions('SAFD_HIGH_COMMAND'), ...systemAdmin],
    doc: [home, roster(), reports, prisoners, people, vehicles, fleet, penal, library, permissions('DOC_HIGH_COMMAND'), ...systemAdmin],
    attorney: [home, reports, warrants, people, penal, library],
    public: [home, warrants, penal, library],
    'public-prison': [home],
};

export const navForRole = (role) => NAV[role] ?? NAV.public;

/** Pages (route ids) each role can open. */
const PAGES = {
    police: ['home', 'roster', 'reports', 'warrants', 'people', 'vehicles', 'properties', 'firearms', 'penal-code', 'library', 'fleet-manager', 'create-bolo', 'create-notice', 'admin-permissions', 'system'],
    doj: ['home', 'roster', 'reports', 'warrants', 'people', 'vehicles', 'properties', 'firearms', 'penal-code', 'library', 'create-notice', 'admin-permissions', 'system'],
    da: ['home', 'roster', 'reports', 'warrants', 'people', 'vehicles', 'properties', 'firearms', 'penal-code', 'library', 'create-notice', 'admin-permissions', 'system'],
    publicdefenders: ['home', 'reports', 'warrants', 'people', 'vehicles', 'properties', 'firearms', 'penal-code', 'library', 'create-notice'],
    government: ['home', 'warrants', 'penal-code', 'library'],
    ems: ['home', 'roster', 'reports', 'people', 'vehicles', 'fleet-manager', 'library', 'create-notice', 'admin-permissions', 'system'],
    doc: ['home', 'roster', 'reports', 'prisoners', 'people', 'vehicles', 'fleet-manager', 'penal-code', 'library', 'create-notice', 'admin-permissions', 'system'],
    attorney: ['home', 'reports', 'warrants', 'people', 'vehicles', 'properties', 'firearms', 'penal-code', 'library', 'roster'],
    public: ['home', 'warrants', 'penal-code', 'library'],
    'public-prison': ['home'],
};

export const pagesForRole = (role) => new Set(PAGES[role] ?? PAGES.public);

export const adminPermissionFor = {
    police: 'PD_HIGH_COMMAND',
    doj: 'DOJ_JUDGE',
    da: 'GOV_DA',
    ems: 'SAFD_HIGH_COMMAND',
    doc: 'DOC_HIGH_COMMAND',
};

export const permissionJobFor = {
    police: 'police',
    doj: 'government',
    da: 'government',
    ems: 'ems',
    doc: 'prison',
};

export const fleetJobFor = { police: 'police', ems: 'ems', doc: 'prison' };

export function branding(govJob, attorney) {
    if (attorney && !govJob) return { primary: 'Electronic Records System', secondary: 'San Andreas Department of Justice' };
    switch (govJob?.Id) {
        case 'police':
            return { primary: govJob?.Workplace?.Name ?? 'Police', secondary: 'Electronic Records System' };
        case 'prison':
            return { primary: 'San Andreas Department of Corrections', secondary: 'Electronic Records System' };
        case 'government':
            if (govJob?.Workplace?.Id === 'doj') return { primary: 'San Andreas Department of Justice', secondary: 'Electronic Records System' };
            return { primary: 'State of San Andreas', secondary: 'Public Records Repository' };
        case 'ems':
            return { primary: 'State of San Andreas Medical Services', secondary: 'Electronic Records System' };
        default:
            return { primary: 'State of San Andreas', secondary: 'Public Records Repository' };
    }
}

/** Human title of a path, for the top bar. */
export function pageTitle(pathname, role) {
    const all = [...navForRole(role)].filter((l) => l.path);
    const hit = all.find((l) => l.path === pathname);
    if (hit) return hit.path === '/' ? (role === 'public-prison' ? 'Inmate Visitation' : 'Dashboard') : hit.label;
    if (pathname.startsWith('/create/bolo')) return 'New BOLO';
    if (pathname.startsWith('/create/notice')) return 'New Notice';
    return 'Records';
}
