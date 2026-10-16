/**
 * Values the server passed with deferrals.handover() during playerConnecting.
 * They are on window.nuiHandoverData before the page scripts run; every key is
 * optional (the call is currently commented out in sandbox-queue, so the
 * generic welcome is what players see in production).
 */
function normalise(raw) {
    const h = raw && typeof raw === 'object' ? raw : {};
    const name = typeof h.name === 'string' ? h.name.trim() : '';
    const priority = Math.max(0, Math.floor(Number(h.priority) || 0));
    const priorityMessage = typeof h.priorityMessage === 'string' ? h.priorityMessage.trim() : '';
    return { name: name || null, priority, priorityMessage };
}

function readWindow() {
    try {
        return normalise(window.nuiHandoverData);
    } catch {
        return normalise(null);
    }
}

export const handover = $state(readWindow());

/** Preview hook (HANDOVER message); the game never calls this. */
export function setHandover(raw) {
    Object.assign(handover, normalise(raw));
}
