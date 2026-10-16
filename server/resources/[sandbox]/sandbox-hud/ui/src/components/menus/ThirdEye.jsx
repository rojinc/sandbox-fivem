import React from 'react';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import { Icon, fetchNui, useKey, colors } from '@sandbox/ui-kit';

/** Targeting reticle + context options at screen centre (client/events.lua Targeting:*). */
export default function ThirdEye() {
    const { showing, icon, menuOpen, menu } = useSelector((s) => s.thirdEye);
    const close = () => fetchNui('targetingAction', false);
    const pick = (b) => fetchNui('targetingAction', { event: b.event, data: b.data });

    useKey(['Escape', 'Backspace'], close, { enabled: showing && menuOpen });

    return (
        <Fade in={showing} mountOnEnter unmountOnExit>
            <Box sx={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
                <Box
                    sx={{
                        width: 44,
                        height: 44,
                        display: 'grid',
                        placeItems: 'center',
                        color: icon ? colors.accent : colors.text,
                        fontSize: icon ? 26 : 8,
                        transition: 'font-size 160ms var(--sb-ease), color 160ms',
                        filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.7))',
                    }}
                >
                    <Icon icon={icon || 'circle'} />
                </Box>
                <Fade in={menuOpen && menu.length > 0} mountOnEnter unmountOnExit>
                    <Box
                        className="sb-glass-strong"
                        sx={{
                            position: 'absolute',
                            left: 54,
                            top: 0,
                            minWidth: 190,
                            borderRadius: '10px',
                            py: '4px',
                            pointerEvents: 'auto',
                        }}
                    >
                        {menu.map((b, i) => (
                            <Box
                                key={i}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    pick(b);
                                }}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    px: '12px',
                                    py: '8px',
                                    fontSize: 13.5,
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    transition: 'background 120ms var(--sb-ease), color 120ms',
                                    '&:hover': { background: colors.surfaceHover, color: colors.accent },
                                }}
                            >
                                <Box sx={{ width: 16, textAlign: 'center', color: colors.text2, fontSize: 12 }}>
                                    {b.icon && <Icon icon={b.icon} />}
                                </Box>
                                {b.text}
                            </Box>
                        ))}
                    </Box>
                </Fade>
            </Box>
        </Fade>
    );
}
