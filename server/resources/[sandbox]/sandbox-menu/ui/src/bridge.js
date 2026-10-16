/**
 * Lua -> UI message routing. Every SendNUIMessage({ type, data }) listed in
 * CONTRACT.md lands here and updates state/menu.svelte.js.
 */
import { onNui } from '@sandbox/ui-kit/nui';
import { setupMenu, updateMenu, openSubmenu, clearMenu, showMenu, hideMenu } from './state/menu.svelte.js';
import { asList } from './lib/items.js';

export function installBridge() {
    onNui('SETUP_MENU', (d = {}) => setupMenu(d.data));
    onNui('UPDATE_MENU', (d = {}) => updateMenu(d.data));
    onNui('SUBMENU_OPEN', (d = {}) => openSubmenu(d.data, Boolean(d.addHistroy ?? d.addHistory)));
    onNui('CLEAR_MENU', () => clearMenu());
    onNui('APP_SHOW', () => showMenu());
    onNui('APP_HIDE', () => hideMenu());

    // Development only: the preview harness and vite (localhost) replay key presses to show the cursor and editors.
    if (/^(127\.0\.0\.1|localhost)$/.test(window.location.hostname)) {
        onNui('PREVIEW_KEYS', (d = {}) => {
            for (const key of asList(d.keys)) {
                window.dispatchEvent(new KeyboardEvent('keydown', { key }));
                window.dispatchEvent(new KeyboardEvent('keyup', { key }));
            }
        });
    }
}
