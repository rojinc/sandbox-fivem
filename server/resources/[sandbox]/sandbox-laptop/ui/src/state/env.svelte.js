/**
 * Viewport size (for the device zoom) and a shared one-second clock for
 * countdowns, expiry checks and relative times.
 */
export const env = $state({
    vw: typeof window === 'undefined' ? 1920 : window.innerWidth,
    vh: typeof window === 'undefined' ? 1080 : window.innerHeight,
    now: Date.now(),
});

/** The laptop is laid out at 1920x1080 and zoomed by this factor. */
export function zoom() {
    return Math.min(env.vw / 1920, env.vh / 1080);
}

let started = false;

export function startEnv() {
    if (started || typeof window === 'undefined') return;
    started = true;
    window.addEventListener('resize', () => {
        env.vw = window.innerWidth;
        env.vh = window.innerHeight;
    });
    setInterval(() => (env.now = Date.now()), 1000);
}
