import React from 'react';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import { Icon, colors } from '@sandbox/ui-kit';
import RingGauge from './RingGauge.jsx';
import { useTicker } from '../../hooks/useTicker.js';

/** Remaining fraction (0..1) for a timed buff: val is the duration in seconds, startTime a cloud epoch. */
function timedRemaining(buff, now) {
    const elapsed = Math.floor(now / 1000) - (buff.startTime ?? Math.floor(now / 1000));
    const total = Number(buff.val) || 0;
    if (total <= 0) return 0;
    return Math.max(0, Math.min(1, (total - Math.max(0, elapsed - 1)) / total));
}

function BuffTile({ buff, def, fraction }) {
    const override = buff.override ? String(buff.override) : null;
    return (
        <Box
            sx={{
                width: 34,
                height: 34,
                borderRadius: '8px',
                background: 'rgba(15, 18, 24, 0.6)',
                border: `1px solid ${colors.border}`,
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                position: 'relative',
                display: 'grid',
                placeItems: 'center',
                color: colors.text,
                fontSize: 13,
                overflow: 'hidden',
                flexShrink: 0,
            }}
        >
            {override ? (
                <Box className="sb-mono" sx={{ fontSize: override.length > 2 ? 9.5 : 11, fontWeight: 700 }}>
                    {override}
                </Box>
            ) : (
                <Icon icon={def.icon} />
            )}
            {fraction !== null && (
                <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, background: 'rgba(255,255,255,0.1)' }}>
                    <Box
                        sx={{
                            height: '100%',
                            width: `${fraction * 100}%`,
                            background: def.color || colors.accent,
                            transition: 'width 500ms linear',
                        }}
                    />
                </Box>
            )}
            {fraction === null && (
                <Box sx={{ position: 'absolute', left: 6, right: 6, bottom: 0, height: 2, background: def.color || colors.text2, opacity: 0.8 }} />
            )}
        </Box>
    );
}

function BuffRing({ buff, def, fraction }) {
    const override = buff.override ? String(buff.override) : null;
    return (
        <RingGauge size={44} stroke={4} value={(fraction ?? 1) * 100} color={def.color || colors.accent}>
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
                {override ? (
                    <Box className="sb-mono" sx={{ fontSize: 10, fontWeight: 700 }}>
                        {override}
                    </Box>
                ) : (
                    <Icon icon={def.icon} />
                )}
            </Box>
        </RingGauge>
    );
}

/**
 * Active buffs. `variant` = 'tile' (default) or 'ring' (condensed layout).
 * Timed buffs disappear on their own once their duration has elapsed.
 */
export default function Buffs({ variant = 'tile', sx }) {
    const buffDefs = useSelector((s) => s.status.buffDefs);
    const buffs = useSelector((s) => s.status.buffs);
    const now = useTicker(1000, buffs.some((b) => buffDefs[b?.buff]?.type === 'timed'));

    const items = buffs
        .map((buff) => {
            const def = buff && buffDefs[buff.buff];
            if (!def) return null;
            let fraction = null;
            if (def.type === 'timed') {
                fraction = timedRemaining(buff, now);
                if (fraction <= 0) return null;
            } else if (def.type === 'value') {
                fraction = Math.max(0, Math.min(1, (Number(buff.val) || 0) / 100));
            }
            return { buff, def, fraction };
        })
        .filter(Boolean);

    if (!items.length) return null;
    const Tile = variant === 'ring' ? BuffRing : BuffTile;
    return (
        <Box sx={{ display: 'flex', gap: '6px', flexWrap: 'wrap-reverse', ...sx }}>
            {items.map(({ buff, def, fraction }, i) => (
                <Tile key={`${buff.buff}-${i}`} buff={buff} def={def} fraction={fraction} />
            ))}
        </Box>
    );
}
