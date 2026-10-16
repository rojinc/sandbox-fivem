import React from 'react';
import { useSelector } from 'react-redux';
import Fade from '@mui/material/Fade';
import Box from '@mui/material/Box';
import { MODES } from './data/modes.js';
import { Customizer } from './components/Customizer.jsx';

/**
 * Root layer. Lua decides what is open through SET_STATE + APP_SHOW; the UI
 * hides itself once Save/Cancel have been acknowledged (see Customizer).
 */
export default function App() {
    const visible = useSelector((s) => s.app.visible);
    const state = useSelector((s) => s.app.state);
    const mode = MODES[state];

    return (
        <Fade in={visible && Boolean(mode)} unmountOnExit timeout={{ enter: 320, exit: 200 }}>
            <Box sx={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                {mode && <Customizer key={state} modeKey={state} />}
            </Box>
        </Fade>
    );
}
