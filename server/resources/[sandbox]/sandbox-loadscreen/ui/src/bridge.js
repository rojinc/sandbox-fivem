/**
 * Game -> UI routing. The native loadscreen events arrive on window 'message'
 * as `{ eventName, ...fields }`, not `{ type, data }`. The kit's onNui cannot
 * be used here: it keys on `msg.type ?? msg.action ?? msg.eventName`, and the
 * init-function events carry their own `type` field (`INIT_SESSION`, `MAP`,
 * `onDataFileEntry.type: 20`), which would shadow the event name. So this is a
 * plain listener keyed by `eventName`; see ../CONTRACT.md for every event.
 */
import { applyLoadEvent } from './state/loading.svelte.js';
import { setHandover } from './state/handover.svelte.js';

export function installBridge() {
    window.addEventListener('message', (event) => {
        const msg = event.data;
        if (!msg || typeof msg !== 'object') return;

        if (typeof msg.eventName === 'string') {
            applyLoadEvent(msg);
            return;
        }

        // Preview only: nothing in Lua sends this. In the game the same values
        // arrive as window.nuiHandoverData before the page scripts run.
        if (msg.type === 'HANDOVER') setHandover(msg.data);
    });
}
