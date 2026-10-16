/**
 * Emergency alerts / dispatch state.
 *
 * Lua messages (client/alerts/*.lua): SET_SHOWING, ADD_ALERT, ALERTS_WS_CONNECT,
 * ALERTS_WS_DISCONNECT, ALERTS_UPDATE_PURSUIT_MODE, ALERTS_UPDATE_RADIO_CHANNEL.
 * Socket-driven actions (features/alerts/socket.js): ALERTS_WS_STATE,
 * ALERTS_WS_INIT, ADD_UNIT, REMOVE_UNIT, UPDATE_UNIT_DATA, OPERATE_UNDER_UNIT,
 * BREAK_OFF_UNIT, UPDATE_ALERT_UNITS, UPDATE_RADIO_INFO, ADD_DISPATCH_LOG,
 * REMOVE_ALERT. UI-only: TOGGLE_ROSTER_SECTION, TOGGLE_DISPATCH_LOG, RESET_ALERTS.
 *
 * No side effects live here: sounds/blips are requested from components and
 * from the socket handler.
 */
export const initialState = {
    showing: false,
    connection: null, // { url, token } from ALERTS_WS_CONNECT
    socketConnected: false,
    socketInitialised: false,
    alerts: [],
    units: { police: [], ems: [], prison: [], tow: [] },
    myUnit: null,
    radioNames: [],
    dispatchLog: [],
    dispatchExpanded: true,
    rosterSections: { police: true, ems: true, prison: true, tow: true },
    attached: [], // alert ids my unit has been attached to (for the accept sound)
};

const ALERT_TTL = 60000 * 30;

export default function alertsReducer(state = initialState, action) {
    const p = action.payload ?? {};
    switch (action.type) {
        case 'SET_SHOWING':
            return { ...state, showing: Boolean(p.state) };

        case 'ALERTS_WS_CONNECT':
            return { ...state, connection: { url: p.url, token: p.token } };

        case 'ALERTS_WS_DISCONNECT':
            return { ...initialState, showing: state.showing };

        case 'ALERTS_WS_STATE':
            return { ...state, socketConnected: Boolean(p.connected) };

        case 'ALERTS_WS_INIT':
            return {
                ...state,
                socketInitialised: true,
                socketConnected: true,
                units: { ...initialState.units, ...(p.units ?? {}) },
                alerts: (p.alerts ?? []).map((a) => ({ ...a, attached: a.attached ?? [], onScreen: false })),
                myUnit: p.myUnit ?? null,
                radioNames: p.radioNames ?? [],
                dispatchLog: p.dispatchLog ?? [],
                rosterSections: {
                    police: false,
                    ems: false,
                    prison: false,
                    tow: false,
                    ...(p.myUnit?.job ? { [p.myUnit.job]: true } : {}),
                },
            };

        case 'RESET_ALERTS':
            return { ...state, alerts: [] };

        case 'TOGGLE_DISPATCH_LOG':
            return { ...state, dispatchExpanded: !state.dispatchExpanded };

        case 'TOGGLE_ROSTER_SECTION':
            return {
                ...state,
                rosterSections: { ...state.rosterSections, [p.type]: !state.rosterSections[p.type] },
            };

        case 'ADD_ALERT': {
            if (!p.alert) return state;
            const now = Date.now();
            return {
                ...state,
                alerts: [
                    ...state.alerts.filter(
                        (a) => a.id !== p.alert.id && (a.time >= now - ALERT_TTL || (a.attached ?? []).length > 0),
                    ),
                    { ...p.alert, attached: p.alert.attached ?? [], onScreen: true, time: now },
                ],
            };
        }

        case 'REMOVE_ALERT':
            return { ...state, alerts: state.alerts.filter((a) => a.id !== p.id) };

        case 'UPDATE_ALERT_UNITS': {
            if (!p.id) return state;
            return {
                ...state,
                alerts: state.alerts.map((a) => (a.id === p.id ? { ...a, attached: p.units ?? [] } : a)),
                attached: p.meAttached && !state.attached.includes(p.id) ? [...state.attached, p.id] : state.attached,
            };
        }

        case 'ADD_UNIT': {
            const unit = p.unit;
            if (!unit?.job) return state;
            const list = state.units[unit.job] ?? [];
            return {
                ...state,
                units: { ...state.units, [unit.job]: [...list.filter((u) => u.source !== unit.source), unit] },
            };
        }

        case 'REMOVE_UNIT': {
            const list = state.units[p.job];
            if (!list) return state;
            return { ...state, units: { ...state.units, [p.job]: list.filter((u) => u.source !== p.source) } };
        }

        case 'UPDATE_UNIT_DATA': {
            const list = state.units[p.job];
            if (!list) return state;
            return {
                ...state,
                units: {
                    ...state.units,
                    [p.job]: list.map((u) => (u.primary == p.primary ? { ...u, [p.key]: p.value } : u)),
                },
            };
        }

        case 'OPERATE_UNDER_UNIT': {
            const list = state.units[p.job];
            if (!list) return state;
            return {
                ...state,
                units: {
                    ...state.units,
                    [p.job]: list.map((u) => (u.primary == p.callsign ? { ...u, operatingUnder: p.primary } : u)),
                },
            };
        }

        case 'BREAK_OFF_UNIT': {
            const list = state.units[p.job];
            if (!list) return state;
            return {
                ...state,
                units: {
                    ...state.units,
                    [p.job]: list.map((u) => (u.primary == p.callsign ? { ...u, operatingUnder: null } : u)),
                },
            };
        }

        case 'UPDATE_RADIO_INFO':
            return { ...state, radioNames: p.data ?? [] };

        case 'ADD_DISPATCH_LOG': {
            const log = [...state.dispatchLog];
            if (log.length > 200) log.shift();
            return { ...state, dispatchLog: [...log, p.data] };
        }

        case 'LOGOUT':
            return initialState;

        default:
            return state;
    }
}

/* ---------------- selectors ---------------- */

export const selectMyUnitData = (alerts) =>
    alerts.units?.[alerts.myUnit?.job]?.find((u) => u.primary === alerts.myUnit?.primary) ?? null;

export const selectMyCallsign = (alerts) => {
    const me = selectMyUnitData(alerts);
    if (!me) return null;
    return me.operatingUnder != null ? me.operatingUnder : me.primary;
};

export const selectAllUnits = (units) => Object.values(units ?? {}).flat();
