import { useEffect, useRef } from 'react';

/** setTimeout that always sees the latest callback; `delay` null disarms it. */
export function useTimeout(callback, delay) {
    const saved = useRef(callback);
    saved.current = callback;

    useEffect(() => {
        if (delay === null || delay === undefined || delay === false) return undefined;
        const id = setTimeout(() => saved.current(), Math.max(0, delay));
        return () => clearTimeout(id);
    }, [delay]);
}
