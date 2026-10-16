/**
 * fetchNui with the terminal's error handling: a thrown request (timeout,
 * resource restarting) resolves to `null` so pages show their error state.
 */
import { fetchNui } from '@sandbox/ui-kit/nui';

export async function call(name, body = {}, { timeout = 15000 } = {}) {
    try {
        return await fetchNui(name, body, { timeout });
    } catch (err) {
        console.warn(`[mdt] ${name} failed`, err);
        return null;
    }
}

/** Lua tables with numeric keys can arrive as objects. */
export const list = (v) => (Array.isArray(v) ? v : v && typeof v === 'object' ? Object.values(v) : []).filter((x) => x !== null && x !== undefined);

/** Search answers come as an array (people, firearm) or { data, pages } (vehicle, report, warrant). */
export function paged(res, page = 1) {
    if (res === false || res === null || res === undefined) return null;
    if (Array.isArray(res)) return { data: res, pages: page };
    if (typeof res === 'object' && ('data' in res || 'pages' in res)) {
        const data = list(res.data);
        return { data, pages: Number(res.pages) || page };
    }
    if (typeof res === 'object') return { data: list(res), pages: page };
    return null;
}
