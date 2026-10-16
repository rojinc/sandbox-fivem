import React, { useCallback, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import { colors, radius, useKey } from '@sandbox/ui-kit';
import { Stage } from '../Stage.jsx';
import { GameFrame } from '../GameFrame.jsx';
import { Countdown, ResultOverlay, StageBody } from '../Overlays.jsx';
import { BigKey, KeyHint, Strikes, TimeReadout, TimerBar } from '../Bits.jsx';
import { useGame } from '../../hooks/useGame.js';
import { usePhases } from '../../hooks/usePhases.js';
import { useRaf } from '../../hooks/useRaf.js';
import { useTimeout } from '../../hooks/useTimeout.js';
import { clamp, countdownOf, pick, range, shuffle, toNumber } from '../../lib/random.js';
import { KEYSETS, bothCases } from '../../lib/keys.js';
import { play } from '../../lib/sounds.js';

const STAGES = 3;
const ALLEY_W = 180;
const KEY = 48;
const ZONE = [76, 88];

function Alley({ keyChar, first, range: fallRange, active, onFail }) {
    const [state, setState] = useState(() => ({ falling: false, speed: 0, delay: (first ? 100 : 300) * (Math.random() * 3 + 1) }));
    const [pct, setPct] = useState(0);
    const [pressed, setPressed] = useState(false);
    const pctRef = useRef(0);

    const endFall = useCallback(() => {
        pctRef.current = 0;
        setPct(0);
        setState({ falling: false, speed: 0, delay: 300 * (Math.random() * 3 + 1) });
    }, []);

    useTimeout(
        () => setState({ falling: true, speed: Math.random() * (fallRange[1] - fallRange[0]) + fallRange[0], delay: 0 }),
        active && !state.falling ? state.delay : null,
    );

    useRaf((elapsed) => {
        const p = (elapsed / Math.max(1, state.speed)) * 100;
        pctRef.current = p;
        setPct(Math.min(100, p));
        if (p >= 100) {
            play('negative');
            onFail();
            endFall();
        }
    }, active && state.falling);

    useKey(
        bothCases(keyChar),
        (e) => {
            if (e.repeat || !active || !state.falling) return;
            setPressed(true);
            const p = pctRef.current;
            if (p >= ZONE[0] && p <= ZONE[1]) play('beep');
            else {
                play('negative');
                onFail();
            }
            endFall();
        },
        { enabled: active },
    );
    useTimeout(() => setPressed(false), pressed ? 250 : null);

    return (
        <Box
            sx={{
                position: 'relative',
                width: ALLEY_W,
                height: '100%',
                overflow: 'hidden',
                borderRadius: `${radius.md}px`,
                border: `1px solid ${colors.border}`,
                background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.05) 100%)',
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: `${ZONE[0]}%`,
                    height: `calc(${ZONE[1] - ZONE[0]}% + ${KEY}px)`,
                    background: colors.infoSoft,
                    borderTop: `1px solid ${colors.info}`,
                    borderBottom: `1px solid ${colors.info}`,
                }}
            />
            {state.falling && (
                <BigKey size={KEY} sx={{ position: 'absolute', left: '50%', top: `${pct}%`, transform: 'translateX(-50%)' }}>
                    {keyChar}
                </BigKey>
            )}
            <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 10, display: 'grid', placeItems: 'center' }}>
                <BigKey size={KEY} active={pressed} tone={colors.text2}>
                    {keyChar}
                </BigKey>
            </Box>
        </Box>
    );
}

/**
 * Keymaster: keys fall down `difficulty` alleys taking a random `timer`
 * [min,max] ms each; press the alley's key while the cap is between 76 % and
 * 88 % of its fall. More than `chances` misses fails; surviving `limit` ms
 * succeeds.
 */
export default function Keymaster({ game }) {
    const { over, finished, failed, succeed, fail } = useGame();
    const alleys = clamp(Math.floor(toNumber(game.difficulty, 3)), 1, 4);
    const chances = Math.max(0, Math.floor(toNumber(game.chances, 5)));
    const limit = Math.max(100, toNumber(game.limit, 40000));
    const fallRange = Array.isArray(game.timer)
        ? [toNumber(game.timer[0], 2000), toNumber(game.timer[1], 4000)]
        : [toNumber(game.timer, 3000), toNumber(game.timer, 3000)];

    const [setup] = useState(() => ({
        keys: game.randomKey === false ? KEYSETS[1] : pick(KEYSETS),
        order: game.shuffled ? shuffle(range(alleys)) : range(alleys),
    }));

    const { phase, stage, count, playing } = usePhases({ stages: STAGES, countdown: countdownOf(game) });
    const [fails, setFails] = useState(0);
    const [time, setTime] = useState(0);

    useRaf((elapsed) => {
        setTime(elapsed);
        if (elapsed > limit) succeed(false);
    }, playing && !over);

    useEffect(() => {
        if (playing && fails > chances) fail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fails]);

    const onFail = useCallback(() => setFails((f) => f + 1), []);
    const active = playing && !over;
    const width = alleys * ALLEY_W + (alleys - 1) * 16 + 32;

    return (
        <Stage>
            <GameFrame
                icon="keyboard"
                title="Keymaster"
                subtitle="Press each key as its cap enters the blue zone"
                width={Math.max(width, 420)}
                height="82vh"
                bodySx={{ display: 'flex', flexDirection: 'column' }}
                aside={
                    <>
                        <KeyHint keys={setup.keys.slice(0, alleys).map((k) => k.toUpperCase())} />
                        {playing && <TimeReadout elapsed={time} total={limit} label="Hold out for" />}
                    </>
                }
            >
                {phase === 'stage' ? (
                    <StageBody stage={stage} icon="chart-simple" minHeight="100%" />
                ) : (
                    <>
                        <Strikes total={chances} used={fails} sx={{ mb: 1.5, flexShrink: 0 }} />
                        <TimerBar elapsed={time} total={limit} idle={!playing} sx={{ mb: 2, flexShrink: 0 }} />
                        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', justifyContent: 'center', gap: 2 }}>
                            {setup.order.map((keyIndex, i) => (
                                <Alley
                                    key={keyIndex}
                                    keyChar={setup.keys[keyIndex]}
                                    first={keyIndex === 1 && i === 0}
                                    range={fallRange}
                                    active={active}
                                    onFail={onFail}
                                />
                            ))}
                        </Box>
                    </>
                )}
                {phase === 'countdown' && <Countdown count={count} />}
                <ResultOverlay finished={finished} failed={failed} successText="Verification completed" failText="Verification failed" />
            </GameFrame>
        </Stage>
    );
}
