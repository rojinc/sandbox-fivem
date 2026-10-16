import React from 'react';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Slide from '@mui/material/Slide';
import { RichText, colors } from '@sandbox/ui-kit';

/** Top-centre information card (InfoOverlay:Show title, description). */
export default function InfoOverlay() {
    const { showing, info } = useSelector((s) => s.infoOverlay);
    return (
        <Slide direction="down" in={showing} mountOnEnter unmountOnExit>
            <Box sx={{ position: 'absolute', top: 24, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
                <Box className="sb-glass" sx={{ width: 420, borderRadius: '12px', p: '14px 18px' }}>
                    {info?.label && <Box sx={{ fontSize: 18, fontWeight: 600, mb: '4px' }}>{info.label}</Box>}
                    {info?.description && (
                        <Box sx={{ fontSize: 14, color: colors.text2, lineHeight: 1.5 }}>
                            <RichText text={info.description} component="div" />
                        </Box>
                    )}
                </Box>
            </Box>
        </Slide>
    );
}
