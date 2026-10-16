import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Preview-only navigation hook. scripts/preview.mjs can only post window
 * messages, so a scenario selects a page with a raw message
 * `{ "raw": { "previewRoute": "/players" } }`. It has no `type`, so NuiBridge
 * never dispatches it and it is not part of the Lua contract.
 */
export default function PreviewRouteListener() {
    const navigate = useNavigate();
    useEffect(() => {
        const onMessage = (e) => {
            const route = e.data?.previewRoute;
            if (typeof route === 'string' && route.startsWith('/')) navigate(route);
        };
        window.addEventListener('message', onMessage);
        return () => window.removeEventListener('message', onMessage);
    }, [navigate]);
    return null;
}
