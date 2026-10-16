/**
 * Lua -> UI message routing. Every SendNUIMessage({ type, data }) listed in
 * CONTRACT.md lands here and mutates the rune state modules directly.
 */
import { onNui } from '@sandbox/ui-kit/nui';
import { app, showApp, hideApp, setCharacter, navigate } from './state/app.svelte.js';

export function installBridge() {
    // client/client.lua Finance:Client:OpenUI (BANK) and client/components/banking/atms.lua (ATM).
    onNui('SET_APP', (d = {}) => showApp(d));

    // client/client.lua Close callback (no data) and UI:Client:Reset ({}).
    onNui('APP_HIDE', () => hideApp());

    // client/client.lua Characters:Client:Spawn and Characters:Client:Updated (Cash).
    onNui('SET_DATA', (d = {}) => {
        if (d.type === 'character') setCharacter(d.data);
    });

    // UI-only: previews and deep links. Lua never sends it today.
    onNui('NAVIGATE', (d = {}) => navigate(d));

    // Keep the module referenced so the bridge is installed before the first message.
    return app;
}
