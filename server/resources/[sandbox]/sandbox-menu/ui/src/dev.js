/** Development only (imported from main.js under import.meta.env.DEV): replay a preview scenario. */
import { emitNui } from '@sandbox/ui-kit/nui';
import scenario from '../preview/values.json';

export function showSample() {
    let at = 0;
    for (const msg of scenario.messages ?? []) {
        at += (msg.delay ?? 0) + 50;
        setTimeout(() => emitNui(msg.type, msg.data ?? {}), at);
    }
}
