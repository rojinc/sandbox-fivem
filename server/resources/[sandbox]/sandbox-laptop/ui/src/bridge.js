/**
 * Lua -> UI routing. Every SendNUIMessage({ type, data }) listed in
 * CONTRACT.md lands here and mutates the rune state modules.
 */
import { onNui, fetchNui } from '@sandbox/ui-kit/nui';
import { laptop, show, hide, clearHistory, setApps } from './state/laptop.svelte.js';
import { setData, addData, updateData, removeData, resetData } from './state/data.svelte.js';
import { addNotification, updateNotification, hideNotification, dismissAll, resetAlerts } from './state/notify.svelte.js';
import { closeAll, openApp } from './state/windows.svelte.js';

export function installBridge() {
    /* ------------------------------------------------------ visibility */
    onNui('LAPTOP_VISIBLE', show);
    onNui('LAPTOP_NOT_VISIBLE', () => {
        // The old reducer answered this with CloseLaptop; Lua sends it on logout.
        const wasOpen = laptop.visible;
        hide();
        if (wasOpen) fetchNui('CloseLaptop');
    });
    onNui('LAPTOP_NOT_VISIBLE_FORCED', hide);
    onNui('CLEAR_HISTORY', clearHistory);
    onNui('ALERTS_RESET', resetAlerts);
    onNui('UI_RESET', () => {
        const wasOpen = laptop.visible;
        hide();
        resetAlerts();
        // Lua's reset only closes the laptop when `tabletOpen` is set, which nothing sets.
        if (wasOpen) fetchNui('CloseLaptop');
    });
    onNui('CLOSE_ALL_APPS', closeAll);

    /* ----------------------------------------------------------- shell */
    onNui('SET_APPS', (d) => setApps(d));
    onNui('SET_TIME', (d) => {
        if (d && typeof d === 'object') laptop.time = { hour: Number(d.hour) || 0, minute: Number(d.minute) || 0 };
    });
    onNui('LOAD_PERMS', (d) => (laptop.permissions = d ?? null));

    /* ------------------------------------------------------------ data */
    onNui('SET_DATA', (d = {}) => setData(d.type, d.data));
    onNui('ADD_DATA', (d = {}) => addData(d.type, d.data, d.key, d.first));
    onNui('UPDATE_DATA', (d = {}) => updateData(d.type, d.id, d.data, d.key));
    onNui('REMOVE_DATA', (d = {}) => removeData(d.type, d.id, d.key));
    onNui('RESET_DATA', resetData);

    /* --------------------------------------------------- notifications */
    onNui('NOTIF_ADD', (d = {}) => addNotification(d.notification));
    onNui('NOTIF_UPDATE', (d = {}) => updateNotification(d));
    onNui('NOTIF_HIDE', (d = {}) => hideNotification(d.id));
    onNui('NOTIF_DISMISS_ALL', dismissAll);

    /* ------------------------------------------------- UI-only (preview) */
    // Never sent by Lua: lets ui/preview scenarios open a window. { app, page?, id? }
    onNui('PREVIEW_OPEN', (d = {}) => {
        if (typeof d.app === 'string') openApp(d.app, d.page ? { page: d.page, id: d.id ?? null } : null);
    });
}
