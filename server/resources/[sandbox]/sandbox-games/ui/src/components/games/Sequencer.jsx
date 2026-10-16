import React, { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import { Stage } from '../Stage.jsx';
import { GameFrame } from '../GameFrame.jsx';
import { Countdown, ResultOverlay } from '../Overlays.jsx';
import { Counter, Display, PadKey, TimeReadout, TimerBar } from '../Bits.jsx';
import { useGame } from '../../hooks/useGame.js';
import { usePhases } from '../../hooks/usePhases.js';
import { useInterval } from '../../hooks/useInterval.js';
import { useRaf } from '../../hooks/useRaf.js';
import { countdownOf, randInt, toNumber } from '../../lib/random.js';
import { play } from '../../lib/sounds.js';

/**
 * Sequencer: keys 1..12 flash one after another (`timer` ms each); repeat
 * the sequence within `limit` ms. Correct within the first 25 % of the time
 * is a perfect result.
 */
export default function Sequencer({ game }) {
    const { over, finished, failed, succeed, fail } = useGame();
    const length = Math.max(1, Math.floor(toNumber(game.difficulty, 4)));
    const flash = Math.max(50, toNumber(game.timer, 300));
    const limit = toNumber(game.limit, 0);
    const mask = Boolean(game.mask);

    const [sequence] = useState(() => {
        const c = [];
        while (c.length < length) {
            const r = randInt(1, 12);
            if (c[c.length - 1] !== r) c.push(r);
        }
        return c;
    });

    const { playing, count } = usePhases({ countdown: countdownOf(game) });
    const [flashed, setFlashed] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [entered, setEntered] = useState([]);
    const [time, setTime] = useState(0);
    const timeRef = useRef(0);

    useInterval(
        () => {
            if (flashed >= sequence.length) setSubmitting(true);
            else setFlashed((f) => f + 1);
        },
        playing && !submitting && !over ? flash : null,
    );

    useRaf((elapsed) => {
        timeRef.current = elapsed;
        setTime(elapsed);
        if (limit && elapsed > limit) fail();
    }, playing && submitting && !over && entered.length < length);

    useEffect(() => {
        if (!playing || entered.length !== length) return;
        const ok = entered.every((d, i) => d === sequence[i]);
        if (ok) succeed(limit > 0 && (timeRef.current / limit) * 100 <= 25);
        else fail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entered]);

    const press = (d) => {
        if (!playing || !submitting || over || entered.length >= length) return;
        play('beep');
        setEntered((e) => [...e, d]);
    };

    const flashing = playing && !submitting ? sequence[flashed - 1] : null;

    return (
        <Stage>
            <GameFrame
                icon="list-ol"
                title="Sequencer"
                subtitle={submitting ? 'Repeat the sequence' : 'Memorise the sequence'}
                width={340}
                aside={
                    <>
                        <Counter value={entered.length} total={length} label="Entered" />
                        {limit > 0 && submitting && <TimeReadout elapsed={time} total={limit} label="Time left" />}
                    </>
                }
            >
                <Display length={length} values={entered} mask={mask} />
                <TimerBar elapsed={time} total={limit} idle={!submitting || limit <= 0} sx={{ my: 1.5 }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                    {Array.from({ length: 12 }, (_, k) => {
                        const d = k + 1;
                        return (
                            <PadKey
                                key={d}
                                active={flashing === d}
                                disabled={!submitting || over || entered.length >= length}
                                onClick={() => press(d)}
                            >
                                {d}
                            </PadKey>
                        );
                    })}
                </Box>
                {!playing && <Countdown count={count} />}
                <ResultOverlay finished={finished} failed={failed} />
            </GameFrame>
        </Stage>
    );
}
