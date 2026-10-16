import React, { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import { colors, radius } from '@sandbox/ui-kit';
import { Stage } from '../Stage.jsx';
import { GameFrame } from '../GameFrame.jsx';
import { Countdown, ResultOverlay, StageBody } from '../Overlays.jsx';
import { Counter, TimeReadout, TimerBar } from '../Bits.jsx';
import { useGame } from '../../hooks/useGame.js';
import { usePhases } from '../../hooks/usePhases.js';
import { useRaf } from '../../hooks/useRaf.js';
import { useTimeout } from '../../hooks/useTimeout.js';
import { clamp, countdownOf, shuffle, toNumber } from '../../lib/random.js';
import { legPos, newLeg } from '../../lib/motion.js';
import { play } from '../../lib/sounds.js';

const STAGES = 3;
const SIZE = 100;
const COLOR_CODES = ['#00ffff', '#088f90', '#708fae', '#7392b2', '#6394ed', '#10487f', '#0047ab', '#1335a3', '#00018b'];

/**
 * Tracking: `difficulty` numbered squares drift around; after `delay` ms the
 * numbers disappear. Click them in order within `limit` ms; a wrong one fails.
 */
export default function Tracking({ game }) {
    const { over, finished, failed, succeed, fail } = useGame();
    const targetCount = clamp(Math.floor(toNumber(game.difficulty, 5)), 1, 30);
    const delay = Math.max(0, toNumber(game.delay, 2500));
    const limit = Math.max(100, toNumber(game.limit, 20000));

    const { phase, stage, count, playing } = usePhases({ stages: STAGES, countdown: countdownOf(game) });
    const areaRef = useRef(null);
    const targetsRef = useRef([]);
    const timeRef = useRef(0);
    const [, rerender] = useState(0);
    const [preview, setPreview] = useState(true);
    const [entered, setEntered] = useState(0);
    const [time, setTime] = useState(0);

    useTimeout(() => setPreview(false), playing && preview ? delay : null);

    const bounds = () => {
        const el = areaRef.current;
        return { w: Math.max(SIZE + 20, el ? el.clientWidth : 1200), h: Math.max(SIZE + 20, el ? el.clientHeight : 600) };
    };

    useRaf((elapsed, dt) => {
        const b = bounds();
        if (targetsRef.current.length === 0) {
            const palette = shuffle(COLOR_CODES);
            targetsRef.current = Array.from({ length: targetCount }, (_, i) => {
                const x = Math.random() * (b.w - 150);
                const y = Math.random() * (b.h - 150);
                return { id: i + 1, x, y, color: palette[i % palette.length], leg: newLeg({ x, y }, b, [10, 40], elapsed) };
            });
        }
        if (!preview) {
            timeRef.current += dt;
            setTime(timeRef.current);
            if (timeRef.current > limit) {
                fail();
                return;
            }
        }
        for (const t of targetsRef.current) {
            const p = legPos(t.leg, elapsed);
            t.x = p.x;
            t.y = p.y;
            if (p.done) t.leg = newLeg({ x: t.x, y: t.y }, b, [10, 40], elapsed);
        }
        rerender((n) => n + 1);
    }, playing && !over && entered < targetCount);

    const click = (t) => {
        if (preview || !playing || over) return;
        if (t.id === entered + 1) {
            play('beep');
            setEntered(t.id);
            if (t.id >= targetCount) succeed(false);
        } else {
            fail();
        }
    };

    return (
        <Stage>
            <GameFrame
                icon="eye"
                title="Tracking"
                subtitle={preview ? 'Memorise the order of the targets' : 'Click the targets in order'}
                width={1300}
                height={760}
                bodySx={{ p: 0, display: 'flex', flexDirection: 'column' }}
                aside={
                    playing ? (
                        <>
                            <Counter value={entered} total={targetCount} label="Tracked" />
                            {!preview && <TimeReadout elapsed={time} total={limit} label="Time left" />}
                        </>
                    ) : null
                }
            >
                {phase === 'stage' ? (
                    <StageBody stage={stage} icon="object-group" minHeight="100%" />
                ) : (
                    <>
                        <TimerBar
                            elapsed={preview ? 0 : time}
                            total={limit}
                            color={preview ? colors.info : undefined}
                            idle={!playing}
                            height={5}
                            sx={{ borderRadius: 0, flexShrink: 0 }}
                        />
                        <Box
                            ref={areaRef}
                            sx={{
                                position: 'relative',
                                flex: 1,
                                overflow: 'hidden',
                                backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)',
                                backgroundSize: '28px 28px',
                                backgroundPosition: '14px 14px',
                            }}
                        >
                            {!over &&
                                targetsRef.current
                                    .filter((t) => t.id > entered)
                                    .map((t) => (
                                        <Box
                                            key={t.id}
                                            onMouseDown={() => click(t)}
                                            className="sb-mono"
                                            sx={{
                                                position: 'absolute',
                                                left: t.x,
                                                top: t.y,
                                                width: SIZE,
                                                height: SIZE,
                                                borderRadius: `${radius.md}px`,
                                                background: t.color,
                                                border: '2px solid rgba(255,255,255,0.3)',
                                                boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
                                                display: 'grid',
                                                placeItems: 'center',
                                                fontSize: 30,
                                                fontWeight: 600,
                                                color: '#fff',
                                                textShadow: '0 1px 3px rgba(0,0,0,0.7)',
                                                cursor: preview ? 'default' : 'pointer',
                                            }}
                                        >
                                            {preview ? t.id : ''}
                                        </Box>
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
