import { useEffect, useRef } from 'react';

/** setInterval that always sees the latest callback; `delay` null pauses it. */
export function useInterval(callback, delay) {
    const saved = useRef(callback);
    saved.current = callback;

    useEffect(() => {
        if (delay === null || delay === undefined || delay === false) return undefined;
        const id = setInterval(() => saved.current(), Math.max(0, delay));
        return () => clearInterval(id);
    }, [delay]);
}
