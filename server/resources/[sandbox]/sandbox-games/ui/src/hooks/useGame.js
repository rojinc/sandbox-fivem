import { useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitResult } from '../lib/result.js';

/**
 * Everything a game component needs: the Lua params, whether the game is
 * over, and the two ways to end it. Results go through submitResult so Lua
 * hears exactly one Minigame:Finish per game.
 */
export function useGame() {
    const dispatch = useDispatch();
    const game = useSelector((s) => s.game.game);
    const session = useSelector((s) => s.game.session);
    const finished = useSelector((s) => s.game.finished);
    const failed = useSelector((s) => s.game.failed);
    const over = finished || failed;
    const overRef = useRef(over);
    overRef.current = over;

    const hasPerfect = Boolean(game?.events?.onPerfect);

    const submit = useCallback(
        (state, extra) => {
            if (overRef.current) return false;
            const ok = submitResult(dispatch, session, state, extra);
            if (ok) overRef.current = true;
            return ok;
        },
        [dispatch, session],
    );

    const succeed = useCallback((perfect = false, extra) => submit(perfect && hasPerfect ? 2 : 1, extra), [submit, hasPerfect]);
    const fail = useCallback((extra) => submit(0, extra), [submit]);

    return { game, session, finished, failed, over, hasPerfect, succeed, fail };
}
