import React, { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Kbd, colors, radius, useKey } from '@sandbox/ui-kit';
import { Stage } from '../Stage.jsx';
import { GameFrame } from '../GameFrame.jsx';
import { Countdown, ResultOverlay } from '../Overlays.jsx';
import { KeyHint, TimeReadout } from '../Bits.jsx';
import { useGame } from '../../hooks/useGame.js';
import { usePhases } from '../../hooks/usePhases.js';
import { useInterval } from '../../hooks/useInterval.js';
import { clamp, countdownOf, pick, toNumber } from '../../lib/random.js';
import { KEYMAP, bothCases } from '../../lib/keys.js';

/**
 * Scanner: a lit bar bounces across `total` bars every `timer` ms. Press the
 * key while it is within `difficulty` bars of the target. Exactly on the
 * target is a perfect result. `limit` ms of sweeping fails.
 */
export default function Scanner({ game }) {
    const { over, finished, failed, succeed, fail, hasPerfect } = useGame();
    const total = Math.max(2, Math.floor(toNumber(game.total, 20)));
    const difficulty = Math.max(0, Math.floor(toNumber(game.difficulty, 0)));
    const step = Math.max(10, toNumber(game.timer, 100));
    const limit = toNumber(game.limit, 0);

    const [setup] = useState(() => {
        const min = difficulty === 0 ? 1 : 1 + difficulty;
        const max = total - difficulty;
        const span = max - min + 1 - difficulty;
        const chance = span > 0 ? Math.floor(Math.random() * span) + min : clamp(Math.round(total / 2), 1, total);
        const key = game.randomKey ? pick(KEYMAP) : 'e';
        const r = Math.max(1, Math.ceil(Math.random() * (total - 1)));
        return { chance, key, current: r, dir: r === total - 1 ? -1 : 1 };
    });

    const { playing, count } = usePhases({ countdown: countdownOf(game) });
    const [pos, setPos] = useState({ current: setup.current, dir: setup.dir, time: 0 });
    const posRef = useRef(pos);
    const pressed = useRef(false);

    useInterval(
        () => {
            if (over || pressed.current) return;
            const p = posRef.current;
            if (limit && p.time > limit) {
                pressed.current = true;
                fail();
                return;
            }
            const next = p.current + p.dir;
            let dir = p.dir;
            if (next >= total) dir = -1;
            else if (next <= 1) dir = 1;
            posRef.current = { current: next, dir, time: p.time + step };
            setPos(posRef.current);
        },
        playing && !over ? step : null,
    );

    useKey(bothCases(setup.key), (e) => {
        if (e.repeat || !playing || over || pressed.current) return;
        pressed.current = true;
        const c = posRef.current.current;
        if (c >= setup.chance - difficulty && c <= setup.chance + difficulty) succeed(c === setup.chance);
        else fail();
    });

    const keyLabel = setup.key.toUpperCase();
    const inZone = (i) => playing && i >= setup.chance - difficulty && i <= setup.chance + difficulty;

    return (
        <Stage>
            <GameFrame
                icon="wave-square"
                title="Scanner"
                subtitle={`Press ${keyLabel} when the sweep is inside the zone`}
                width={1100}
                aside={
                    <>
                        <KeyHint keys={[keyLabel]} />
                        {limit > 0 && <TimeReadout elapsed={pos.time} total={limit} label="Time left" />}
                    </>
                }
            >
                <Box sx={{ display: 'flex', gap: 0.5, height: 150, opacity: over ? 0.55 : 1, transition: 'opacity 200ms var(--sb-ease)' }}>
                    {Array.from({ length: total }, (_, k) => {
                        const i = k + 1;
                        const zone = inZone(i);
                        const centre = playing && i === setup.chance;
                        const active = playing && pos.current === i;
                        const accent = centre && hasPerfect;
                        return (
                            <Box
                                key={i}
                                sx={{
                                    flex: 1,
                                    position: 'relative',
                                    borderRadius: `${radius.sm}px`,
                                    border: `1px solid ${
                                        active ? colors.text : accent ? colors.accent : zone ? colors.info : colors.border
                                    }`,
                                    background: active
                                        ? 'rgba(242,244,247,0.92)'
                                        : accent
                                          ? colors.accentSoft
                                          : zone
                                            ? colors.infoSoft
                                            : 'rgba(255,255,255,0.05)',
                                    boxShadow: active ? '0 0 18px rgba(242,244,247,0.45)' : 'none',
                                    display: 'grid',
                                    placeItems: 'center',
                                }}
                            >
                                {centre && !over && <Kbd sx={{ fontSize: 13, height: 26, minWidth: 26 }}>{keyLabel}</Kbd>}
                            </Box>
                        );
                    })}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
                    <Typography variant="caption" sx={{ color: colors.text3 }}>
                        {difficulty > 0 ? `${difficulty} bar${difficulty > 1 ? 's' : ''} of tolerance on each side` : 'Exact hit required'}
                        {hasPerfect ? ' · centre bar is a perfect hit' : ''}
                    </Typography>
                    {limit > 0 && (
                        <Typography variant="caption" className="sb-mono" sx={{ color: colors.text2 }}>
                            {(pos.time / 1000).toFixed(1)}s / {(limit / 1000).toFixed(1)}s
                        </Typography>
                    )}
                </Box>
                {!playing && <Countdown count={count} />}
                <ResultOverlay finished={finished} failed={failed} />
            </GameFrame>
        </Stage>
    );
}
