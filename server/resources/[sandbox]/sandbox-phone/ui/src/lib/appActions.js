/**
 * Home screen and dock changes, reordering, install and uninstall. Lua saves
 * each change; the local copy of player.Apps is updated straight away so the
 * screen does not wait for the next player sync.
 */
import { fetchNui } from '@sandbox/ui-kit/nui';
import { data } from '../state/data.svelte.js';
import { showAlert } from '../state/notify.svelte.js';
import { store } from '../state/store.svelte.js';

function appsOf() {
    if (!data.player) return null;
    if (!data.player.Apps) data.player.Apps = { installed: [], home: [], dock: [] };
    for (const k of ['installed', 'home', 'dock']) if (!Array.isArray(data.player.Apps[k])) data.player.Apps[k] = [];
    return data.player.Apps;
}

export const MAX_DOCK = 4;

/** type: 'Home' | 'Dock'; action: 'add' | 'remove' */
export function changePlacement(action, type, app) {
    const apps = appsOf();
    if (!apps) return;
    const key = type.toLowerCase();
    if (action === 'add') {
        if (key === 'dock' && apps.dock.length >= MAX_DOCK) {
            showAlert(`The dock holds ${MAX_DOCK} apps. Remove one first.`, 'warning');
            return;
        }
        if (!apps[key].includes(app)) apps[key].push(app);
    } else {
        apps[key] = apps[key].filter((a) => a !== app);
    }
    fetchNui(type, { action, app });
}

/** Move an app one place earlier (-1) or later (+1) on the home screen. */
export function moveOnHome(app, dir) {
    const apps = appsOf();
    if (!apps) return;
    const list = [...apps.home];
    const i = list.indexOf(app);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    apps.home = list;
    fetchNui('Reorder', { type: 'home', apps: list });
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** Install flow of the old store: check, a short download, then install. */
export async function install(app, label = 'App') {
    if (store.busy[app]) return;
    store.busy[app] = 'installing';
    try {
        const ok = await fetchNui('Install', { app, check: true });
        if (!ok) throw new Error('check');
        await wait(800 + Math.floor(Math.random() * 2200));
        const done = await fetchNui('Install', { app });
        if (!done) throw new Error('install');
        const apps = appsOf();
        if (apps && !apps.installed.includes(app)) apps.installed.push(app);
        if (apps && !apps.home.includes(app)) apps.home.push(app);
        showAlert(`${label} installed`, 'success');
    } catch {
        showAlert(`${label} could not be installed. Try again.`, 'error');
    } finally {
        delete store.busy[app];
    }
}

export async function uninstall(app, label = 'App') {
    if (store.busy[app]) return;
    store.busy[app] = 'removing';
    try {
        const ok = await fetchNui('Uninstall', { app, check: true });
        if (!ok) throw new Error('check');
        await wait(500 + Math.floor(Math.random() * 1500));
        const done = await fetchNui('Uninstall', { app });
        if (!done) throw new Error('uninstall');
        const apps = appsOf();
        if (apps) {
            apps.installed = apps.installed.filter((a) => a !== app);
            apps.home = apps.home.filter((a) => a !== app);
            apps.dock = apps.dock.filter((a) => a !== app);
        }
        showAlert(`${label} removed`, 'success');
    } catch {
        showAlert(`${label} could not be removed. Try again.`, 'error');
    } finally {
        delete store.busy[app];
    }
}
