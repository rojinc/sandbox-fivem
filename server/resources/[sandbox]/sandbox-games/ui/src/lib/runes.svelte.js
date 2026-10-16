/**
 * Timing helpers for the games. Each one must be called while a component
 * initialises: it registers an $effect that starts and stops with its
 * `active` / `delay` getter and is torn down when the game unmounts.
 */

const off = (d) => d === null || d === undefined || d === false;

/**
 * requestAnimationFrame loop: cb(elapsedMs, deltaMs). `elapsed` restarts
 * from 0 every time `active()` turns true.
 */
export function useRaf(cb, active) {
    $effect(() => {
        if (!active()) return undefined;
        let id = 0;
        let stopped = false;
        const start = performance.now();
        let last = start;
        const frame = () => {
            if (stopped) return;
            const now = performance.now();
            const dt = now - last;
            last = now;
            cb(now - start, dt);
            if (!stopped) id = requestAnimationFrame(frame);
        };
        id = requestAnimationFrame(frame);
        return () => {
            stopped = true;
            cancelAnimationFrame(id);
        };
    });
}

/** setInterval while `delay()` returns a number; null / false pauses it. */
export function useInterval(cb, delay) {
    $effect(() => {
        const d = delay();
        if (off(d)) return undefined;
        const id = setInterval(cb, Math.max(0, d));
        return () => clearInterval(id);
    });
}

/** setTimeout armed while `delay()` returns a number; it re-arms when the delay changes. */
export function useTimeout(cb, delay) {
    $effect(() => {
        const d = delay();
        if (off(d)) return undefined;
        const id = setTimeout(cb, Math.max(0, d));
        return () => clearTimeout(id);
    });
}

export const STAGE_MS = 4000;

/**
 * The opening every game shares:
 *   `stages` x 4 s of "bypass" stages (hacking games only)
 *   -> countdown n, n-1, ..., 1, Go (1 s each; a negative countdown skips it)
 *   -> play
 */
export class Phases {
    stage = $state(0);
    count = $state(0);
    stages = 0;

    constructor({ stages = 0, countdown = 5 } = {}) {
        this.stages = stages;
        this.count = countdown;
        $effect(() => {
            if (this.stage < this.stages) {
                const id = setTimeout(() => (this.stage += 1), STAGE_MS);
                return () => clearTimeout(id);
            }
            if (this.count >= 0) {
                const id = setTimeout(() => (this.count -= 1), 1000);
                return () => clearTimeout(id);
            }
            return undefined;
        });
    }

    get phase() {
        return this.stage < this.stages ? 'stage' : this.count >= 0 ? 'countdown' : 'play';
    }

    get playing() {
        return this.phase === 'play';
    }
}
