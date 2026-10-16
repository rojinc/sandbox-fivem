/**
 * Lua -> UI message routing. The three SendNUIMessage types in client/main.lua
 * (see ../CONTRACT.md) land here and mutate the rune state in state/radio.svelte.js.
 */
import { onNui } from '@sandbox/ui-kit/nui';
import { setOpen, applyUpdate } from './state/radio.svelte.js';

export function installBridge() {
    onNui('APP_SHOW', () => setOpen(true));
    onNui('APP_HIDE', () => setOpen(false));
    onNui('UPDATE_DATA', (d = {}) => applyUpdate(d));
}
