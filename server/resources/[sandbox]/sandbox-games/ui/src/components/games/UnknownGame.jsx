import React from 'react';
import Typography from '@mui/material/Typography';
import { Panel, colors } from '@sandbox/ui-kit';
import { Stage } from '../Stage.jsx';
import { useGame } from '../../hooks/useGame.js';
import { useTimeout } from '../../hooks/useTimeout.js';

/** A `type` this UI does not implement: fail it so Lua releases focus. */
export default function UnknownGame({ game }) {
    const { over, fail } = useGame();
    useTimeout(() => fail(), !over ? 600 : null);
    return (
        <Stage>
            <Panel sx={{ width: 320 }}>
                <Typography variant="h5">Unsupported minigame</Typography>
                <Typography variant="body2" sx={{ color: colors.text2, mt: 0.5 }}>
                    The game type "{String(game?.type)}" is not implemented in this UI.
                </Typography>
            </Panel>
        </Stage>
    );
}
