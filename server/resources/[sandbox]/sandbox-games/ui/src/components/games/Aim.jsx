import React, { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { colors, radius } from '@sandbox/ui-kit';
import { Stage } from '../Stage.jsx';
import { GameFrame } from '../GameFrame.jsx';
import { Countdown, ResultOverlay, StageBody } from '../Overlays.jsx';
import { TimeReadout, TimerBar } from '../Bits.jsx';
import { useGame } from '../../hooks/useGame.js';
import { usePhases } from '../../hooks/usePhases.js';
import { useRaf } from '../../hooks/useRaf.js';
import { clamp, countdownOf, toNumber } from '../../lib/random.js';
import { legPos, newLeg } from '../../lib/motion.js';
import { play } from '../../lib/sounds.js';

const STAGES = 3;
const INSET = 75;

function StatChip({ label, value, tone }) {
    return (
        <Box sx={{ textAlign: 'right', lineHeight: 1.1, minWidth: 64 }}>
            <Typography variant="caption" sx={{ display: 'block', color: colors.text3 }}>
                {label}
            </Typography>
            <Typography className="sb-mono" sx={{ fontSize: 15, fontWeight: 600, color: tone ?? colors.text }}>
                {value}
            </Typography>
        </Box>
    );
}

/**
 * Aim: targets appear every `timer` ms (first after timer/4) and grow one px
 * every `difficulty` ms until they are `maxSize` px bigger, which counts as
 * a miss. Clicking the background is a miss too. After `limit` ms the
 * accuracy must reach `accuracy` %; 100 % is perfect.
 */
export default function Aim({ game }) {
    const { over, finished, failed, succeed, fail } = useGame();
    const limit = Math.max(100, toNumber(game.limit, 15000));
    const spawnEvery = Math.max(50, toNumber(game.timer, 1000));
    const startSize = Math.max(6, toNumber(game.startSize ?? game.size, 30));
    const maxSize = Math.max(1, toNumber(game.maxSize, 75));
    const growthRate = Math.max(1, toNumber(game.difficulty, 15));
    const required = clamp(toNumber(game.accuracy, 50), 0, 100);
    const moving = Boolean(game.isMoving);

    const { phase, stage, count, playing } = usePhases({ stages: STAGES, countdown: countdownOf(game) });
    const areaRef = useRef(null);
    const targetsRef = useRef([]);
    const nextSpawn = useRef(spawnEvery / 4);
    const nextId = useRef(1);
    const hitRef = useRef(0);
    const missRef = useRef(0);
    const [, rerender] = useState(0);
    const [time, setTime] = useState(0);

    const bounds = () => {
        const el = areaRef.current;
        const w = el ? el.clientWidth - INSET * 2 : 1200;
        const h = el ? el.clientHeight - INSET * 2 : 500;
        return { w: Math.max(50, w), h: Math.max(50, h) };
    };
    const accuracy = () => {
        const h = hitRef.current;
        const m = missRef.current;
        return h + m > 0 ? Math.floor((h / (h + m)) * 100) : 0;
    };

    useRaf((elapsed) => {
        if (elapsed > limit) {
            const acc = accuracy();
            if (acc >= required) succeed(acc === 100);
            else fail();
            return;
        }
        setTime(elapsed);
        const b = bounds();
        if (elapsed >= nextSpawn.current) {
            nextSpawn.current += spawnEvery;
            const x = Math.random() * Math.max(1, b.w - startSize);
            const y = Math.random() * Math.max(1, b.h - startSize);
            targetsRef.current.push({
                id: nextId.current++,
                x,
                y,
                born: elapsed,
                grow: 0,
                leg: moving ? newLeg({ x, y }, b, [25, 50], elapsed) : null,
            });
        }
        for (const t of targetsRef.current) {
            t.grow = Math.min(maxSize, Math.floor((elapsed - t.born) / growthRate));
            if (t.grow >= maxSize) {
                t.dead = true;
                missRef.current += 1;
                play('negative');
                continue;
            }
            if (t.leg) {
                const p = legPos(t.leg, elapsed);
                t.x = p.x;
                t.y = p.y;
                if (p.done) t.leg = newLeg({ x: t.x, y: t.y }, b, [25, 50], elapsed);
            }
        }
        targetsRef.current = targetsRef.current.filter((t) => !t.dead);
        rerender((n) => n + 1);
    }, playing && !over);

    const hitTarget = (e, id) => {
        e.stopPropagation();
        if (!playing || over) return;
        targetsRef.current = targetsRef.current.filter((t) => t.id !== id);
        hitRef.current += 1;
        play('beep');
        rerender((n) => n + 1);
    };
    const miss = () => {
        if (!playing || over) return;
        missRef.current += 1;
        rerender((n) => n + 1);
    };

    const acc = accuracy();

    return (
        <Stage>
            <GameFrame
                icon="crosshairs"
                title="Target verification"
                subtitle="Click the targets before they expire; stray clicks count as misses"
                width={1500}
                height={760}
                bodySx={{ p: 0, display: 'flex', flexDirection: 'column' }}
                aside={
                    playing ? (
                        <>
                            <StatChip label="Hits" value={hitRef.current} tone={colors.success} />
                            <StatChip label="Misses" value={missRef.current} tone={colors.danger} />
                            <StatChip label="Accuracy" value={`${acc}%`} tone={acc >= required ? colors.success : colors.warning} />
                            <StatChip label="Required" value={`${required}%`} />
                            <TimeReadout elapsed={time} total={limit} label="Time left" />
                        </>
                    ) : null
                }
            >
                {phase === 'stage' ? (
                    <StageBody stage={stage} icon="location-crosshairs" minHeight="100%" />
                ) : (
                    <>
                        <TimerBar elapsed={time} total={limit} idle={!playing} height={5} sx={{ borderRadius: 0, flexShrink: 0 }} />
                        <Box
                            ref={areaRef}
                            onMouseDown={miss}
                            sx={{
                                position: 'relative',
                                flex: 1,
                                overflow: 'hidden',
                                cursor: playing && !over ? 'crosshair' : 'default',
                                backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)',
                                backgroundSize: '28px 28px',
                                backgroundPosition: '14px 14px',
                            }}
                        >
                            {!over &&
                                targetsRef.current.map((t) => {
                                    const size = startSize + t.grow;
                                    const life = t.grow / maxSize;
                                    return (
                                        <Box
                                            key={t.id}
                                            onMouseDown={(e) => hitTarget(e, t.id)}
                                            sx={{
                                                position: 'absolute',
                                                left: INSET + t.x,
                                                top: INSET + t.y,
                                                width: size,
                                                height: size,
                                                borderRadius: '50%',
                                                border: `2px solid ${life > 0.7 ? colors.danger : colors.accent}`,
                                                background: `radial-gradient(circle, ${colors.accentSoft} 0%, rgba(245,184,46,0.05) 60%, transparent 100%)`,
                                                boxShadow: `0 0 ${12 + life * 18}px ${life > 0.7 ? colors.dangerSoft : colors.accentSoft}`,
                                                cursor: 'crosshair',
                                                display: 'grid',
                                                placeItems: 'center',
                                                '&::after': {
                                                    content: '""',
                                                    width: Math.max(4, size * 0.22),
                                                    height: Math.max(4, size * 0.22),
                                                    borderRadius: '50%',
                                                    background: life > 0.7 ? colors.danger : colors.accent,
                                                },
                                            }}
                                        />
                                    );
                                })}
                        </Box>
                    </>
                )}
                {phase === 'countdown' && <Countdown count={count} />}
                <ResultOverlay
                    finished={finished}
                    failed={failed}
                    successText="Verification completed"
                    failText="Verification failed"
                    caption={`${acc}% accuracy, ${required}% required`}
                />
            </GameFrame>
        </Stage>
    );
}
