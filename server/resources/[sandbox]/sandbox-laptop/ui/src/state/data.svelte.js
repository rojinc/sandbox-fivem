/**
 * Character and job data Lua pushes with SET_DATA / ADD_DATA / UPDATE_DATA /
 * REMOVE_DATA / RESET_DATA. The merge rules follow the old reducer exactly:
 * arrays match objects on `_id`; maps are keyed by id.
 */
const initial = () => ({
    disabledBoostingContracts: [],
});

export const data = $state(initial());

const isList = (v) => Array.isArray(v);
const isMap = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

export function setData(type, value) {
    if (!type) return;
    data[type] = value;
}

export function addData(type, value, key, first = false) {
    if (!type) return;
    const cur = data[type];
    if (cur === null || cur === undefined) {
        data[type] = [value];
    } else if (isList(cur)) {
        if (first) cur.unshift(value);
        else cur.push(value);
    } else if (isMap(cur)) {
        if (key !== undefined && key !== null) cur[key] = value;
        else if (isMap(value)) Object.assign(cur, value);
    }
}

export function updateData(type, id, value, key) {
    const cur = data[type];
    if (isList(cur)) {
        data[type] = cur.map((item) => (isMap(item) && item._id == id ? { ...(isMap(value) ? value : {}) } : item));
    } else if (isMap(cur)) {
        if (key !== undefined && key !== null) cur[id] = { ...(isMap(cur[id]) ? cur[id] : {}), [key]: value };
        else cur[id] = value;
    }
}

export function removeData(type, id, key) {
    const cur = data[type];
    if (isList(cur)) {
        data[type] = cur.filter((item) => (isMap(item) ? (key ? item[key] != id : item._id != id) : item != id));
    } else if (isMap(cur)) {
        delete cur[id];
    }
}

export function resetData() {
    const fresh = initial();
    for (const k of Object.keys(data)) if (!(k in fresh)) delete data[k];
    Object.assign(data, fresh);
}

/** Lua sends an empty table as []; treat that as an empty map. */
export function asMap(v) {
    return isMap(v) ? v : {};
}

export function asList(v) {
    if (isList(v)) return v.filter((x) => x !== null && x !== undefined);
    if (isMap(v)) return Object.values(v).filter((x) => x !== null && x !== undefined);
    return [];
}

export function settings() {
    return asMap(data.player?.LaptopSettings);
}

/** Change one LaptopSettings value locally and save it. */
export function saveSetting(type, val, send) {
    if (data.player) {
        if (!isMap(data.player.LaptopSettings)) data.player.LaptopSettings = {};
        data.player.LaptopSettings[type] = val;
    }
    send?.('UpdateSetting', { type, val });
}
