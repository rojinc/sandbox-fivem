/**
 * Minigame slice. Action types are the Lua message names (see ../../../CONTRACT.md):
 *   SHOW_GAME  { game }   Lua starts a game
 *   FAIL_GAME  {}         Lua cancelled the game (also dispatched by the UI on a failed result)
 * plus two UI-only actions:
 *   FINISH_GAME           the player passed
 *   HIDE_GAME             the result has been shown, the UI is gone
 *
 * `session` increments on every SHOW_GAME so components remount with fresh state.
 */
export const initialState = {
    showing: false,
    game: null,
    session: 0,
    finished: false,
    failed: false,
};

export default function gameReducer(state = initialState, action) {
    switch (action.type) {
        case 'SHOW_GAME': {
            const game = action.payload?.game;
            if (!game || typeof game !== 'object' || !game.type) return state;
            return {
                ...state,
                showing: true,
                game,
                session: state.session + 1,
                finished: false,
                failed: false,
            };
        }
        case 'FINISH_GAME':
            if (!state.showing || state.finished || state.failed) return state;
            return { ...state, finished: true, failed: false };
        case 'FAIL_GAME':
            if (!state.showing || state.finished || state.failed) return state;
            return { ...state, failed: true, finished: false };
        case 'HIDE_GAME':
            return { ...state, showing: false, game: null, finished: false, failed: false };
        default:
            return state;
    }
}

export const selectGame = (state) => state.game.game;
export const selectShowing = (state) => state.game.showing;
export const selectSession = (state) => state.game.session;
export const selectFinished = (state) => state.game.finished;
export const selectFailed = (state) => state.game.failed;
