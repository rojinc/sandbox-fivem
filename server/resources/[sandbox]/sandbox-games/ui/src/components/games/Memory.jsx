import React, { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import { colors, radius } from '@sandbox/ui-kit';
import { Stage } from '../Stage.jsx';
import { GameFrame } from '../GameFrame.jsx';
import { Countdown, ResultOverlay } from '../Overlays.jsx';
import { Counter, Strikes, TimeReadout, TimerBar } from '../Bits.jsx';
import { useGame } from '../../hooks/useGame.js';
import { usePhases } from '../../hooks/usePhases.js';
import { useRaf } from '../../hooks/useRaf.js';
import { clamp, countdownOf, range, shuffle, toNumber } from '../../lib/random.js';
import { play } from '../../lib/sounds.js';

/**
 * Memory: `difficulty` cells of a rows x cols grid light up for `timer` ms;
 * then click them all within `limit` ms. `errors` wrong cells fail. No wrong
 * cell is a perfect result.
 */
export default function Memory({ game }) {
    const { over, finished, failed, succeed, fail } = useGame();
    const cols = clamp(Math.floor(toNumber(game.cols, 3)), 1, 12);
    const rows = clamp(Math.floor(toNumber(game.rows, 3)), 1, 12);
    const total = cols * rows;
    const active = clamp(Math.floor(toNumber(game.difficulty, 3)), 1, total);
    const errors = Math.max(1, Math.floor(toNumber(game.errors, 1)));
    const preview = toNumber(game.timer, 0);
    const limit = toNumber(game.limit, 0);

    const [targets] = useState(() => shuffle(range(total, 1)).slice(0, active));
    const { playing, count } = usePhases({ countdown: countdownOf(game) });
    const [previewing, setPreviewing] = useState(true);
    const [clicked, setClicked] = useState([]);
    const [time, setTime] = useState(0);
    const [time2, setTime2] = useState(0);
    const timeRef = useRef(0);
    const time2Ref = useRef(0);

    const strikes = clicked.filter((c) => !targets.includes(c)).length;
    const found = clicked.filter((c) => targets.includes(c)).length;
    const done = found >= active || strikes >= errors;

    useRaf((_, dt) => {
        if (previewing) {
            time2Ref.current += dt;
            setTime2(time2Ref.current);
            if (time2Ref.current > preview) setPreviewing(false);
            return;
        }
        timeRef.current += dt;
        setTime(timeRef.current);
        if (limit && timeRef.current > limit) fail();
    }, playing && !over && !done);

    useEffect(() => {
        if (!done || !playing) return;
        if (found >= active && strikes < errors) succeed(strikes === 0);
        else fail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [done]);

    const click = (cell) => {
        if (!playing || previewing || over || done || clicked.includes(cell)) return;
        play('beep');
        setClicked((c) => [...c, cell]);
    };

    const cell = clamp(Math.floor(560 / Math.max(cols, rows)), 36, 64);
    const clickable = playing && !previewing && !over && !done;

    return (
        <Stage>
            <GameFrame
                icon="brain"
                title="Memory"
                subtitle={previewing ? 'Memorise the highlighted tiles' : 'Select the tiles you saw'}
                aside={
                    <>
                        <Counter value={found} total={active} label="Found" />
                        {limit > 0 && !previewing && <TimeReadout elapsed={time} total={limit} label="Time left" />}
                    </>
                }
            >
                <Strikes total={errors} used={strikes} sx={{ mb: 1.5 }} />
                <TimerBar elapsed={time} total={limit} idle={!playing || previewing || limit <= 0} sx={{ mb: 1.5 }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, ${cell}px)`, gap: 0.75, justifyContent: 'center' }}>
                    {range(total, 1).map((i) => {
                        const isTarget = targets.includes(i);
                        const isClicked = clicked.includes(i);
                        const show = playing && previewing && isTarget;
                        const state = isClicked ? (isTarget ? 'hit' : 'wrong') : show ? 'preview' : 'idle';
                        const styles = {
                            idle: { background: 'rgba(255,255,255,0.05)', borderColor: colors.border },
                            preview: { background: colors.infoSoft, borderColor: colors.info, boxShadow: `0 0 14px ${colors.infoSoft}` },
                            hit: { background: colors.successSoft, borderColor: colors.success },
                            wrong: { background: colors.dangerSoft, borderColor: colors.danger },
                        }[state];
                        return (
                            <Box
                                key={i}
                                onMouseDown={() => click(i)}
                                sx={{
                                    width: cell,
                                    height: cell,
                                    borderRadius: `${radius.sm}px`,
                                    border: '1px solid',
                                    cursor: clickable && !isClicked ? 'pointer' : 'default',
                                    transition: 'background 150ms var(--sb-ease), border-color 150ms var(--sb-ease)',
                                    ...styles,
                                    ...(clickable && !isClicked ? { '&:hover': { borderColor: colors.borderStrong, background: 'rgba(255,255,255,0.09)' } } : {}),
                                }}
                            />
                        );
                    })}
                </Box>
                <TimerBar
                    elapsed={time2}
                    total={preview}
                    color={colors.info}
                    height={4}
                    idle={!playing || !previewing || preview <= 0}
                    sx={{ mt: 1.5 }}
                />
                {!playing && <Countdown count={count} label="Preparing device" />}
                <ResultOverlay finished={finished} failed={failed} />
            </GameFrame>
        </Stage>
    );
}
