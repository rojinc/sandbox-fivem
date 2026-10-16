/**
 * Runtime glue between a Svelte NUI and its Lua resource.
 *
 *   Lua -> UI   SendNUIMessage({ type = 'SHOW', data = {...} })   ->  onNui('SHOW', (data) => ...)
 *   UI -> Lua   fetchNui('Close', {...})  ->  RegisterNUICallback('Close', function(data, cb) ... end)
 *
 * In a plain browser (vite dev) fetchNui answers from mockNui() entries and
 * emitNui()/debugData() post fake messages.
 */
import { onDestroy } from 'svelte';

export function isEnvBrowser() {
    return typeof window === 'undefined' || !window.invokeNative;
}

export function resourceName() {
    return typeof window !== 'undefined' && typeof window.GetParentResourceName === 'function'
        ? window.GetParentResourceName()
        : 'nui-dev';
}

const mocks = new Map();

/** Answer a callback locally when running outside the game. */
export function mockNui(name, response) {
    mocks.set(name, response);
}

/**
 * Call a RegisterNUICallback handler. Resolves with the parsed JSON the
 * callback answered with (or the raw string when it is not JSON, e.g. cb('OK')).
 */
export async function fetchNui(name, data = {}, { timeout = 10000 } = {}) {
    if (isEnvBrowser()) {
        const mock = mocks.get(name);
        return typeof mock === 'function' ? mock(data) : (mock ?? null);
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
        const res = await fetch(`https://${resourceName()}/${name}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            body: JSON.stringify(data ?? {}),
            signal: controller.signal,
        });
        const text = await res.text();
        try {
            return JSON.parse(text);
        } catch {
            return text;
        }
    } finally {
        clearTimeout(timer);
    }
}

/* ---------------------------------------------------------------- Lua -> UI */

const handlers = new Map();
let listening = false;

function ensureListener() {
    if (listening || typeof window === 'undefined') return;
    listening = true;
    window.addEventListener('message', (event) => {
        const msg = event.data;
        if (!msg || typeof msg !== 'object') return;
        const type = msg.type ?? msg.action ?? msg.eventName;
        if (type === undefined) return;
        const data = msg.data !== undefined ? msg.data : msg;
        for (const fn of handlers.get(type) ?? []) {
            try {
                fn(data, msg);
            } catch (err) {
                console.error(`[nui] handler for ${type} failed`, err);
            }
        }
        for (const fn of handlers.get('*') ?? []) {
            try {
                fn(type, data, msg);
            } catch (err) {
                console.error('[nui] wildcard handler failed', err);
            }
        }
    });
}

/**
 * Subscribe to one or more message types. Returns an unsubscribe function;
 * when called during component initialisation it is also run on destroy.
 */
export function onNui(type, fn) {
    ensureListener();
    const types = [].concat(type);
    const offs = types.map((t) => {
        if (!handlers.has(t)) handlers.set(t, new Set());
        handlers.get(t).add(fn);
        return () => handlers.get(t)?.delete(fn);
    });
    const off = () => offs.forEach((o) => o());
    try {
        onDestroy(off);
    } catch {
        /* not inside component init: the caller keeps the unsubscribe */
    }
    return off;
}

/** Post a message exactly as Lua would. */
export function emitNui(type, data = {}) {
    window.dispatchEvent(new MessageEvent('message', { data: { type, data } }));
}

/** Browser-only: replay a list of { type, data } messages. */
export function debugData(messages, delay = 100) {
    if (!isEnvBrowser()) return;
    messages.forEach((m, i) => setTimeout(() => emitNui(m.type, m.data), delay * (i + 1)));
}

/* ---------------------------------------------------------------- keyboard */

/**
 * Run `fn` when one of `keys` is pressed. Lua normally drops NUI focus in the
 * callback this triggers, so the UI never calls SetNuiFocus itself.
 */
export function onKey(keys, fn, { prevent = true } = {}) {
    const list = [].concat(keys);
    const listener = (e) => {
        if (!list.includes(e.key)) return;
        if (prevent) e.preventDefault();
        fn(e);
    };
    window.addEventListener('keydown', listener);
    const off = () => window.removeEventListener('keydown', listener);
    try {
        onDestroy(off);
    } catch {
        /* see onNui */
    }
    return off;
}

export function onEscape(fn) {
    return onKey('Escape', fn);
}
