import { fetchNui } from '@sandbox/ui-kit';

export class NuiTimeoutError extends Error {
    constructor(name) {
        super(`No reply from ${name}`);
        this.name = 'NuiTimeoutError';
    }
}

/**
 * fetchNui with a timeout. Some Lua branches never call cb (ActionPlayer
 * "marker"), and a hung promise would leave a page loading forever.
 */
export function call(name, body = {}, { timeout = 8000 } = {}) {
    let timer;
    const guard = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new NuiTimeoutError(name)), timeout);
    });
    return Promise.race([fetchNui(name, body), guard]).finally(() => clearTimeout(timer));
}

export function errorText(err) {
    if (err instanceof NuiTimeoutError) return 'The server did not answer. Try again in a few seconds.';
    return 'The console could not reach the server. Close it and open it again.';
}

/**
 * Normalise a `{ success, message } | true | false | null` reply.
 * The Lua messages are Title Case ("Vehicle Repaired Fully"); keep them but sentence-case them.
 */
export function readResult(res, okText, failText) {
    if (res && typeof res === 'object' && ('success' in res || 'message' in res)) {
        const ok = res.success === undefined ? true : Boolean(res.success);
        return { ok, message: sentence(res.message) || (ok ? okText : failText) };
    }
    if (res === false) return { ok: false, message: failText };
    return { ok: true, message: okText };
}

function sentence(msg) {
    if (typeof msg !== 'string' || !msg.trim()) return '';
    // Lower only Capitalised words, so acronyms (RPC, VIN) stay as Lua wrote them.
    const s = msg
        .trim()
        .replace(/!+$/, '')
        .split(' ')
        .map((w, i) => (i > 0 && /^[A-Z][a-z']+$/.test(w) ? w.toLowerCase() : w))
        .join(' ');
    return s.charAt(0).toUpperCase() + s.slice(1);
}
