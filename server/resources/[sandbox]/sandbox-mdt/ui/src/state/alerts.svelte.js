/**
 * Emergency alerts panel (client/alerts/*.lua) and the dispatch socket state
 * (sandbox-ws namespace /mdt-alerts, see lib/alerts.js).
 */
const ALERT_TTL = 30 * 60 * 1000;

const initial = () => ({
    showing: false,
    status: 'idle', // idle | connecting | connected | offline
    initialised: false,
    alerts: [], // newest last, as the server sends them
    units: { police: [], ems: [], prison: [], tow: [] },
    myUnit: null, // { job, primary }
    radioNames: [],
    dispatchLog: [],
    attached: [], // alert ids my unit has been attached to (plays the accept sound once)
    selected: null, // alert id expanded in the panel
});

export const alerts = $state(initial());

export function resetAlerts({ keepShowing = true } = {}) {
    const showing = alerts.showing;
    const fresh = initial();
    for (const key of Object.keys(fresh)) alerts[key] = fresh[key];
    if (keepShowing) alerts.showing = showing;
}

export function initFromSocket({ alerts: list, units, myUnit, radioNames, dispatchLog }) {
    alerts.initialised = true;
    alerts.status = 'connected';
    alerts.units = { police: [], ems: [], prison: [], tow: [], ...(units ?? {}) };
    alerts.alerts = (Array.isArray(list) ? list : []).map((a) => ({ ...a, attached: a.attached ?? [] }));
    alerts.myUnit = myUnit ?? null;
    alerts.radioNames = Array.isArray(radioNames) ? radioNames : [];
    alerts.dispatchLog = Array.isArray(dispatchLog) ? dispatchLog : [];
}

export function addAlert(alert) {
    if (!alert?.id) return;
    const now = Date.now();
    alerts.alerts = [
        ...alerts.alerts.filter((a) => a.id !== alert.id && ((a.time ?? now) >= now - ALERT_TTL || (a.attached ?? []).length > 0)),
        { ...alert, attached: alert.attached ?? [], time: alert.time ?? now },
    ];
    // A panic opens itself so "Set route" is one click away.
    if (alert.panic) alerts.selected = alert.id;
}

export function removeAlert(id) {
    alerts.alerts = alerts.alerts.filter((a) => a.id !== id);
    if (alerts.selected === id) alerts.selected = null;
}

export function setAlertUnits(id, units) {
    const a = alerts.alerts.find((x) => x.id === id);
    if (a) a.attached = Array.isArray(units) ? units : [];
}

export function unitList(job) {
    return alerts.units?.[job] ?? [];
}

export function myUnitData() {
    const mu = alerts.myUnit;
    if (!mu) return null;
    return unitList(mu.job).find((u) => u.primary == mu.primary) ?? mu;
}

/** The callsign my unit answers to: the unit I operate under, or my own. */
export function myCallsign() {
    const me = myUnitData();
    if (!me) return null;
    return me.operatingUnder != null ? me.operatingUnder : me.primary;
}

export function upsertUnit(unit) {
    if (!unit?.job) return;
    const list = unitList(unit.job).filter((u) => u.source !== unit.source);
    alerts.units = { ...alerts.units, [unit.job]: [...list, unit] };
}

export function dropUnit(job, source) {
    alerts.units = { ...alerts.units, [job]: unitList(job).filter((u) => u.source !== source) };
}

export function patchUnit(job, primary, patch) {
    alerts.units = { ...alerts.units, [job]: unitList(job).map((u) => (u.primary == primary ? { ...u, ...patch } : u)) };
}

export function pushLog(entry) {
    if (!entry) return;
    alerts.dispatchLog = [...alerts.dispatchLog.slice(-199), entry];
}
