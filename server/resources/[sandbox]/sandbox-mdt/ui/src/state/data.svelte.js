/**
 * Generic key/value store fed by MDT.Data:Set/Add/Update/Remove/Reset
 * (client/component.lua). Keys the server sends: charges, governmentJobs,
 * governmentJobsData, permissions, qualifications, bolos, homeLastFetch,
 * prison, route. GetHomeData fills warrants, notices and govWorkers.
 */
const initial = () => ({
    charges: [],
    warrants: [],
    notices: [],
    govWorkers: [],
    bolos: [],
    homeLastFetch: 0,
    permissions: {},
    qualifications: {},
    governmentJobs: ['government', 'police', 'ems', 'prison'],
    governmentJobsData: {},
    prison: false,
    route: null,
});

export const store = $state(initial());

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/** Lua tables with numeric keys can arrive as objects; most keys are lists. */
export const asList = (v) => (Array.isArray(v) ? v : isObject(v) ? Object.values(v) : []).filter((x) => x !== null && x !== undefined);

export function setData(type, data) {
    if (!type) return;
    store[type] = data;
}

export function addData(type, data, key) {
    if (!type) return;
    const current = store[type];
    if (current == null) store[type] = key != null ? { [key]: data } : [data];
    else if (Array.isArray(current)) store[type] = [...current, data];
    else if (key != null) store[type] = { ...current, [key]: data };
    else store[type] = { ...current, ...(isObject(data) ? data : {}) };
}

export function updateData(type, id, data) {
    const current = store[type];
    if (Array.isArray(current)) store[type] = current.map((item) => (item?.id == id ? { ...data } : item));
    else if (isObject(current)) store[type] = { ...current, [id]: data };
}

export function removeData(type, id) {
    const current = store[type];
    if (Array.isArray(current)) store[type] = current.filter((item) => (isObject(item) ? item.id != id : item != id));
    else if (isObject(current)) store[type] = Object.fromEntries(Object.entries(current).filter(([k]) => k != id));
}

export function resetData() {
    const fresh = initial();
    for (const key of Object.keys(store)) if (!(key in fresh)) delete store[key];
    for (const key of Object.keys(fresh)) store[key] = fresh[key];
}
