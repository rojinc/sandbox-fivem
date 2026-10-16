/**
 * Laptop notifications (NOTIF_*) and short feedback messages inside the
 * laptop after an action ("Team created").
 */
export const notify = $state({
    list: [], // { _id, title, description, duration, app, action, data, received }
    alerts: [], // { id, text, tone }
    answered: {}, // ids of accept/cancel notifications the player already answered
});

let seq = 1;

const isMap = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

function normalise(n) {
    return {
        ...n,
        action: isMap(n.action) ? n.action : {},
        data: isMap(n.data) ? n.data : null,
        duration: Number(n.duration) || 0,
        received: Date.now(),
    };
}

export function addNotification(n) {
    if (!isMap(n)) return;
    if (n._id !== undefined && n._id !== null) {
        const i = notify.list.findIndex((x) => x._id == n._id);
        if (i >= 0) {
            notify.list[i] = normalise(n);
            delete notify.answered[n._id];
            return;
        }
        notify.list.unshift(normalise(n));
        return;
    }
    notify.list.unshift(normalise({ ...n, _id: `n${seq++}` }));
}

export function updateNotification({ id, title, description } = {}) {
    const n = notify.list.find((x) => x._id == id);
    if (!n) return;
    n.title = title;
    n.description = description;
    n.received = Date.now();
}

export function hideNotification(id) {
    notify.list = notify.list.filter((x) => x._id != id);
}

export function dismissAll() {
    notify.list = [];
    notify.answered = {};
}

export function isPersistent(n) {
    return Number(n?.duration) === -1;
}

export function needsAnswer(n) {
    return Boolean(n?.action?.accept || n?.action?.cancel);
}

/** How long a timed notification stays when Lua sent no duration. */
const DEFAULT_MS = 6000;

export function isLive(n, now = Date.now()) {
    if (isPersistent(n)) return true;
    const d = n.duration > 0 ? n.duration : DEFAULT_MS;
    return now - n.received < d;
}

/** Drop timed notifications whose time has passed. */
export function sweep(now = Date.now()) {
    const kept = notify.list.filter((n) => isLive(n, now));
    if (kept.length !== notify.list.length) notify.list = kept;
}

export function markAnswered(id) {
    notify.answered[id] = true;
    hideNotification(id);
}

/* ------------------------------------------------------------- alerts */

let alertSeq = 1;

/** A one-line message inside the laptop. tone: neutral | success | error | info | warning */
export function showAlert(text, tone = 'neutral') {
    if (!text) return;
    const id = alertSeq++;
    notify.alerts.push({ id, text, tone });
    if (notify.alerts.length > 3) notify.alerts.shift();
    setTimeout(() => {
        notify.alerts = notify.alerts.filter((a) => a.id !== id);
    }, 3500);
}

export function resetAlerts() {
    notify.alerts = [];
}
