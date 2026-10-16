import React, { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Panel, Kbd, Tag, colors, radius, useKey } from '@sandbox/ui-kit';
import { Stage } from '../Stage.jsx';
import { useGame } from '../../hooks/useGame.js';
import { useRaf } from '../../hooks/useRaf.js';
import { toNumber } from '../../lib/random.js';

/**
 * Skillbar: a bar fills over `timer` ms; press E while it is inside a window
 * of `difficulty` % that starts at a random 35..35+difficulty %.
 */
export default function Skillbar({ game }) {
    const { over, finished, failed, succeed, fail } = useGame();
    const timer = Math.max(100, toNumber(game.timer, 3000));
    const difficulty = Math.max(1, toNumber(game.difficulty, 10));
    const [chance] = useState(() => Math.floor(Math.random() * difficulty) + 35);
    const [pct, setPct] = useState(0);
    const pctRef = useRef(0);
    const pressed = useRef(false);

    useRaf((elapsed) => {
        if (elapsed > timer) {
            pressed.current = true;
            fail();
            return;
        }
        const p = Math.min(100, (elapsed / timer) * 100);
        pctRef.current = p;
        setPct(p);
    }, !over);

    useKey(['e', 'E'], (e) => {
        if (e.repeat || pressed.current || over) return;
        pressed.current = true;
        const p = Math.ceil(pctRef.current);
        if (p >= chance && p <= chance + difficulty) succeed(false);
        else fail();
    });

    const fill = finished ? colors.success : failed ? colors.danger : colors.accent;

    return (
        <Stage anchor="bottom">
            <Panel padding={14} sx={{ width: 520 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Kbd>E</Kbd>
                        <Typography variant="body2" sx={{ color: colors.text2 }}>
                            Press when the bar is inside the zone
                        </Typography>
                    </Box>
                    <Tag
                        tone={finished ? 'success' : failed ? 'danger' : 'neutral'}
                        icon={finished ? 'circle-check' : failed ? 'circle-xmark' : 'gauge-high'}
                    >
                        {finished ? 'Success' : failed ? 'Missed' : 'Skill check'}
                    </Tag>
                </Box>
                <Box
                    sx={{
                        position: 'relative',
                        height: 12,
                        borderRadius: `${radius.pill}px`,
                        background: 'rgba(255,255,255,0.1)',
                        overflow: 'hidden',
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: `${chance}%`,
                            width: `${difficulty}%`,
                            background: finished ? colors.successSoft : colors.accentSoft,
                            borderLeft: `1px solid ${finished ? colors.success : colors.accent}`,
                            borderRight: `1px solid ${finished ? colors.success : colors.accent}`,
                        }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: 0,
                            width: `${pct}%`,
                            background: fill,
                            opacity: 0.9,
                            borderRadius: `${radius.pill}px`,
                        }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            top: -2,
                            bottom: -2,
                            left: `calc(${pct}% - 1px)`,
                            width: 2,
                            background: colors.text,
                            boxShadow: `0 0 8px ${fill}`,
                        }}
                    />
                </Box>
            </Panel>
        </Stage>
    );
}
