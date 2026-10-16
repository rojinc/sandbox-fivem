/** Tiny toast bus: toast.success('…') from anywhere, rendered by <ToastHost/>. */
let id = 0;
const listeners = new Set();

function push(kind, message, opts = {}) {
    const item = { id: ++id, kind, message, duration: opts.duration ?? 3200 };
    listeners.forEach((l) => l(item));
    return item.id;
}

export const toast = {
    success: (m, o) => push('success', m, o),
    error: (m, o) => push('error', m, o),
    info: (m, o) => push('info', m, o),
    warning: (m, o) => push('warning', m, o),
    subscribe(fn) {
        listeners.add(fn);
        return () => listeners.delete(fn);
    },
};

export default toast;
