/**
 * Dialogs drawn inside the phone screen register here so Escape closes the
 * top one before it closes the phone, and CLEAR_HISTORY closes them all.
 */
const open = [];

export function pushSheet(id, onclose) {
    popSheet(id);
    open.push({ id, onclose });
}

export function popSheet(id) {
    const i = open.findIndex((s) => s.id === id);
    if (i >= 0) open.splice(i, 1);
}

/** Close the top dialog. Returns true when there was one. */
export function closeTopSheet() {
    const top = open.pop();
    if (!top) return false;
    top.onclose?.();
    return true;
}

export function closeSheet() {
    while (open.length) open.pop().onclose?.();
}
