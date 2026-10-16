import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Fade from '@mui/material/Fade';
import Box from '@mui/material/Box';
import { fetchNui, useKey } from '@sandbox/ui-kit';
import { submitResult } from './lib/result.js';
import { useTimeout } from './hooks/useTimeout.js';
import { GAMES } from './components/games/index.js';
import UnknownGame from './components/games/UnknownGame.jsx';

/** How long a result stays on screen before the widget fades and Lua gets Minigame:End. */
const RESULT_HOLD_MS = 2000;

export default function App() {
    const dispatch = useDispatch();
    const showing = useSelector((s) => s.game.showing);
    const game = useSelector((s) => s.game.game);
    const session = useSelector((s) => s.game.session);
    const finished = useSelector((s) => s.game.finished);
    const failed = useSelector((s) => s.game.failed);
    const over = finished || failed;

    // The session currently fading out; a new SHOW_GAME simply starts a new one.
    const [exiting, setExiting] = useState(0);
    const visible = showing && exiting !== session;

    useTimeout(() => setExiting(session), showing && over ? RESULT_HOLD_MS : null);

    const onExited = useCallback(() => {
        dispatch({ type: 'HIDE_GAME' });
        fetchNui('Minigame:End');
    }, [dispatch]);

    // Escape always leads somewhere: give up, which fails the game and releases focus.
    useKey(
        'Escape',
        () => {
            if (showing && !over) submitResult(dispatch, session, 0);
        },
        { enabled: showing },
    );

    if (!showing || !game) return null;
    const Game = GAMES[game.type] ?? UnknownGame;

    return (
        <Fade key={session} in={visible} appear timeout={{ enter: 200, exit: 250 }} onExited={onExited}>
            <Box sx={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
                <Game game={game} />
            </Box>
        </Fade>
    );
}
