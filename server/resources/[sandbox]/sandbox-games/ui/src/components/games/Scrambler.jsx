import React, { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { colors } from '@sandbox/ui-kit';
import { Stage } from '../Stage.jsx';
import { GameFrame } from '../GameFrame.jsx';
import { Countdown, ResultOverlay } from '../Overlays.jsx';
import { Counter, PadKey, Strikes, TimeReadout, TimerBar } from '../Bits.jsx';
import { useGame } from '../../hooks/useGame.js';
import { usePhases } from '../../hooks/usePhases.js';
import { useRaf } from '../../hooks/useRaf.js';
import { useTimeout } from '../../hooks/useTimeout.js';
import { countdownOf, range, shuffle, toNumber } from '../../lib/random.js';
import { play } from '../../lib/sounds.js';

/**
 * Scrambler: `difficulty` numbers in a scrambled 4-column grid; press them
 * in order 1, 2, 3... The layout reshuffles every `timer` ms. `total` wrong
 * presses are tolerated, the next one fails. `limit` ms overall. No strikes
 * is a perfect result.
 */
export default function Scrambler({ game }) {
    const { over, finished, failed, succeed, fail } = useGame();
    const numbers = Math.max(1, Math.floor(toNumber(game.difficulty, 8)));
    const strikesAllowed = Math.max(0, Math.floor(toNumber(game.total, 0)));
    const change = toNumber(game.timer, 0);
    const limit = toNumber(game.limit, 0);

    const { playing, count } = usePhases({ countdown: countdownOf(game) });
    const [layout, setLayout] = useState(() => shuffle(range(numbers, 1)));
    const [entered, setEntered] = useState(0);
    const [strikes, setStrikes] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [time, setTime] = useState(0);
    const [time2, setTime2] = useState(0);
    const timeRef = useRef(0);
    const time2Ref = useRef(0);
    const done = entered >= numbers;

    // After every reshuffle (and once at start) the shuffle clock pauses for a second.
    useTimeout(() => setSubmitting(true), !submitting ? 1000 : null);

    useRaf((_, dt) => {
        timeRef.current += dt;
        setTime(timeRef.current);
        if (limit && timeRef.current > limit) {
            fail();
            return;
        }
        if (submitting && change > 0) {
            time2Ref.current += dt;
            setTime2(time2Ref.current);
            if (time2Ref.current > change) {
                time2Ref.current = 0;
                setTime2(0);
                setSubmitting(false);
                setLayout(shuffle(range(numbers, 1)));
            }
        }
    }, playing && !over && !done);

    useEffect(() => {
        if (done && playing) succeed(strikes === 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [done]);

    const press = (d) => {
        if (!playing || over || done) return;
        if (change > 0 && time2Ref.current >= change) return;
        if (d === entered + 1) {
            play('beep');
            setEntered((e) => e + 1);
        } else if (strikes >= strikesAllowed) {
            fail();
        } else {
            play('negative');
            setStrikes((s) => s + 1);
        }
    };

    const critical =
        playing && !over && ((limit > 0 && time / limit >= 0.66) || (strikesAllowed > 0 && strikes === strikesAllowed));

    return (
        <Stage>
            <GameFrame
                icon="shuffle"
                title="Scrambler"
                subtitle="Press the numbers in ascending order"
                width={400}
                critical={critical}
                aside={
                    <>
                        <Counter value={entered} total={numbers} label="Pressed" />
                        {limit > 0 && <TimeReadout elapsed={time} total={limit} label="Time left" />}
                    </>
                }
            >
                <Strikes total={strikesAllowed} used={strikes} sx={{ mb: 1.5 }} />
                <TimerBar elapsed={time} total={limit} idle={!playing || limit <= 0} sx={{ mb: 1.5 }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
                    {layout.map((d) => (
                        <PadKey key={d} active={d <= entered} disabled={!playing || over || d <= entered} onClick={() => press(d)}>
                            {playing ? d : ''}
                        </PadKey>
                    ))}
                </Box>
                {change > 0 && (
                    <>
                        <TimerBar elapsed={time2} total={change} color={colors.info} height={4} idle={!playing || !submitting} sx={{ mt: 1.5 }} />
                        <Typography variant="caption" sx={{ display: 'block', color: colors.text3, mt: 0.75 }}>
                            Layout reshuffles every {(change / 1000).toFixed(change % 1000 ? 1 : 0)}s
                        </Typography>
                    </>
                )}
                {!playing && <Countdown count={count} label="Preparing device" />}
                <ResultOverlay finished={finished} failed={failed} />
            </GameFrame>
        </Stage>
    );
}
