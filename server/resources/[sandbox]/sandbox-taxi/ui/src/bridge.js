/**
 * Lua -> UI message routing. Every SendNUIMessage({ type, data }) listed in
 * ../CONTRACT.md lands here and mutates the rune state in state/meter.svelte.js.
 * The resource registers no NUI callbacks, so nothing here calls fetchNui.
 */
import { onNui } from '@sandbox/ui-kit/nui';
import { showMeter, hideMeter, resetMeter, setRate, resetTrip, addTrip } from './state/meter.svelte.js';

export function installBridge() {
    onNui('APP_SHOW', (d = {}) => showMeter(d.rate));
    onNui('APP_HIDE', () => hideMeter());
    onNui('APP_RESET', () => resetMeter());
    onNui('SET_RATE', (d = {}) => setRate(d.rate));
    onNui('RESET_TRIP', () => resetTrip());
    onNui('UPDATE_TRIP', (d = {}) => addTrip(d.trip));
}
