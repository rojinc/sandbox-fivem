/** Shared 2 Hz clock for countdowns and timed buffs. */
export const clock = $state({ now: Date.now() });

if (typeof window !== 'undefined') {
    setInterval(() => {
        clock.now = Date.now();
    }, 500);
}
