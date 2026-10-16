import React, { useState } from 'react';
import Box from '@mui/material/Box';
import { colors, radius, useKey } from '@sandbox/ui-kit';
import { Stage } from '../Stage.jsx';
import { GameFrame } from '../GameFrame.jsx';
import { Countdown, ResultOverlay, StageBody } from '../Overlays.jsx';
import { KeyHint, TimeReadout, TimerBar } from '../Bits.jsx';
import { useGame } from '../../hooks/useGame.js';
import { usePhases } from '../../hooks/usePhases.js';
import { useRaf } from '../../hooks/useRaf.js';
import { useInterval } from '../../hooks/useInterval.js';
import { clamp, countdownOf, pick, randBelow, range, toNumber } from '../../lib/random.js';
import { CHARSETS, RANDOM_CHARSETS } from '../../lib/charsets.js';

const STAGES = 1;
const COLS = 10;
const SHIFT_MS = 1500;
const CELL_W = 54;
const CELL_H = 42;

/**
 * Pattern: a `size` x 10 grid of `difficulty2`-character cells hides a run
 * of `difficulty` consecutive cells (shown above). Move the cursor with
 * W A S D and confirm with Space / Enter within `limit` ms. The grid scrolls
 * one cell every 1.5 s.
 */
export default function Pattern({ game }) {
    const { over, finished, failed, succeed, fail } = useGame();
    const size = clamp(Math.floor(toNumber(game.size, 4)), 1, 10);
    const n = size * COLS;
    const difficulty = clamp(Math.floor(toNumber(game.difficulty, 4)), 1, n);
    const perCell = clamp(Math.floor(toNumber(game.difficulty2, 2)), 1, 4);
    const limit = toNumber(game.limit, 0);

    const [setup] = useState(() => {
        const charset = CHARSETS[game.total] ?? CHARSETS[pick(RANDOM_CHARSETS)];
        const start = randBelow(n);
        const cells = range(n).map((i) => ({
            id: i,
            text: range(perCell)
                .map(() => charset.charAt(randBelow(charset.length)))
                .join(''),
            isAnswer: (i - start + n) % n < difficulty,
        }));
        const answer = range(difficulty).map((k) => cells[(start + k) % n].text);
        return { cells, answer, selected: randBelow(n) };
    });

    const { phase, stage, count, playing } = usePhases({ stages: STAGES, countdown: countdownOf(game) });
    const [cells, setCells] = useState(setup.cells);
    const [selected, setSelected] = useState(setup.selected);
    const [time, setTime] = useState(0);
    const [submitted, setSubmitted] = useState(false);

    useInterval(() => setCells((c) => c.map((_, i, a) => a[(i + 1) % a.length])), !submitted && !over ? SHIFT_MS : null);

    useRaf((elapsed) => {
        setTime(elapsed);
        if (limit && elapsed > limit) fail();
    }, playing && !over && !submitted);

    const move = (v) => {
        if (!playing || over || submitted) return;
        setSelected((s) => (s + v + n) % n);
    };
    useKey(['w', 'W', 'ArrowUp'], () => move(-COLS));
    useKey(['s', 'S', 'ArrowDown'], () => move(COLS));
    useKey(['a', 'A', 'ArrowLeft'], () => move(-1));
    useKey(['d', 'D', 'ArrowRight'], () => move(1));
    useKey([' ', 'Enter'], (e) => {
        if (e.repeat || !playing || over || submitted) return;
        e.preventDefault();
        setSubmitted(true);
        const ok = range(difficulty).every((k) => cells[(selected + k) % n].isAnswer);
        if (ok) succeed(false);
        else fail();
    });

    const isSelected = (i) => (i - selected + n) % n < difficulty;
    const width = COLS * CELL_W + (COLS - 1) * 4 + 32;

    return (
        <Stage>
            <GameFrame
                icon="table-cells"
                title="Pattern"
                subtitle="Move the cursor onto the sequence and confirm"
                width={width}
                aside={playing && limit > 0 ? <TimeReadout elapsed={time} total={limit} label="Time left" /> : null}
            >
                {phase === 'stage' ? (
                    <StageBody stage={stage} icon="table-cells" texts={['Manual input required']} minHeight={size * (CELL_H + 4) + 120} />
                ) : (
                    <>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.75, mb: 1.5 }}>
                            {setup.answer.map((t, i) => (
                                <Box
                                    key={i}
                                    className="sb-mono"
                                    sx={{
                                        minWidth: CELL_W,
                                        height: 40,
                                        px: 1,
                                        borderRadius: `${radius.sm}px`,
                                        display: 'grid',
                                        placeItems: 'center',
                                        fontSize: 18,
                                        fontWeight: 600,
                                        color: colors.accent,
                                        background: colors.accentSoft,
                                        border: `1px solid ${colors.borderAccent}`,
                                    }}
                                >
                                    {playing ? t : ''}
                                </Box>
                            ))}
                        </Box>
                        <TimerBar elapsed={time} total={limit} idle={!playing || limit <= 0} sx={{ mb: 1.5 }} />
                        <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, ${CELL_W}px)`, gap: 0.5, justifyContent: 'center' }}>
                            {cells.map((c, i) => {
                                const sel = playing && isSelected(i);
                                return (
                                    <Box
                                        key={c.id}
                                        className="sb-mono"
                                        sx={{
                                            height: CELL_H,
                                            borderRadius: `${radius.xs}px`,
                                            display: 'grid',
                                            placeItems: 'center',
                                            fontSize: 16,
                                            fontWeight: 500,
                                            letterSpacing: 0.5,
                                            color: sel ? colors.accent : colors.text2,
                                            background: sel ? colors.accentSoft : 'rgba(255,255,255,0.04)',
                                            border: `1px solid ${sel ? colors.accent : 'transparent'}`,
                                            transition: 'background 120ms var(--sb-ease), color 120ms var(--sb-ease)',
                                        }}
                                    >
                                        {playing ? c.text : ''}
                                    </Box>
                                );
                            })}
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 1.5 }}>
                            <KeyHint keys={['W', 'A', 'S', 'D']}>Move cursor</KeyHint>
                            <KeyHint keys={['Space', 'Enter']}>Confirm</KeyHint>
                        </Box>
                    </>
                )}
                {phase === 'countdown' && <Countdown count={count} />}
                <ResultOverlay finished={finished} failed={failed} />
            </GameFrame>
        </Stage>
    );
}
