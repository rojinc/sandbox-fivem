/** Visibility, mode, per-character settings, hotbar, equipped weapon, alerts and the static tooltip. */
export const app = $state({
    visible: false,
    mode: 'inventory', // inventory | crafting
    settings: { muted: false, useBank: true },
    hotbar: { showing: false, items: [], shownAt: 0 },
    equipped: null, // SlotRecord
    staticTooltip: null, // SlotRecord
    alerts: [], // { id, type, item, count, at }
    crashed: false,
});

/** Layout scale: the screens are laid out for 1920x1080 and scaled to the window. */
export const view = $state({ scale: 1, width: 1920, height: 1080 });

let alertSeq = 0;
export function pushAlert(alert) {
    if (!alert) return;
    const id = `a${++alertSeq}`;
    app.alerts = [...app.alerts, { ...alert, key: id, at: Date.now() }].slice(-5);
    setTimeout(() => {
        app.alerts = app.alerts.filter((a) => a.key !== id);
    }, 3000);
}
