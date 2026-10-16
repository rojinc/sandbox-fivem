import React from 'react';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import { colors } from '@sandbox/ui-kit';

/** Street / cross street / area readout with the heading letter. */
export default function Compass({ width = 255 }) {
    const config = useSelector((s) => s.hud.config);
    const showing = useSelector((s) => s.location.showing);
    const location = useSelector((s) => s.location.location);
    const blindfolded = useSelector((s) => s.app.blindfolded);

    if (!showing || blindfolded) return null;
    const bare = config.hideCompassBg;

    return (
        <Box
            className={bare ? 'sb-overworld' : undefined}
            sx={{
                display: 'flex',
                alignItems: 'stretch',
                minWidth: width,
                maxWidth: 360,
                height: 50,
                borderRadius: '10px',
                background: bare ? 'transparent' : 'rgba(15, 18, 24, 0.6)',
                border: bare ? '1px solid transparent' : `1px solid ${colors.border}`,
                backdropFilter: bare ? 'none' : 'blur(12px)',
                WebkitBackdropFilter: bare ? 'none' : 'blur(12px)',
                overflow: 'hidden',
            }}
        >
            <Box
                className="sb-mono"
                sx={{
                    width: 42,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 18,
                    fontWeight: 700,
                    color: colors.accent,
                    background: bare ? 'transparent' : colors.accentSoft,
                    borderRight: bare ? 'none' : `1px solid ${colors.border}`,
                    flexShrink: 0,
                }}
            >
                {location.direction || '-'}
            </Box>
            <Box sx={{ minWidth: 0, px: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '6px', minWidth: 0 }}>
                    <Box className="sb-truncate" sx={{ fontSize: 15, fontWeight: 600, lineHeight: 1.2 }}>
                        {location.main}
                    </Box>
                    {location.cross && !config.hideCrossStreet && (
                        <Box className="sb-truncate" sx={{ fontSize: 12.5, color: colors.text2, lineHeight: 1.2 }}>
                            <Box component="span" sx={{ color: colors.accent, mr: '5px' }}>
                                ·
                            </Box>
                            {location.cross}
                        </Box>
                    )}
                </Box>
                <Box
                    className="sb-truncate"
                    sx={{ fontSize: 11.5, fontWeight: 500, color: colors.text2, letterSpacing: 0.8, textTransform: 'uppercase', mt: '3px' }}
                >
                    {location.area}
                </Box>
            </Box>
        </Box>
    );
}
