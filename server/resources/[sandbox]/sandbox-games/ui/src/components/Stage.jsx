import React from 'react';
import Box from '@mui/material/Box';

/**
 * Full-screen, click-through layer that centres a widget (or parks it near
 * the bottom for the skill bar). Only the widget itself takes pointer events.
 */
export function Stage({ anchor = 'center', children }) {
    return (
        <Box
            sx={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                alignItems: anchor === 'bottom' ? 'flex-end' : 'center',
                justifyContent: 'center',
                pb: anchor === 'bottom' ? '11vh' : 0,
                pointerEvents: 'none',
            }}
        >
            <Box className="sb-anim-rise" sx={{ pointerEvents: 'auto', maxWidth: '96vw', maxHeight: '94vh' }}>
                {children}
            </Box>
        </Box>
    );
}

export default Stage;
