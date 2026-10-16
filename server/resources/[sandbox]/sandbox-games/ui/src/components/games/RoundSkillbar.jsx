import React, { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Panel, Kbd, colors, useKey } from '@sandbox/ui-kit';
import { Stage } from '../Stage.jsx';
import { BigKey } from '../Bits.jsx';
import { useGame } from '../../hooks/useGame.js';
import { useRaf } from '../../hooks/useRaf.js';
import { pick, randInt, toNumber } from '../../lib/random.js';
import { KEYMAP, bothCases } from '../../lib/keys.js';

const SIZE = 236;
const R = 90;
const C = 2 * Math.PI * R;
const NEEDLE_RAD = 0.1;

/**
 * Round skill check: a needle sweeps the ring at `rate` degrees per 10 ms;
 * press the shown key while it is inside the window (difficulty/10 rad long,
 * starting at a random 2.0..4.0 rad). Any other key of E Q R 1 2 3 4 fails.
 */
export default function RoundSkillbar({ game }) {
    const { over, finished, failed, succeed, fail } = useGame();
    const rate = Math.max(0.01, toNumber(game.rate, 1));
    const difficulty = Math.max(2, toNumber(game.difficulty, 2));
    const [setup] = useState(() => {
        const key = game.randomKey ? pick(['1', '2', '3']) : 'e';
        const start = randInt(20, 40) / 10;
        return { key, start, end: start + difficulty / 10 };
    });
    const [deg, setDeg] = useState(0);
    const degRef = useRef(0);
    const pressed = useRef(false);

    useRaf((elapsed) => {
        const d = (elapsed / 10) * rate;
        degRef.current = d;
        setDeg(Math.min(360, d));
        if (d + rate > 360) {
            pressed.current = true;
            fail();
        }
    }, !over);

    const startDeg = (setup.start * 180) / Math.PI;
    const lenDeg = ((setup.end - setup.start) * 180) / Math.PI;

    useKey(bothCases(setup.key), (e) => {
        if (e.repeat || pressed.current || over) return;
        pressed.current = true;
        const d = degRef.current;
        if (d >= startDeg && d <= startDeg + lenDeg + 5) succeed(false);
        else fail();
    });

    useKey(
        KEYMAP.filter((k) => k !== setup.key).flatMap(bothCases),
        (e) => {
            if (e.repeat || pressed.current || over) return;
            pressed.current = true;
            fail();
        },
    );

    const windowColor = finished ? colors.success : failed ? colors.danger : colors.info;
    const keyLabel = setup.key.toUpperCase();

    return (
        <Stage>
            <Panel padding={18} sx={{ width: 292, textAlign: 'center' }}>
                <Box sx={{ position: 'relative', width: SIZE, height: SIZE, mx: 'auto' }}>
                    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ display: 'block' }}>
                        <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={14} />
                        <circle
                            cx={SIZE / 2}
                            cy={SIZE / 2}
                            r={R}
                            fill="none"
                            stroke={windowColor}
                            strokeWidth={14}
                            strokeDasharray={`${(C * lenDeg) / 360} ${C}`}
                            transform={`rotate(${startDeg - 90} ${SIZE / 2} ${SIZE / 2})`}
                            style={{ transition: 'stroke 160ms var(--sb-ease)' }}
                        />
                        <circle
                            cx={SIZE / 2}
                            cy={SIZE / 2}
                            r={R}
                            fill="none"
                            stroke={colors.text}
                            strokeWidth={24}
                            strokeDasharray={`${R * NEEDLE_RAD} ${C}`}
                            transform={`rotate(${deg - 90 - (NEEDLE_RAD * 180) / Math.PI} ${SIZE / 2} ${SIZE / 2})`}
                        />
                    </svg>
                    <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                        <BigKey size={60} active={!over} tone={finished ? colors.success : failed ? colors.danger : colors.text}>
                            {keyLabel}
                        </BigKey>
                    </Box>
                </Box>
                <Typography variant="body2" sx={{ color: colors.text2, mt: 1.5 }}>
                    {finished ? (
                        <Box component="span" sx={{ color: colors.success, fontWeight: 600 }}>
                            Success
                        </Box>
                    ) : failed ? (
                        <Box component="span" sx={{ color: colors.danger, fontWeight: 600 }}>
                            Missed
                        </Box>
                    ) : (
                        <>
                            Press <Kbd>{keyLabel}</Kbd> inside the blue zone
                        </>
                    )}
                </Typography>
            </Panel>
        </Stage>
    );
}
