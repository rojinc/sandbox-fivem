import React from 'react';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import { colors } from '@sandbox/ui-kit';

/** Cinematic letterbox shown while appraising a gem (Hud.GemTable:Open quality). */
export default function GemTable() {
    const { showing, info } = useSelector((s) => s.gemTable);
    const bar = {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 140,
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };
    return (
        <Fade in={showing} mountOnEnter unmountOnExit>
            <Box sx={{ position: 'absolute', inset: 0 }}>
                <Box sx={{ ...bar, top: 0 }}>
                    <Box sx={{ fontSize: 28, fontWeight: 600, letterSpacing: 1 }}>SAGMA Gem Table</Box>
                </Box>
                <Box sx={{ ...bar, bottom: 0, flexDirection: 'column', gap: '4px' }}>
                    <Box sx={{ fontSize: 12, color: colors.text3, textTransform: 'uppercase', letterSpacing: 1 }}>Appraised quality</Box>
                    <Box className="sb-mono" sx={{ fontSize: 34, fontWeight: 700, color: colors.accent }}>
                        {info ?? '--'}%
                    </Box>
                </Box>
            </Box>
        </Fade>
    );
}
