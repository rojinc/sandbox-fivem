import { useCallback, useEffect, useRef } from 'react';

/**
 * Rate-limit live-preview calls to the game (slider drags, held keys).
 * `push(v)` sends at most once per `wait` ms, keeping the latest value for a
 * trailing send; `commit(v)` flushes immediately and sends `v` if it is new.
 */
export function useThrottledSend(fn, wait = 60) {
    const fnRef = useRef(fn);
    fnRef.current = fn;
    const last = useRef(0);
    const timer = useRef(null);
    const pending = useRef(null);
    const lastSent = useRef(undefined);

    useEffect(() => () => clearTimeout(timer.current), []);

    const send = useCallback((v) => {
        last.current = Date.now();
        lastSent.current = v;
        pending.current = null;
        fnRef.current(v);
    }, []);

    const push = useCallback(
        (v) => {
            const elapsed = Date.now() - last.current;
            if (elapsed >= wait) {
                clearTimeout(timer.current);
                send(v);
                return;
            }
            pending.current = v;
            clearTimeout(timer.current);
            timer.current = setTimeout(() => {
                if (pending.current !== null) send(pending.current);
            }, wait - elapsed);
        },
        [wait, send],
    );

    const commit = useCallback(
        (v) => {
            clearTimeout(timer.current);
            pending.current = null;
            if (lastSent.current !== v) send(v);
        },
        [send],
    );

    return { push, commit };
}
