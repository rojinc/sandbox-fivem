import { fetchNui } from '@sandbox/ui-kit';

export class NuiTimeoutError extends Error {
    constructor(event) {
        super(`No reply from ${event}`);
        this.name = 'NuiTimeoutError';
        this.event = event;
    }
}

/**
 * fetchNui with a timeout. A few Lua callbacks never answer in some branches
 * (see CONTRACT.md), and a hung promise would leave a page spinning forever.
 */
export function callNui(event, body = {}, { timeout = 8000 } = {}) {
    let timer;
    const guard = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new NuiTimeoutError(event)), timeout);
    });
    return Promise.race([fetchNui(event, body), guard]).finally(() => clearTimeout(timer));
}

export function describeError(err) {
    if (err instanceof NuiTimeoutError) return 'The server did not answer in time.';
    return 'Something went wrong talking to the server.';
}

/** Normalise a `{ success, message } | true | false | null` reply. */
export function readResult(res, okText = 'Done', failText = 'Action failed') {
    if (res && typeof res === 'object') {
        const ok = res.success === undefined ? true : Boolean(res.success);
        return { ok, message: res.message || (ok ? okText : failText) };
    }
    return { ok: res === true, message: res === true ? okText : failText };
}

/** Clipboard copy that works inside the game's CEF (execCommand) with the async API as fallback. */
export function copyToClipboard(text) {
    const value = String(text ?? '');
    try {
        const node = document.createElement('textarea');
        node.value = value;
        node.setAttribute('readonly', '');
        node.style.position = 'fixed';
        node.style.top = '0';
        node.style.opacity = '0';
        document.body.appendChild(node);
        node.select();
        node.setSelectionRange(0, value.length);
        const ok = document.execCommand('copy');
        document.body.removeChild(node);
        if (ok) return true;
    } catch (e) {
        /* fall through */
    }
    if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(value).catch(() => {});
        return true;
    }
    return false;
}
