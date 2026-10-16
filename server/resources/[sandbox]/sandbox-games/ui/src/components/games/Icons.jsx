import React, { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { Icon, colors, radius } from '@sandbox/ui-kit';
import { Stage } from '../Stage.jsx';
import { GameFrame } from '../GameFrame.jsx';
import { Countdown, ResultOverlay, StageBody } from '../Overlays.jsx';
import { Counter, KeyHint, TimeReadout, TimerBar } from '../Bits.jsx';
import { useGame } from '../../hooks/useGame.js';
import { usePhases } from '../../hooks/usePhases.js';
import { useRaf } from '../../hooks/useRaf.js';
import { useInterval } from '../../hooks/useInterval.js';
import { useTimeout } from '../../hooks/useTimeout.js';
import { clamp, countdownOf, pick, shuffle, toNumber } from '../../lib/random.js';
import { play, startTick, stopTick } from '../../lib/sounds.js';

const STAGES = 3;

const ICONS = [
    'server', 'desktop', 'atom', 'terminal', 'code', 'code-branch', 'code-commit', 'diagram-project', 'circle-nodes',
    'microchip', 'wrench', 'sitemap', 'shield', 'network-wired', 'file-code', 'code-pull-request', 'cubes', 'brain',
    'bug', 'barcode', 'keyboard', 'laptop-code', 'satellite-dish', 'database', 'memory', 'hard-drive', 'ethernet',
    'robot', 'fingerprint', 'wifi', 'radio', 'plug', 'bolt', 'poop',
];

const COLOR_OPTIONS = [
    { color: '#ff4040', answer: ['red'] },
    { color: '#39d353', answer: ['green'] },
    { color: '#3b9dff', answer: ['blue'] },
    { color: '#b35cff', answer: ['purple'] },
    { color: '#ff8c1a', answer: ['orange'] },
    { color: '#ffe234', answer: ['yellow'] },
    { color: '#f6f7f9', answer: ['white'] },
    { color: '#30e6f2', answer: ['cyan'] },
    { color: '#9aa3b2', answer: ['grey', 'gray'] },
    { color: '#ff69b4', answer: ['pink'] },
    { color: '#00ff8a', answer: ['mint'] },
];

/**
 * Icons: a grid of `difficulty` coloured icons reshuffles once a second for
 * `timer` seconds, stays `delay` ms, then one icon at a time is shown in
 * plain white: type its colour. `difficulty2` correct answers within `limit`
 * ms succeed; a wrong answer fails.
 */
export default function Icons({ game }) {
    const { over, finished, failed, succeed, fail } = useGame();
    const shuffles = Math.max(0, Math.floor(toNumber(game.timer, 5)));
    const limit = toNumber(game.limit, 7500);
    const delay = Math.max(0, toNumber(game.delay, 1500));
    const iconCount = clamp(Math.floor(toNumber(game.difficulty, 8)), 1, ICONS.length);
    const needed = clamp(Math.floor(toNumber(game.difficulty2, 4)), 1, iconCount);

    const genIcons = () => shuffle(ICONS).slice(0, iconCount).map((icon) => ({ icon, color: pick(COLOR_OPTIONS), solved: false }));

    const { phase, stage, count, playing } = usePhases({ stages: STAGES, countdown: countdownOf(game) });
    const [icons, setIcons] = useState(genIcons);
    const [shuffleCount, setShuffleCount] = useState(0);
    const [input, setInput] = useState(false);
    const [selected, setSelected] = useState(null);
    const [correct, setCorrect] = useState(0);
    const [value, setValue] = useState('');
    const [time, setTime] = useState(0);
    const inputRef = useRef(null);

    useInterval(
        () => {
            setIcons(genIcons());
            play('beep');
            setShuffleCount((c) => c + 1);
        },
        playing && shuffleCount < shuffles && !over ? 1000 : null,
    );

    useTimeout(
        () => {
            setInput(true);
            setSelected(pick(icons.filter((i) => !i.solved)));
        },
        playing && shuffleCount >= shuffles && !input && !over ? delay : null,
    );

    useEffect(() => {
        if (input && !over) {
            startTick();
            inputRef.current?.focus();
        }
        return () => stopTick();
    }, [input, over]);

    useRaf((elapsed) => {
        setTime(elapsed);
        if (limit && elapsed > limit) fail();
    }, playing && input && !over && correct < needed);

    const onSubmit = (e) => {
        e.preventDefault();
        if (!input || over || !selected) return;
        const given = value.trim().toLowerCase();
        if (!given) return;
        if (selected.color.answer.includes(given)) {
            const next = icons.map((i) => (i.icon === selected.icon ? { ...i, solved: true } : i));
            const c = correct + 1;
            setIcons(next);
            setCorrect(c);
            setValue('');
            if (c >= needed) succeed(false);
            else {
                play('positive');
                setSelected(pick(next.filter((i) => !i.solved)));
            }
        } else {
            fail();
        }
    };

    const subtitle = !input
        ? shuffleCount < shuffles
            ? 'Locating input sequence'
            : 'Sequence located, starting decryption'
        : 'Which colour did this icon have?';

    return (
        <Stage>
            <GameFrame
                icon="icons"
                title="Icon decryption"
                subtitle={subtitle}
                width={560}
                aside={
                    input ? (
                        <>
                            <Counter value={correct} total={needed} label="Decrypted" />
                            {limit > 0 && <TimeReadout elapsed={time} total={limit} label="Time left" />}
                        </>
                    ) : null
                }
            >
                {phase === 'stage' ? (
                    <StageBody stage={stage} icon="icons" minHeight={300} />
                ) : !input ? (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, minHeight: 300, alignContent: 'start' }}>
                        {icons.map((it, i) => (
                            <Box
                                key={`${it.icon}-${i}`}
                                sx={{
                                    height: 64,
                                    borderRadius: `${radius.sm}px`,
                                    background: 'rgba(255,255,255,0.04)',
                                    border: `1px solid ${colors.border}`,
                                    display: 'grid',
                                    placeItems: 'center',
                                    fontSize: 30,
                                    color: it.color.color,
                                    filter: `drop-shadow(0 0 6px ${it.color.color}66)`,
                                }}
                            >
                                {playing && <Icon icon={it.icon} />}
                            </Box>
                        ))}
                    </Box>
                ) : (
                    <Box component="form" onSubmit={onSubmit} sx={{ minHeight: 300, display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ flex: 1, display: 'grid', placeItems: 'center', fontSize: 96, color: colors.text, py: 2 }}>
                            {selected && <Icon icon={selected.icon} />}
                        </Box>
                        <TextField
                            inputRef={inputRef}
                            autoFocus
                            size="small"
                            fullWidth
                            autoComplete="off"
                            placeholder="Colour of the icon"
                            disabled={over}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            slotProps={{ htmlInput: { spellCheck: false } }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
                            <KeyHint keys={['Enter']}>Submit</KeyHint>
                            <Typography variant="caption" sx={{ color: colors.text3 }}>
                                red, green, blue, purple, orange, yellow, white, cyan, grey, pink, mint
                            </Typography>
                        </Box>
                        <TimerBar elapsed={time} total={limit} idle={limit <= 0} sx={{ mt: 1.5 }} />
                    </Box>
                )}
                {phase === 'countdown' && <Countdown count={count} />}
                <ResultOverlay finished={finished} failed={failed} successText="Verification completed" failText="Verification failed" />
            </GameFrame>
        </Stage>
    );
}
