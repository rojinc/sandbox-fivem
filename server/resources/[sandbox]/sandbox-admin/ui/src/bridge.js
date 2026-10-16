/**
 * Lua -> UI routing (client/nui.lua). Every SendNUIMessage({ type, data })
 * listed in ../CONTRACT.md lands here and mutates the rune state modules.
 */
import { onNui } from '@sandbox/ui-kit';
import { setUserData, show, hide } from './state/app.svelte.js';
import { copyText } from './state/clipboard.svelte.js';
import { previewRoute } from './state/nav.svelte.js';

export function installBridge() {
    onNui('SET_USERDATA', (d) => setUserData(d ?? {}));
    onNui('APP_SHOW', (d) => show(d ?? {}));
    onNui('APP_HIDE', () => hide());
    // CopyClipboard(txt) sends data = { data = txt }.
    onNui('COPY', (d) => copyText(d && typeof d === 'object' ? d.data : d));

    // Preview-only (see nav.svelte.js): never sent by Lua.
    window.addEventListener('message', (e) => {
        const route = e.data?.previewRoute;
        if (typeof route === 'string' && route.startsWith('/')) previewRoute(route);
    });
}
