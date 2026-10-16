import { useEffect, useRef } from 'react';

/**
 * NUI bridge helpers, following the conventions from
 * https://docs.fivem.net/docs/scripting-manual/nui-development/
 *
 *  - Lua -> UI : SendNUIMessage({ type = 'EVENT', data = {...} }) arrives as a
 *                window 'message' event; see useNuiEvent / NuiBridge.
 *  - UI -> Lua : fetchNui('callback', data) POSTs to
 *                https://<resource>/<callback>, handled by RegisterNUICallback.
 */

/** True when the page runs in a normal browser instead of the game's CEF. */
export function isEnvBrowser() {
    return typeof window !== 'undefined' && !window.invokeNative;
}

/** The resource this NUI belongs to; injected by FiveM, mocked in browsers. */
export function getResourceName() {
    if (typeof window !== 'undefined' && typeof window.GetParentResourceName === 'function') {
        return window.GetParentResourceName();
    }
    return 'nui-dev';
}

let browserMocks = {};

/**
 * Register responses for fetchNui() calls while developing in a browser.
 * @param {Record<string, any | ((data:any)=>any)>} mocks
 */
export function mockNui(mocks) {
    browserMocks = { ...browserMocks, ...mocks };
}

/**
 * Call a RegisterNUICallback handler on the Lua side.
 * Resolves with the parsed JSON reply (or null when the reply is not JSON).
 * In a browser it resolves with the registered mock (default {}), after a
 * short delay to imitate the round trip.
 *
 * @param {string} event   callback name
 * @param {object} [data]  JSON body
 */
export async function fetchNui(event, data = {}) {
    if (isEnvBrowser()) {
        const mock = browserMocks[event];
        await new Promise((r) => setTimeout(r, 60));
        return typeof mock === 'function' ? mock(data) : mock ?? {};
    }

    const response = await fetch(`https://${getResourceName()}/${event}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify(data),
    });

    try {
        return await response.json();
    } catch (e) {
        return null;
    }
}

/**
 * Fire a fake SendNUIMessage from JS (browser development, previews, tests).
 * Accepts the same shape Lua sends: { type, data }.
 */
export function emulateNui(type, data = {}) {
    window.dispatchEvent(new MessageEvent('message', { data: { type, data } }));
}

/**
 * Queue a list of fake messages when running in a browser.
 * @param {{type:string, data?:any, delay?:number}[]} messages
 */
export function debugData(messages, baseDelay = 0) {
    if (!isEnvBrowser()) return;
    let t = baseDelay;
    for (const m of messages) {
        t += m.delay ?? 0;
        setTimeout(() => emulateNui(m.type, m.data ?? {}), t);
    }
}

/**
 * Subscribe a component to one NUI message type.
 * The handler always sees the latest closure without re-subscribing.
 *
 * @param {string} type
 * @param {(data:any)=>void} handler
 */
export function useNuiEvent(type, handler) {
    const saved = useRef(handler);
    saved.current = handler;

    useEffect(() => {
        const listener = (event) => {
            const msg = event.data;
            if (!msg) return;
            const t = msg.type ?? msg.action;
            if (t === type) saved.current(msg.data);
        };
        window.addEventListener('message', listener);
        return () => window.removeEventListener('message', listener);
    }, [type]);
}

/**
 * Run a handler on a key press (key = KeyboardEvent.key, e.g. 'Escape').
 * @param {string|string[]} keys
 * @param {(e:KeyboardEvent)=>void} handler
 * @param {{enabled?:boolean, event?:'keydown'|'keyup'}} [opts]
 */
export function useKey(keys, handler, { enabled = true, event = 'keydown' } = {}) {
    const saved = useRef(handler);
    saved.current = handler;
    const list = Array.isArray(keys) ? keys : [keys];
    const sig = list.join('|');

    useEffect(() => {
        if (!enabled) return undefined;
        const listener = (e) => {
            if (list.includes(e.key)) saved.current(e);
        };
        window.addEventListener(event, listener);
        return () => window.removeEventListener(event, listener);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sig, enabled, event]);
}

/** Convenience: call a NUI callback when Escape is pressed. */
export function useEscape(callback, enabled = true) {
    useKey('Escape', () => fetchNui(callback), { enabled });
}
