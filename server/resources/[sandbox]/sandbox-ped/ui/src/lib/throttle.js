/**
 * Rate-limit live previews sent to the game while a slider is dragged:
 * push(v) sends at most once per `wait` ms and keeps the latest value for a
 * trailing send; flush(v) sends v now unless it was the last value sent.
 */
export function throttled(fn, wait = 60) {
    let last = 0;
    let timer = null;
    let pending;
    let hasPending = false;
    let sent;

    const send = (v) => {
        last = Date.now();
        sent = v;
        hasPending = false;
        fn(v);
    };

    return {
        push(v) {
            const elapsed = Date.now() - last;
            clearTimeout(timer);
            if (elapsed >= wait) {
                send(v);
                return;
            }
            pending = v;
            hasPending = true;
            timer = setTimeout(() => hasPending && send(pending), wait - elapsed);
        },
        flush(v) {
            clearTimeout(timer);
            hasPending = false;
            if (v !== sent) send(v);
        },
    };
}
