/**
 * Lua -> UI message routing. Every SendNUIMessage({ type, data }) listed in
 * CONTRACT.md lands here and mutates the rune state modules.
 */
import { onNui, fetchNui } from '@sandbox/ui-kit/nui';
import { app, setUser, jobLogin, jobUpdate, jobLogout, logout, go } from './state/app.svelte.js';
import { store, setData, addData, updateData, removeData, resetData } from './state/data.svelte.js';
import { alerts, addAlert, resetAlerts } from './state/alerts.svelte.js';
import { overlays, showCard, hideCard } from './state/overlays.svelte.js';
import { resetSearches } from './state/search.svelte.js';
import { connectAlerts, disconnectAlerts, changePursuitMode, changeRadioChannel } from './lib/alerts.js';

const PAGE_ROUTES = { '/': 'dashboard', '/people': 'people', '/vehicles': 'vehicles', '/reports': 'reports', '/warrants': 'warrants', '/penal-code': 'charges', '/library': 'library', '/roster': 'roster', '/prisoners': 'inmates' };

/** SET_DATA route: the old terminal took a path ("/people?person=12"); map it onto a page. */
function followRoute(route) {
    if (typeof route !== 'string' || !route.startsWith('/')) return;
    const [path, query = ''] = route.split('?');
    const q = new URLSearchParams(query);
    const search = q.get('search');
    if (path === '/people' && q.get('person')) return go('person', { id: q.get('person') });
    if (path === '/vehicles' && q.get('vehicle')) return go('vehicle', { id: q.get('vehicle') });
    if (path === '/reports' && q.get('report')) return go('report', { id: Number(q.get('report')) });
    if (path === '/reports' && q.get('edit')) return go('report-edit', { id: Number(q.get('edit')) });
    if (path === '/reports' && q.get('mode') === 'create') return go('report-edit', { type: Number(q.get('type') ?? 0) });
    if (path === '/warrants' && q.get('warrant')) return go('warrant', { id: Number(q.get('warrant')) });
    if (path === '/firearms' && q.get('firearm')) return go('firearm', { id: q.get('firearm') });
    if (path === '/bolos') return go('bolos');
    if (path === '/properties') return go('properties');
    if (path === '/firearms') return go('firearms', search ? { term: search } : {});
    if (path === '/admin') return go('admin');
    if (PAGE_ROUTES[path]) go(PAGE_ROUTES[path], search ? { term: search } : {});
}

export function installBridge() {
    /* ------------------------------------------------------------ shell */
    onNui('APP_SHOW', () => (app.visible = true));
    onNui('APP_HIDE', () => (app.visible = false));
    onNui('SET_USER', (d = {}) => setUser(d.user));
    onNui('JOB_LOGIN', (d = {}) => {
        jobLogin(d);
        store.homeLastFetch = 0;
    });
    onNui('JOB_UPDATE', (d = {}) => jobUpdate(d));
    onNui('JOB_LOGOUT', () => {
        jobLogout();
        store.homeLastFetch = 0;
    });
    onNui('LOGOUT', () => {
        logout();
        resetData();
        resetSearches();
        disconnectAlerts();
        resetAlerts({ keepShowing: false });
        overlays.card.showing = false;
        overlays.bodycam = false;
    });

    /* ------------------------------------------------------------- data */
    onNui('SET_DATA', (d = {}) => {
        setData(d.type, d.data);
        if (d.type === 'route') followRoute(d.data);
        if (d.type === 'prison' && d.data) go('visitation', {}, { replace: true });
    });
    onNui('ADD_DATA', (d = {}) => addData(d.type, d.data, d.key));
    onNui('UPDATE_DATA', (d = {}) => updateData(d.type, d.id, d.data));
    onNui('REMOVE_DATA', (d = {}) => removeData(d.type, d.id));
    onNui('RESET_DATA', () => resetData());

    /* ------------------------------------------------- overlays */
    onNui('SET_BODYCAM', (d = {}) => (overlays.bodycam = Boolean(d.state)));
    onNui('TOGGLE_BODYCAM', () => (overlays.bodycam = !overlays.bodycam));
    onNui('SHOW_GOV_ID', (d) => showCard('badge', d));
    onNui('HIDE_GOV_ID', () => hideCard('badge'));
    onNui('SHOW_DRIVER_LICENSE', (d) => showCard('licence', d));
    onNui('HIDE_DRIVER_LICENSE', () => hideCard('licence'));

    /* ------------------------------------------------------ alerts */
    onNui('SET_SHOWING', (d = {}) => (alerts.showing = Boolean(d.state)));
    onNui('ADD_ALERT', (d = {}) => {
        const alert = d.alert;
        if (!alert?.id) return;
        // Client-only alerts never reach the socket: ask Lua for the sound and blip here.
        if (alert.client) fetchNui('ReceiveAlert', alert).catch(() => {});
        addAlert(alert);
    });
    onNui('ALERTS_WS_CONNECT', (d = {}) => connectAlerts(d.url, d.token));
    onNui('ALERTS_WS_DISCONNECT', () => disconnectAlerts());
    onNui('ALERTS_UPDATE_PURSUIT_MODE', (d = {}) => changePursuitMode(d.mode ?? null));
    onNui('ALERTS_UPDATE_RADIO_CHANNEL', (d = {}) => changeRadioChannel(d.channel ?? null));
}
