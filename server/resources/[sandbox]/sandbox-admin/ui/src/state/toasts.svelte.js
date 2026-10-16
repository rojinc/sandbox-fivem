/** Short results of staff actions, shown bottom right of the console. */
export const toasts = $state({ items: [] });

let seq = 0;

export function toast(type, message, ttl = type === 'error' ? 6000 : 3500) {
    const id = ++seq;
    toasts.items = [...toasts.items.slice(-2), { id, type, message: String(message ?? '') }];
    setTimeout(() => dismiss(id), ttl);
    return id;
}

export function dismiss(id) {
    toasts.items = toasts.items.filter((t) => t.id !== id);
}

/** Report a { ok, message } result from lib/api.js readResult. */
export function report(result) {
    toast(result.ok ? 'success' : 'error', result.message);
}
