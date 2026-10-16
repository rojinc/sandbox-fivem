import React from 'react';
import Box from '@mui/material/Box';
import { WINDOW } from '../../config.js';
import NavRail from './NavRail.jsx';
import TopBar from './TopBar.jsx';

/** The terminal window: nav rail on the left, top bar, scrollable content. */
export default function Shell({ children }) {
    return (
        <Box
            className="sb-glass-strong"
            sx={{
                width: WINDOW.width,
                height: WINDOW.height,
                maxWidth: 'calc(100vw - 48px)',
                maxHeight: 'calc(100vh - 48px)',
                borderRadius: 'var(--sb-radius-xl)',
                display: 'grid',
                gridTemplateColumns: '236px minmax(0, 1fr)',
                gridTemplateRows: '60px minmax(0, 1fr)',
                overflow: 'hidden',
                pointerEvents: 'auto',
            }}
        >
            <Box sx={{ gridRow: '1 / span 2', minHeight: 0 }}>
                <NavRail />
            </Box>
            <TopBar />
            <Box sx={{ minHeight: 0, p: 2.5, overflow: 'hidden' }}>{children}</Box>
        </Box>
    );
}
