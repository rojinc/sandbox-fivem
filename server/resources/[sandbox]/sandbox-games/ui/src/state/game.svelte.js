/**
 * The one game on screen. `session` increments on every SHOW_GAME so the game
 * component remounts with fresh state; `result` is null while playing, then
 * 'success' | 'perfect' | 'fail'.
 */
import { fetchNui } from '@sandbox/ui-kit/nui';
import { play, stopTick } from '../lib/sounds.js';

/** How long a result stays on screen, then the fade before Minigame:End. */
export const RESULT_HOLD_MS = 2000;
export const FADE_MS = 250;

export const game = $state({
    showing: false,
    params: null,
    session: 0,
    result: null,
    exiting: false,
});

let holdTimer = 0;
let fadeTimer = 0;

function clearTimers() {
    clearTimeout(holdTimer);
    clearTimeout(fadeTimer);
}

/** SHOW_GAME. A pending Minigame:End from the previous game is dropped: Lua already started this one. */
export function startGame(params) {
    if (!params || typeof params !== 'object' || !params.type) return;
    clearTimers();
    stopTick();
    game.params = params;
    game.session += 1;
    game.result = null;
    game.exiting = false;
    game.showing = true;
}

function scheduleExit() {
    const session = game.session;
    clearTimers();
    holdTimer = setTimeout(() => {
        if (game.session !== session) return;
        game.exiting = true;
        fadeTimer = setTimeout(() => {
            if (game.session !== session) return;
            game.showing = false;
            game.params = null;
            game.result = null;
            game.exiting = false;
            fetchNui('Minigame:End');
        }, FADE_MS);
    }, RESULT_HOLD_MS);
}

/**
 * Report the outcome to Lua exactly once per game.
 * state: 0 fail, 1 success, 2 perfect. Extra fields are merged into the Lua
 * event payload, so callers keep them minimal.
 */
export function finish(session, state, extra = {}) {
    if (!game.showing || game.session !== session || game.result !== null) return false;
    game.result = state === 0 ? 'fail' : state === 2 ? 'perfect' : 'success';
    stopTick();
    fetchNui('Minigame:Finish', { state, ...extra });
    play(state === 0 ? 'negative' : 'positive');
    scheduleExit();
    return true;
}

/** FAIL_GAME from Lua: it already fired onFail and dropped focus, so no Minigame:Finish. */
export function cancelGame() {
    if (!game.showing || game.result !== null) return;
    game.result = 'fail';
    stopTick();
    scheduleExit();
}

/**
 * Bound to the game that is mounting: late timers of a game that has been
 * replaced can never end the next one.
 */
export function control() {
    const session = game.session;
    const params = game.params ?? {};
    const hasPerfect = Boolean(params.events?.onPerfect);
    return {
        params,
        hasPerfect,
        succeed: (perfect = false, extra) => finish(session, perfect && hasPerfect ? 2 : 1, extra),
        fail: (extra) => finish(session, 0, extra),
    };
}
