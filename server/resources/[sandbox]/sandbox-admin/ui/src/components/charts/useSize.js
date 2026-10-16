import { useEffect, useState } from 'react';

/** Current pixel size of a container ref (ResizeObserver). */
export default function useSize(ref) {
    const [size, setSize] = useState({ width: 0, height: 0 });
    useEffect(() => {
        const el = ref.current;
        if (!el) return undefined;
        const update = () => {
            const r = el.getBoundingClientRect();
            setSize((prev) => (prev.width === r.width && prev.height === r.height ? prev : { width: r.width, height: r.height }));
        };
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, [ref]);
    return size;
}
