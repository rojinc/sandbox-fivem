/**
 * Terminal shell state: visibility, the signed-in character, their government
 * job and permissions (client/client.lua, client/component.lua), plus the
 * current page. Pages are plain ids; `params` carries the record id or mode.
 */
const initial = () => ({
    visible: false,
    user: null, // character document from SET_USER
    job: null, // { Id, Name, Workplace: { Id, Name }, Grade: { Id, Name, Level } }
    permissions: {}, // { PERMISSION: true }
    attorney: false,
    points: { reduction: 50, license: 20 },
    page: 'dashboard',
    params: {},
    history: [], // previous { page, params } for back links
});

export const app = $state(initial());

export function setUser(user) {
    app.user = { ...(app.user ?? {}), ...(user ?? {}) };
}

export function jobLogin(d = {}) {
    if (d.points) app.points = d.points;
    app.job = d.job ?? null;
    app.permissions = d.jobPermissions ?? {};
    app.attorney = Boolean(d.attorney);
    go('dashboard', {}, { replace: true });
}

export function jobUpdate(d = {}) {
    if (d.points) app.points = d.points;
    if (d.job) app.job = d.job;
    if (d.jobPermissions) app.permissions = d.jobPermissions;
}

export function jobLogout() {
    app.job = null;
    app.permissions = {};
    app.attorney = false;
    go('dashboard', {}, { replace: true });
}

export function logout() {
    const fresh = initial();
    for (const key of Object.keys(fresh)) app[key] = fresh[key];
}

/** Open a page. Records push the current page so "Back" returns to the list with its results. */
export function go(page, params = {}, { replace = false } = {}) {
    if (!replace && (app.page !== page || JSON.stringify(app.params) !== JSON.stringify(params))) {
        app.history = [...app.history.slice(-19), { page: app.page, params: app.params }];
    }
    if (replace) app.history = [];
    app.page = page;
    app.params = params;
}

export function back(fallback = 'dashboard') {
    const prev = app.history.at(-1);
    if (prev) {
        app.history = app.history.slice(0, -1);
        app.page = prev.page;
        app.params = prev.params;
    } else {
        app.page = fallback;
        app.params = {};
    }
}

/** hasPerm('X') checks the job permission (system admins pass); hasPerm(true) = system admin only. */
export function hasPerm(permission, allowSysAdmin = true) {
    if (!permission) return true;
    const sysAdmin = Boolean(app.user?.MDTSystemAdmin);
    if (permission === true) return sysAdmin;
    if (Array.isArray(permission)) return permission.some((p) => hasPerm(p, allowSysAdmin));
    return Boolean(app.permissions?.[permission]) || (allowSysAdmin && sysAdmin);
}

export function hasJob(job, workplace = null) {
    return Boolean(job && app.job?.Id === job && (!workplace || app.job?.Workplace?.Id === workplace));
}
