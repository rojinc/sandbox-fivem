/**
 * Open app windows. The list is the stacking order: the last window that is
 * not minimised is on top and has focus. `request` carries a page to open
 * (a notification's view action or a preview scenario) to the app.
 */
export const windows = $state({
    list: [], // [{ app, minimized, request }]
});

let seq = 0;

export function topWindow() {
    for (let i = windows.list.length - 1; i >= 0; i -= 1) {
        if (!windows.list[i].minimized) return windows.list[i];
    }
    return null;
}

export function focusedApp() {
    return topWindow()?.app ?? null;
}

export function openApp(app, request = null) {
    if (!app) return;
    const i = windows.list.findIndex((w) => w.app === app);
    const req = request ? { ...request, seq: ++seq } : null;
    if (i >= 0) {
        const [w] = windows.list.splice(i, 1);
        w.minimized = false;
        if (req) w.request = req;
        windows.list.push(w);
    } else {
        windows.list.push({ app, minimized: false, request: req });
    }
}

export function closeApp(app) {
    windows.list = windows.list.filter((w) => w.app !== app);
}

export function minimizeApp(app) {
    const w = windows.list.find((x) => x.app === app);
    if (w) w.minimized = true;
}

/** Taskbar button: bring a window forward, or minimise it when it already has focus. */
export function toggleApp(app) {
    if (focusedApp() === app) minimizeApp(app);
    else openApp(app);
}

export function closeAll() {
    windows.list = [];
}
