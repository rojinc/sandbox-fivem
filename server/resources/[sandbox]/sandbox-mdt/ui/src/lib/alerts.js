/**
 * Dispatch socket wiring: server events from sandbox-ws/namespaces/mdtAlerts.js
 * become alerts-state changes; game side effects (sounds, blips, waypoints) go
 * to Lua through the alert callbacks in client/alerts/nui.lua.
 */
import { fetchNui } from '@sandbox/ui-kit/nui';
import { createSocket } from './socket.js';
import {
    alerts,
    initFromSocket,
    addAlert,
    removeAlert,
    setAlertUnits,
    upsertUnit,
    dropUnit,
    patchUnit,
    pushLog,
    resetAlerts,
    myCallsign,
    myUnitData,
} from '../state/alerts.svelte.js';

let socket = null;

const quiet = (p) => Promise.resolve(p).catch(() => {});

export function connectAlerts(url, token) {
    disconnectAlerts({ reset: false });
    if (!url) return;
    let s;
    try {
        s = createSocket(url, { token, onStatus: (st) => (alerts.status = st) });
    } catch (err) {
        console.error('[mdt-alerts] bad socket url', url, err);
        alerts.status = 'offline';
        return;
    }
    socket = s;

    s.on('init', (tokenData, list, units, myUnit, radioNames, dispatchLog) => {
        initFromSocket({ alerts: list, units, myUnit, radioNames, dispatchLog });
    });
    s.on('alert', (alert) => {
        if (!alerts.initialised || !alert) return;
        quiet(fetchNui('ReceiveAlert', alert));
        addAlert(alert);
    });
    s.on('alertRemove', (id) => {
        quiet(fetchNui('RemoveAlert', { id }));
        removeAlert(id);
    });
    s.on('alertUpdateUnits', (id, units) => {
        const me = myCallsign();
        const list = Array.isArray(units) ? units : [];
        if (me && list.includes(me) && !alerts.attached.includes(id)) {
            alerts.attached = [...alerts.attached, id];
            quiet(fetchNui('AssignedToAlert', id));
        }
        setAlertUnits(id, list);
    });
    s.on('unitAdd', (unit) => upsertUnit(unit));
    s.on('unitRemove', (job, source) => dropUnit(job, source));
    s.on('unitUpdateData', (d) => d && patchUnit(d.job, d.primary, { [d.key]: d.value }));
    s.on('unitOperateUnder', (job, callsign, primary) => patchUnit(job, callsign, { operatingUnder: primary }));
    s.on('unitBreakOff', (job, callsign) => patchUnit(job, callsign, { operatingUnder: null }));
    s.on('radioInfoUpdate', (list) => (alerts.radioNames = Array.isArray(list) ? list : []));
    s.on('dispatchLog', (entry) => pushLog(entry));
    s.on('connect_error', (err) => console.warn('[mdt-alerts] refused', err?.message ?? err));
}

export function disconnectAlerts({ reset = true } = {}) {
    if (socket) {
        socket.close();
        socket = null;
    }
    if (reset) resetAlerts();
}

const emit = (event, ...args) => Boolean(socket?.emit(event, ...args));

/* ------------------------------------------------------------ actions */

export function toggleAvailability() {
    const me = myUnitData();
    if (!me) return false;
    return emit('changeAvailability', me.job, me.primary);
}

export function changeUnitType(type) {
    const me = myUnitData();
    if (!me) return false;
    return emit('changeUnit', me.job, me.primary, type);
}

export function changePursuitMode(mode) {
    const me = myUnitData();
    if (!me) return false;
    return emit('changePursuitMode', me.job, me.operatingUnder != null ? me.operatingUnder : me.primary, mode);
}

export function changeRadioChannel(channel) {
    return emit('changeRadioChannel', channel);
}

/** Attach or detach my unit (the unit I operate under, if any). */
export function toggleAttached(alert) {
    const me = myCallsign();
    if (!me || !alert || alert.client) return false;
    const current = alert.attached ?? [];
    const next = current.includes(me) ? current.filter((c) => c !== me) : [...current, me];
    return emit('updateAlertUnits', alert.id, next);
}

/** Client-only alerts (ADD_ALERT) are dropped here; socket alerts are removed for everyone. */
export function dismissAlert(alert) {
    if (!alert) return;
    if (alert.client || !socket?.connected) {
        quiet(fetchNui('RemoveAlert', { id: alert.id }));
        removeAlert(alert.id);
        return;
    }
    emit('removeAlert', alert.id);
}

export function routeToAlert(alert) {
    return fetchNui('RouteAlert', alert);
}

export function viewCamera(alert) {
    return fetchNui('ViewCamera', alert);
}

export function swapToRadio(radio) {
    return fetchNui('SwapToRadio', { radio: String(radio) });
}
