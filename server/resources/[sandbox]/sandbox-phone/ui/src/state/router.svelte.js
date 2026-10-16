/**
 * In-phone navigation. Paths keep the old router's shape so notification
 * actions ("convo/555-0100", "view/12") resolve unchanged:
 *   /                     home screen
 *   /apps                 every installed app
 *   /apps/<app>/<a>/<b>   an app; the app reads the segments after its name
 */
export const route = $state({ stack: ['/'] });

export function current() {
    return route.stack[route.stack.length - 1] ?? '/';
}

export function parse(path = current()) {
    const parts = String(path || '/')
        .split('/')
        .filter(Boolean)
        .map((p) => decodeURIComponent(p));
    if (parts[0] !== 'apps') return { home: true, app: null, segs: [] };
    if (parts.length === 1) return { home: false, list: true, app: null, segs: [] };
    return { home: false, app: parts[1], segs: parts.slice(2) };
}

export function navigate(path, { replace = false } = {}) {
    const p = String(path || '/').startsWith('/') ? String(path || '/') : `/${path}`;
    if (replace && route.stack.length > 1) route.stack[route.stack.length - 1] = p;
    else if (current() !== p) route.stack.push(p);
}

/** Open an app (optionally at a sub view such as "convo/555-0100"). */
export function openApp(app, view = '') {
    const tail = String(view ?? '')
        .replace(/^#$/, '')
        .replace(/^\/+/, '');
    navigate(`/apps/${app}${tail ? `/${tail}` : ''}`);
}

export function back() {
    if (route.stack.length > 1) route.stack.pop();
}

export function home() {
    route.stack = ['/'];
}

export function encodeSeg(v) {
    return encodeURIComponent(String(v ?? ''));
}
