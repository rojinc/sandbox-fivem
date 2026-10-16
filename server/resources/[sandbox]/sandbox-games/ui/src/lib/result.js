import { fetchNui } from '@sandbox/ui-kit';
import { play, stopTick } from './sounds.js';

let claimedSession = -1;

/**
 * Report the outcome of the current game to Lua exactly once per session.
 * state: 0 fail, 1 success, 2 perfect. Extra fields are merged into the Lua
 * event payload, so callers keep them minimal.
 */
export function submitResult(dispatch, session, state, extra = {}) {
    if (claimedSession === session) return false;
    claimedSession = session;
    stopTick();
    fetchNui('Minigame:Finish', { state, ...extra });
    play(state === 0 ? 'negative' : 'positive');
    dispatch({ type: state === 0 ? 'FAIL_GAME' : 'FINISH_GAME' });
    return true;
}
