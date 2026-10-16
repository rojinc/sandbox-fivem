/**
 * Everything the handset can ask Lua to do (see ../../CONTRACT.md). The knobs, the power key,
 * the soft keys and the keyboard all go through here so they behave the same.
 */
import { fetchNui } from '@sandbox/ui-kit/nui';
import { radio, tuneRequested, showOsd } from '../state/radio.svelte.js';
import { rangeFor } from './ranges.js';

export const close = () => fetchNui('Close');

export const togglePower = () => fetchNui('TogglePower');

/** Speaker volume ±10 (Lua clamps 0–200 and answers with UPDATE_DATA). Only while the radio is on. */
export function volume(dir) {
    if (!radio.power) return false;
    showOsd({ kind: 'volume' });
    fetchNui(dir > 0 ? 'VolumeUp' : 'VolumeDown');
    return true;
}

/** Click-sound volume ±5. Lua plays a click at the new level but never reports the value. */
export function clicks(dir) {
    if (radio.power) showOsd({ kind: 'clicks', dir: dir > 0 ? 1 : -1 });
    fetchNui(dir > 0 ? 'ClickVolumeUp' : 'ClickVolumeDown');
}

/** SetChannel with a number. Lua stays silent when it equals the current channel, so that is never sent. */
export function tuneTo(target) {
    if (!radio.power || target === null || target === undefined) return false;
    if (Math.abs(target - radio.frequency) < 0.05) return false;
    tuneRequested(target);
    fetchNui('SetChannel', { frequency: target });
    return true;
}

/** Channel up / down by one, like Lua's CycleRadioChannel but kept inside this radio's range. */
export function stepTarget(dir) {
    const range = rangeFor(radio.type);
    const min = range?.min ?? 1;
    const max = range?.max ?? 9999;
    if (radio.frequency <= 0) return dir > 0 ? min : null;
    const target = Math.round((radio.frequency + dir) * 10) / 10;
    if (target < min) return 0; // stepping below the range leaves the channel
    if (target > max) return null;
    return target;
}

export function step(dir) {
    if (!radio.power || radio.pending !== null) return;
    const target = stepTarget(dir);
    if (target !== null) tuneTo(target);
}
