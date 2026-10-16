/**
 * Text message threads. Lua answers Messages:InitLoad with true and pushes
 * the threads separately as SET_MESSAGE_THREADS.
 */
export const messages = $state({
    loaded: false,
    loading: false,
    failed: false,
    threads: null, // [{ id, owner, number, method, time, count, message, unread }]
    listeners: 0,
});

/** Subscribers for RECEIVED_NEW_MESSAGE (the open conversation). */
const incoming = new Set();

export function onIncomingMessage(fn) {
    incoming.add(fn);
    return () => incoming.delete(fn);
}

export function receivedMessage(m) {
    for (const fn of incoming) fn(m);
}

export function setThreads(threads) {
    const list = Array.isArray(threads) ? threads : Object.values(threads ?? {});
    // The server's per-thread unread flag belongs to one arbitrary row, so start every thread as read (old behaviour).
    messages.threads = list.filter(Boolean).map((t) => ({ ...t, unread: 0 }));
}

export function updateThreadIfExists(thread) {
    if (!messages.loaded || !messages.threads || !thread) return;
    const t = messages.threads.find((x) => x.number == thread.number);
    if (t) Object.assign(t, thread, { count: (Number(t.count) || 0) + 1, unread: (Number(t.unread) || 0) + 1 });
    else messages.threads.push({ ...thread, count: 1, unread: 1 });
}

export function upsertThread(number, patch) {
    if (!messages.threads) messages.threads = [];
    const t = messages.threads.find((x) => x.number == number);
    if (t) Object.assign(t, patch);
    else messages.threads.push({ number, count: 1, unread: 0, ...patch });
}

export function removeThread(number) {
    if (messages.threads) messages.threads = messages.threads.filter((t) => t.number != number);
}

export function clearUnread(number) {
    const t = messages.threads?.find((x) => x.number == number);
    if (t) t.unread = 0;
}

export function resetMessages() {
    messages.loaded = false;
    messages.loading = false;
    messages.failed = false;
    messages.threads = null;
}
