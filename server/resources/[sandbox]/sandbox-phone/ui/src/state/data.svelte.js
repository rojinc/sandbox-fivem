/**
 * Character data Lua pushes with SET_DATA / ADD_DATA / UPDATE_DATA /
 * REMOVE_DATA / RESET_DATA. The merge rules follow the old reducer exactly:
 * lists match items on `key`, `_id` or `id`; maps are keyed by id.
 */
const initial = () => ({
    player: null,
    onDuty: null,
    contacts: [],
    calls: [],
    emails: [],
    adverts: {},
    myDocuments: [],
    garages: [],
    jobs: [],
    workGroups: [],
    externalJobs: [],
    NamedJobPermissions: {},
    JobPermissions: {},
    JobData: null,
    tracks: {},
    tracks_pd: {},
    bankLoans: null,
});

export const data = $state(initial());

const isList = (v) => Array.isArray(v);
const isMap = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const matches = (item, id, key) =>
    item !== null && typeof item === 'object'
        ? (key && item[key] !== undefined && item[key] == id) || (item._id !== undefined && item._id == id) || (item.id !== undefined && item.id == id)
        : item == id;

export function setData(type, value) {
    if (!type) return;
    data[type] = value;
}

export function addData(type, value, key, first = false) {
    if (!type) return;
    const cur = data[type];
    if (isList(cur)) {
        if (first) cur.unshift(value);
        else cur.push(value);
    } else if (isMap(cur)) {
        if (key !== undefined && key !== null) cur[key] = value;
        else Object.assign(cur, value);
    } else {
        data[type] = [value];
    }
}

export function updateData(type, id, value, key) {
    const cur = data[type];
    if (isList(cur)) {
        cur.forEach((item, i) => {
            if (matches(item, id, key)) cur[i] = { ...item, ...(isMap(value) ? value : {}) };
        });
    } else if (isMap(cur)) {
        if (key !== undefined && key !== null) {
            cur[id] = { ...(isMap(cur[id]) ? cur[id] : {}), [key]: value };
        } else {
            cur[id] = value;
        }
    }
}

export function removeData(type, id, key) {
    const cur = data[type];
    if (isList(cur)) {
        data[type] = cur.filter((item) => !matches(item, id, key));
    } else if (isMap(cur)) {
        delete cur[id];
    }
}

export function resetData() {
    const fresh = initial();
    for (const k of Object.keys(data)) if (!(k in fresh)) delete data[k];
    Object.assign(data, fresh);
}

/** Has the character got this state flag (PHONE_VPN, RACE_DONGLE, ...)? */
export function hasState(state) {
    const states = data.player?.States;
    return Array.isArray(states) ? states.includes(state) : false;
}

export function settings() {
    return data.player?.PhoneSettings ?? {};
}

/** Change one PhoneSettings value locally and save it. */
export function updateSetting(type, val, send) {
    if (data.player) {
        if (!data.player.PhoneSettings) data.player.PhoneSettings = {};
        data.player.PhoneSettings[type] = val;
    }
    send?.('UpdateSetting', { type, val });
}
