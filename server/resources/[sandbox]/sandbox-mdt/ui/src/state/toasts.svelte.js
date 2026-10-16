/** Short results of actions inside the terminal ("Report saved", "Could not save the report"). */
export const toasts = $state({ list: [] });

let next = 1;

function push(type, message, duration = 4000) {
    const id = next++;
    toasts.list = [...toasts.list.slice(-3), { id, type, message }];
    setTimeout(() => {
        toasts.list = toasts.list.filter((t) => t.id !== id);
    }, duration);
}

export const toast = {
    success: (m) => push('success', m),
    error: (m) => push('error', m, 6000),
    info: (m) => push('info', m),
};
