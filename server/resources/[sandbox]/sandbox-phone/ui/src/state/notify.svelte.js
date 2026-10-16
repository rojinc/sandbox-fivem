/**
 * Phone notifications (NOTIF_*) and short in-phone alerts (feedback after
 * an action, e.g. "Contact saved").
 */
const PERSIST_COLLAPSE_MS = 5000;

export const notify = $state({
    list: [], // { id, title, description, time, duration, app, action, data, show, collapsed, received }
    alerts: [], // { id, text, tone }
});

let seq = 1;

export function addNotification(n) {
    if (!n || typeof n !== 'object') return;
    const received = Date.now();
    if (n.id !== undefined && n.id !== null) {
        const i = notify.list.findIndex((x) => x.id == n.id);
        if (i >= 0) {
            notify.list[i] = { ...n, collapsed: false, received, show: n.show !== false };
            return;
        }
    }
    notify.list.unshift({ ...n, id: n.id ?? `n${seq++}`, collapsed: false, received, show: n.show !== false });
}

export function updateNotification({ id, title, description } = {}) {
    const n = notify.list.find((x) => x.id == id);
    if (!n) return;
    if (title !== undefined) n.title = title;
    if (description !== undefined) n.description = description;
    n.collapsed = false;
    n.received = Date.now();
}

export function hideNotification(id) {
    notify.list = notify.list.filter((x) => x.id != id);
}

export function dismissAll() {
    notify.list = [];
}

export function collapse(id) {
    const n = notify.list.find((x) => x.id == id);
    if (n) n.collapsed = true;
}

export function isPersistent(n) {
    return Number(n?.duration) === -1;
}

/** Remove timed notifications once their duration has passed; collapse persistent ones after 5 s. */
export function sweep(now = Date.now()) {
    for (const n of notify.list) {
        if (isPersistent(n)) {
            if (!n.collapsed && now - n.received > PERSIST_COLLAPSE_MS) n.collapsed = true;
        }
    }
    const before = notify.list.length;
    const kept = notify.list.filter((n) => isPersistent(n) || now - n.received < (Number(n.duration) > 0 ? Number(n.duration) : 6000));
    if (kept.length !== before) notify.list = kept;
}

/* ------------------------------------------------------------- alerts */

let alertSeq = 1;

/** A one-line message inside the phone. tone: neutral | success | error | info | warning */
export function showAlert(text, tone = 'neutral') {
    if (!text) return;
    const id = alertSeq++;
    notify.alerts.push({ id, text, tone });
    if (notify.alerts.length > 3) notify.alerts.shift();
    setTimeout(() => {
        notify.alerts = notify.alerts.filter((a) => a.id !== id);
    }, 3000);
}

export function resetAlerts() {
    notify.alerts = [];
}
