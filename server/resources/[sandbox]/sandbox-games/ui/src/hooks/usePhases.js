import { useState } from 'react';
import { useInterval } from './useInterval.js';

export const STAGE_MS = 4000;

/**
 * The opening sequence every game shares:
 *   `stages` x 4 s of "bypass" theatre (0 for most games)
 *   -> countdown: n, n-1, ..., 1, Go (1 s each; countdown < 0 skips it)
 *   -> play
 */
export function usePhases({ stages = 0, countdown = 5, enabled = true } = {}) {
    const [stage, setStage] = useState(0);
    const [count, setCount] = useState(countdown);

    const inStages = stage < stages;
    useInterval(() => setStage((s) => s + 1), enabled && inStages ? STAGE_MS : null);
    useInterval(() => setCount((c) => c - 1), enabled && !inStages && count >= 0 ? 1000 : null);

    const phase = inStages ? 'stage' : count >= 0 ? 'countdown' : 'play';
    return { phase, stage, count, playing: phase === 'play' };
}
