import { data } from '../state/data.svelte.js';
import { startCall } from '../state/call.svelte.js';
import { showAlert } from '../state/notify.svelte.js';
import { openApp } from '../state/router.svelte.js';
import { phone } from '../state/phone.svelte.js';

export function contactList() {
    return (Array.isArray(data.contacts) ? data.contacts : Object.values(data.contacts ?? {})).filter(Boolean);
}

export function findContact(number) {
    if (!number) return null;
    return contactList().find((c) => c.number === number) ?? null;
}

export function displayName(number) {
    return findContact(number)?.name ?? number;
}

/** Favourites first, then by name. */
export function sortContacts(list) {
    return [...list].sort((a, b) => {
        if (Boolean(a.favorite) !== Boolean(b.favorite)) return a.favorite ? -1 : 1;
        return String(a.name ?? '').localeCompare(String(b.name ?? ''), 'en', { sensitivity: 'base' });
    });
}

/** Call a number from any app; opens the call screen when Lua accepts. */
export async function callNumber(number, { isAnon = false } = {}) {
    if (!number) return false;
    if (number === data.player?.Phone) {
        showAlert('You cannot call your own number.', 'error');
        return false;
    }
    const ok = await startCall(number, { limited: phone.limited, isAnon });
    if (ok) openApp('phone', `call/${encodeURIComponent(number)}`);
    else showAlert('The call could not be started. Try again.', 'error');
    return ok;
}
