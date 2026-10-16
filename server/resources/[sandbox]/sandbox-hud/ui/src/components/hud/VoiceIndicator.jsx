import React from 'react';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import { Icon, colors } from '@sandbox/ui-kit';
import RingGauge from './RingGauge.jsx';

function activeColor(talking) {
    if (talking === 1) return colors.accent;
    if (talking === 2) return colors.info;
    return 'rgba(255,255,255,0.55)';
}

/** Three segments showing the proximity level; lights up gold when talking, blue on the radio. */
export function VoiceBars({ width = 255 }) {
    const level = useSelector((s) => s.hud.voip);
    const talking = useSelector((s) => s.hud.talking);
    const color = activeColor(talking);
    return (
        <Box sx={{ display: 'flex', gap: '4px', width, height: 5 }}>
            {[1, 2, 3].map((i) => (
                <Box
                    key={i}
                    sx={{
                        flex: 1,
                        borderRadius: 999,
                        background: level >= i ? color : 'rgba(255,255,255,0.12)',
                        boxShadow: level >= i && talking ? `0 0 8px ${color}` : 'none',
                        transition: 'background 160ms var(--sb-ease), box-shadow 160ms var(--sb-ease)',
                    }}
                />
            ))}
        </Box>
    );
}

/** Ring variant used by the condensed layout; shows the radio frequency when tuned in. */
export function VoiceCircle() {
    const level = useSelector((s) => s.hud.voip);
    const talking = useSelector((s) => s.hud.talking);
    const icon = useSelector((s) => s.hud.voipIcon);
    const maskRadio = useSelector((s) => s.hud.config.maskRadio);
    const radio = useSelector((s) => s.status.statuses.find((x) => x.name === 'radio-freq'));
    const freq = radio && Number(radio.value) > 0 ? radio.value : null;
    const color = activeColor(talking);
    return (
        <RingGauge size={44} stroke={4} value={(level / 3) * 100} color={color}>
            <Box
                sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(15, 18, 24, 0.85)',
                    display: 'grid',
                    placeItems: 'center',
                    color: colors.text,
                    fontSize: 12,
                }}
            >
                {freq && !maskRadio ? (
                    <Box className="sb-mono" sx={{ fontSize: 9.5, fontWeight: 600 }}>
                        {freq}
                    </Box>
                ) : (
                    <Icon icon={icon || 'microphone'} />
                )}
            </Box>
        </RingGauge>
    );
}
