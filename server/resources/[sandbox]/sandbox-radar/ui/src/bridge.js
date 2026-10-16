/**
 * Lua -> UI message routing. Every SendNUIMessage({ type, data }) listed in
 * CONTRACT.md lands here and mutates the rune state in state/radar.svelte.js.
 */
import { onNui } from '@sandbox/ui-kit/nui';
import { radar, resetRadar, applySettings, applyData } from './state/radar.svelte.js';

export function installBridge() {
    onNui('RADAR_SHOW', () => (radar.visible = true));
    onNui('RADAR_HIDE', () => (radar.visible = false));
    onNui('RESET_RADAR', () => resetRadar());
    onNui('UPDATE_DATA', (d) => applyData(d));
    onNui('UPDATE_SETTINGS', (d) => applySettings(d));
    onNui('REMOTE_SHOW', () => (radar.remoteOpen = true));
    onNui('REMOTE_HIDE', () => (radar.remoteOpen = false));
}
