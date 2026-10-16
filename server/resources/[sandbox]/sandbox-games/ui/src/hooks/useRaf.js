import { useEffect, useRef } from 'react';

/**
 * requestAnimationFrame loop. callback(elapsedMs, deltaMs); `elapsed` restarts
 * every time `active` flips to true.
 */
export function useRaf(callback, active = true) {
    const saved = useRef(callback);
    saved.current = callback;

    useEffect(() => {
        if (!active) return undefined;
        let id = 0;
        let stopped = false;
        const start = performance.now();
        let last = start;
        const frame = (now) => {
            if (stopped) return;
            const dt = now - last;
            last = now;
            saved.current(now - start, dt);
            if (!stopped) id = requestAnimationFrame(frame);
        };
        id = requestAnimationFrame(frame);
        return () => {
            stopped = true;
            cancelAnimationFrame(id);
        };
    }, [active]);
}
