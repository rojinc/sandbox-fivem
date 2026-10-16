import { io } from 'socket.io-client';
import { fetchNui } from '@sandbox/ui-kit';
import { selectMyCallsign } from './reducer.js';

/**
 * Socket.io client for the sandbox-ws "/mdt-alerts" namespace.
 *
 * Lua hands the url + JWT over ALERTS_WS_CONNECT; the store keeps the
 * connection details and <AlertsEffects> calls connectAlerts(). Every
 * server event becomes a plain action; game side effects (sounds, blips)
 * are requested here with fetchNui, never inside reducers.
 */
let socket = null;
let storeRef = null;

export function bindAlertsStore(store) {
    storeRef = store;
}

export function isAlertsConnected() {
    return Boolean(socket?.connected);
}

export function connectAlerts(url, token) {
    if (!storeRef || !url) return;
    disconnectAlerts();
    const { dispatch, getState } = storeRef;

    socket = io(url, { query: { token }, transports: ['websocket', 'polling'], reconnectionAttempts: 20 });
    const current = socket;

    current.on('connect', () => dispatch({ type: 'ALERTS_WS_STATE', payload: { connected: true } }));
    current.on('disconnect', () => dispatch({ type: 'ALERTS_WS_STATE', payload: { connected: false } }));
    current.on('connect_error', () => dispatch({ type: 'ALERTS_WS_STATE', payload: { connected: false } }));

    current.on('init', (tokenData, alerts, units, myUnit, radioNames, dispatchLog) => {
        dispatch({ type: 'ALERTS_WS_INIT', payload: { alerts, units, myUnit, radioNames, dispatchLog } });
    });

    current.on('alert', (alert) => {
        if (!getState().alerts.socketInitialised) return;
        fetchNui('ReceiveAlert', alert).catch(() => {});
        dispatch({ type: 'ADD_ALERT', payload: { alert } });
    });

    current.on('alertRemove', (id) => {
        fetchNui('RemoveAlert', { id }).catch(() => {});
        dispatch({ type: 'REMOVE_ALERT', payload: { id } });
    });

    current.on('alertUpdateUnits', (id, units) => {
        const state = getState().alerts;
        const me = selectMyCallsign(state);
        const meAttached = Boolean(me && (units ?? []).includes(me));
        const newlyAttached = meAttached && !state.attached.includes(id);
        if (newlyAttached) fetchNui('AssignedToAlert', id).catch(() => {});
        dispatch({ type: 'UPDATE_ALERT_UNITS', payload: { id, units: units ?? [], meAttached: newlyAttached } });
    });

    current.on('unitAdd', (unit) => dispatch({ type: 'ADD_UNIT', payload: { unit } }));
    current.on('unitRemove', (job, source) => dispatch({ type: 'REMOVE_UNIT', payload: { job, source } }));
    current.on('unitUpdateData', (data) => dispatch({ type: 'UPDATE_UNIT_DATA', payload: data }));
    current.on('unitOperateUnder', (job, callsign, primary) => dispatch({ type: 'OPERATE_UNDER_UNIT', payload: { job, callsign, primary } }));
    current.on('unitBreakOff', (job, callsign) => dispatch({ type: 'BREAK_OFF_UNIT', payload: { job, callsign } }));
    current.on('radioInfoUpdate', (data) => dispatch({ type: 'UPDATE_RADIO_INFO', payload: { data } }));
    current.on('dispatchLog', (log) => dispatch({ type: 'ADD_DISPATCH_LOG', payload: { data: log } }));
}

export function disconnectAlerts() {
    if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
        socket = null;
    }
}

/** Emit to the server when connected; silently ignored otherwise. */
export function emitAlerts(event, ...args) {
    if (socket?.connected) {
        socket.emit(event, ...args);
        return true;
    }
    return false;
}

/* ---- typed helpers used by the components ---- */

export const alertsApi = {
    changeUnitType: (job, primary, type) => emitAlerts('changeUnit', job, primary, type),
    toggleAvailability: (job, primary) => emitAlerts('changeAvailability', job, primary),
    operateUnder: (job, primary, unit) => emitAlerts('operateUnderUnit', job, primary, unit),
    breakOff: (job, primary, unit) => emitAlerts('breakOffUnit', job, primary, unit),
    updateAlertUnits: (id, units) => emitAlerts('updateAlertUnits', id, units),
    addRadio: (data) => emitAlerts('addRadioInfo', data),
    updateRadio: (id, data) => emitAlerts('updateRadioInfo', id, data),
    removeRadio: (id, data) => emitAlerts('removeRadioInfo', id, data),
    logMessage: (message) => emitAlerts('logMessage', message),
    changeRadioChannel: (channel) => emitAlerts('changeRadioChannel', channel),

    /** Pursuit mode is reported for the unit I operate under. */
    changePursuitMode(mode) {
        const state = storeRef?.getState().alerts;
        if (!state?.myUnit) return false;
        const me = state.units?.[state.myUnit.job]?.find((u) => u.primary === state.myUnit.primary);
        if (!me) return false;
        return emitAlerts('changePursuitMode', me.job, me.operatingUnder != null ? me.operatingUnder : me.primary, mode);
    },

    /** Client-only alerts are dropped locally; server alerts are removed for everyone. */
    removeAlert(alert) {
        if (!storeRef) return;
        if (alert.client) {
            fetchNui('RemoveAlert', { id: alert.id }).catch(() => {});
            storeRef.dispatch({ type: 'REMOVE_ALERT', payload: { id: alert.id } });
        } else {
            emitAlerts('removeAlert', alert.id);
        }
    },
};
