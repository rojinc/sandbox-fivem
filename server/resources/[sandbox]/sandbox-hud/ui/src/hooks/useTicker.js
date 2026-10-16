import { useEffect, useRef, useState } from 'react';

/** Re-render every `ms` milliseconds while `active`. Returns Date.now() at the last tick. */
export function useTicker(ms = 1000, active = true) {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        if (!active) return undefined;
        setNow(Date.now());
        const id = setInterval(() => setNow(Date.now()), ms);
        return () => clearInterval(id);
    }, [ms, active]);
    return now;
}

/** requestAnimationFrame-driven elapsed time since `startTime` (ms), capped at `max`. */
export function useElapsed(startTime, max = Infinity, active = true) {
    const [elapsed, setElapsed] = useState(0);
    const frame = useRef(0);
    useEffect(() => {
        if (!active || !startTime) {
            setElapsed(0);
            return undefined;
        }
        const loop = () => {
            const e = Math.min(Date.now() - startTime, max);
            setElapsed(e);
            if (e < max) frame.current = requestAnimationFrame(loop);
        };
        frame.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(frame.current);
    }, [startTime, max, active]);
    return elapsed;
}

/** "m:ss" for a millisecond remainder (never negative). */
export function formatCountdown(ms) {
    const total = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
}
