import { randRange } from './random.js';

/**
 * Linear drift between random points, as the original targets did:
 * destination in [10, w-100] x [10, h-100], duration from `durRange` x 100 ms.
 */
export function newLeg(from, bounds, durRange, now) {
    const to = {
        x: randRange(10, Math.max(11, bounds.w - 100)),
        y: randRange(10, Math.max(11, bounds.h - 100)),
    };
    return { from, to, t0: now, dur: randRange(durRange[0], durRange[1]) * 100 };
}

export function legPos(leg, now) {
    const t = leg.dur > 0 ? Math.min(1, (now - leg.t0) / leg.dur) : 1;
    return {
        x: leg.from.x + (leg.to.x - leg.from.x) * t,
        y: leg.from.y + (leg.to.y - leg.from.y) * t,
        done: t >= 1,
    };
}
