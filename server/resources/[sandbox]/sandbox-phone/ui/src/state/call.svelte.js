/**
 * The current call. state: 0 dialling, 1 incoming, 2 connected.
 * `start` is a local millisecond timestamp set on SET_CALL_ACTIVE.
 */
import { fetchNui } from '@sandbox/ui-kit/nui';

export const call = $state({
    current: null, // { state, number, limited, start }
    ended: null, // { number, at } the call that just ended, so the call screen can say so
});

export function setPending(number) {
    call.current = { state: 0, number: String(number ?? ''), limited: false, start: null };
    call.ended = null;
}

export function setIncoming(number, limited) {
    call.current = { state: 1, number: String(number ?? ''), limited: Boolean(limited), start: null };
    call.ended = null;
}

export function setActive() {
    if (!call.current) call.current = { state: 2, number: '', limited: false, start: Date.now() };
    else {
        call.current.state = 2;
        call.current.start = Date.now();
    }
}

export function endCall() {
    if (call.current) call.ended = { number: call.current.number, limited: call.current.limited, at: Date.now() };
    call.current = null;
}

export function resetCall() {
    call.current = null;
    call.ended = null;
}

/** Start a call. Resolves true when Lua accepted it. */
export async function startCall(number, { limited = false, isAnon = false } = {}) {
    if (call.current) return false;
    try {
        const res = await fetchNui('CreateCall', { number, limited, isAnon });
        return res === true || res === 'true' || res === 1;
    } catch {
        return false;
    }
}

export function acceptCall() {
    fetchNui('AcceptCall', call.current?.number ?? null);
}

export function hangUp() {
    fetchNui('EndCall', null);
}
