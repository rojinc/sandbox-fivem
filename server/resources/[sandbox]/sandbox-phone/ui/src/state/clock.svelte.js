/** A shared one-second tick for call timers and "time ago" labels. */
export const clock = $state({ now: Date.now() });

let timer = null;
export function startClock() {
    if (timer) return;
    timer = setInterval(() => (clock.now = Date.now()), 1000);
}
