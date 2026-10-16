import React, { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { colors, radius } from '@sandbox/ui-kit';
import { Stage } from '../Stage.jsx';
import { GameFrame } from '../GameFrame.jsx';
import { Countdown, ResultOverlay, StageBody } from '../Overlays.jsx';
import { KeyHint, TimeReadout, TimerBar } from '../Bits.jsx';
import { useGame } from '../../hooks/useGame.js';
import { usePhases } from '../../hooks/usePhases.js';
import { useRaf } from '../../hooks/useRaf.js';
import { useTimeout } from '../../hooks/useTimeout.js';
import { clamp, countdownOf, pick, randInt, range, shuffle, toNumber } from '../../lib/random.js';
import { startTick, stopTick } from '../../lib/sounds.js';

const STAGES = 3;
const SHRINK_MS = 2000;
const TILE = 170;

const SHAPES = ['square', 'triangle', 'rectangle', 'circle'];
const COLORABLE = ['background', 'colortext', 'shapetext', 'number', 'shape'];
const COLORS = {
    black: '#000000',
    white: '#FFFFFF',
    blue: '#2195ee',
    red: '#7b0100',
    yellow: '#fceb3d',
    orange: '#fd9802',
    green: '#4cae4f',
    purple: '#9926ac',
};
const COLOR_NAMES = Object.keys(COLORS);

const QUESTIONS = {
    'background color': (p) => p.colorNames.background,
    'color text color': (p) => p.colorNames.colortext,
    'shape text color': (p) => p.colorNames.shapetext,
    'number color': (p) => p.colorNames.number,
    'shape color': (p) => p.colorNames.shape,
    'color text': (p) => p.text[0],
    'shape text': (p) => p.text[1],
    shape: (p) => p.shape,
};

const SHAPE_SVG = {
    square: (c) => <rect fill={c} stroke="#000" strokeWidth="1" width="150" height="150" />,
    triangle: (c) => <polygon fill={c} stroke="#000" strokeWidth="1" points="0 150 75 0 150 150 0 150" />,
    rectangle: (c) => <rect y="30" fill={c} stroke="#000" strokeWidth="1" width="150" height="90" />,
    circle: (c) => <circle fill={c} stroke="#000" strokeWidth="1" cx="75" cy="75" r="75" />,
};

function SvgText({ text, color, size, y, mono = false }) {
    return (
        <text
            stroke="#000"
            fill={color}
            strokeWidth="0.35"
            style={{ fontSize: size, fontFamily: mono ? 'var(--sb-font-mono)' : 'var(--sb-font-ui)' }}
            fontWeight="700"
            x="50%"
            y={`${y}%`}
            dominantBaseline="middle"
            textAnchor="middle"
        >
            {text}
        </text>
    );
}

function randomPiece(index) {
    const shape = pick(SHAPES);
    const number = randInt(1, 9);
    const text = [pick(COLOR_NAMES), pick(SHAPES)];
    const colorNames = {};
    for (const k of COLORABLE) colorNames[k] = pick(COLOR_NAMES);
    while ([colorNames.colortext, colorNames.shapetext].includes(colorNames.background)) colorNames.background = pick(COLOR_NAMES);
    while ([colorNames.background, colorNames.colortext, colorNames.shapetext, colorNames.number].includes(colorNames.shape))
        colorNames.shape = pick(COLOR_NAMES);
    const colors2 = {};
    for (const k of COLORABLE) colors2[k] = COLORS[colorNames[k]];
    return { index, shape, number, text, colorNames, colors: colors2 };
}

function generateQA(numAnswers, pieces) {
    const questions = [];
    const answers = [];
    const positions = shuffle(pieces.map((p) => p.index)).slice(0, numAnswers);
    const kinds = shuffle(Object.keys(QUESTIONS)).slice(0, numAnswers);
    for (let i = 0; i < numAnswers; i += 1) {
        const piece = pieces.find((p) => p.index === positions[i]);
        questions.push({ question: kinds[i], position: positions[i] });
        answers.push(String(QUESTIONS[kinds[i]](piece)));
    }
    return { questions, answer: answers.join(' ') };
}

/**
 * Captcha: tiles show their number for `timer` ms, shrink away over 2 s, then
 * reveal a shape/colour/text puzzle. Answer `difficulty2` questions about
 * tile N ("blue circle") within `limit` ms.
 */
export default function Captcha({ game }) {
    const { over, finished, failed, succeed, fail } = useGame();
    const previewMs = Math.max(0, toNumber(game.timer, 5000));
    const limit = toNumber(game.limit, 30000);
    const tiles = clamp(Math.floor(toNumber(game.difficulty, 4)), 1, 8);
    const numAnswers = clamp(Math.floor(toNumber(game.difficulty2, 2)), 1, Math.min(8, tiles));

    const [setup] = useState(() => {
        const pieces = shuffle(range(tiles, 1)).map((i) => randomPiece(i));
        return { pieces, ...generateQA(numAnswers, pieces) };
    });

    const { phase, stage, count, playing } = usePhases({ stages: STAGES, countdown: countdownOf(game) });
    const [step, setStep] = useState('preview');
    const [time, setTime] = useState(0);
    const [value, setValue] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const inputRef = useRef(null);

    useTimeout(() => setStep('shrink'), playing && step === 'preview' ? previewMs : null);
    useTimeout(() => setStep('answer'), playing && step === 'shrink' ? SHRINK_MS : null);

    useEffect(() => {
        if (step === 'answer' && !over) {
            startTick();
            inputRef.current?.focus();
        }
        return () => stopTick();
    }, [step, over]);

    useRaf((elapsed) => {
        setTime(elapsed);
        if (limit && elapsed > limit) fail();
    }, playing && step === 'answer' && !over && !submitted);

    const onSubmit = (e) => {
        e.preventDefault();
        if (!playing || step !== 'answer' || over || submitted) return;
        setSubmitted(true);
        stopTick();
        const given = value.trim().toLowerCase().replace(/\s+/g, ' ');
        if (given === setup.answer.toLowerCase()) succeed(false);
        else fail();
    };

    const width = clamp(tiles * TILE + (tiles - 1) * 12 + 32, 560, 1800);
    const subtitle =
        step === 'preview' ? 'Memorise which number each tile has' : step === 'shrink' ? 'Hold on' : 'Answer the question about the tiles';

    return (
        <Stage>
            <GameFrame
                icon="eye"
                title="Visual verification"
                subtitle={subtitle}
                width={width}
                aside={playing && step === 'answer' && limit > 0 ? <TimeReadout elapsed={time} total={limit} label="Time left" /> : null}
            >
                {phase === 'stage' ? (
                    <StageBody stage={stage} icon="pen-to-square" minHeight={360} />
                ) : (
                    <>
                        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
                            {setup.pieces.map((p) => {
                                const revealed = step === 'answer';
                                return (
                                    <Box
                                        key={p.index}
                                        sx={{
                                            width: TILE,
                                            height: TILE,
                                            borderRadius: `${radius.md}px`,
                                            border: `1px solid ${colors.border}`,
                                            background: revealed ? p.colors.background : colors.bg3,
                                            display: 'grid',
                                            placeItems: 'center',
                                            overflow: 'hidden',
                                            transition: 'background 400ms var(--sb-ease)',
                                        }}
                                    >
                                        {revealed ? (
                                            <svg viewBox="0 0 150 150" width={TILE - 36} height={TILE - 36}>
                                                {SHAPE_SVG[p.shape](p.colors.shape)}
                                                <SvgText text={p.text[0].toUpperCase()} color={p.colors.colortext} size={24} y={25} />
                                                <SvgText text={p.text[1].toUpperCase()} color={p.colors.shapetext} size={24} y={70} />
                                                <SvgText text={p.number} color={p.colors.number} size={55} y={50} mono />
                                            </svg>
                                        ) : (
                                            <Typography
                                                className="sb-mono"
                                                sx={{
                                                    fontSize: 64,
                                                    fontWeight: 600,
                                                    color: colors.text,
                                                    transition: step === 'shrink' ? `transform ${SHRINK_MS}ms ease-in` : 'none',
                                                    transform: step === 'shrink' ? 'scale(0)' : 'scale(1)',
                                                }}
                                            >
                                                {playing ? p.index : ''}
                                            </Typography>
                                        )}
                                    </Box>
                                );
                            })}
                        </Box>
                        <TimerBar
                            elapsed={step === 'answer' ? time : 0}
                            total={limit}
                            color={step === 'answer' ? undefined : colors.info}
                            idle={!playing}
                            sx={{ my: 2 }}
                        />
                        <Box sx={{ minHeight: 96 }}>
                            {step === 'answer' && (
                                <Box component="form" onSubmit={onSubmit} sx={{ maxWidth: 520, mx: 'auto', textAlign: 'center' }}>
                                    <Typography variant="body2" sx={{ color: colors.text2, mb: 1.25, lineHeight: 1.8 }}>
                                        Enter the{' '}
                                        {setup.questions.map((q, i) => (
                                            <React.Fragment key={`${q.question}-${q.position}`}>
                                                <Box component="span" sx={{ color: colors.text, fontWeight: 600 }}>
                                                    {q.question}
                                                </Box>{' '}
                                                of tile{' '}
                                                <Box component="span" className="sb-mono" sx={{ color: colors.accent, fontWeight: 600 }}>
                                                    {q.position}
                                                </Box>
                                                {i < setup.questions.length - 1 ? ' and the ' : ''}
                                            </React.Fragment>
                                        ))}
                                    </Typography>
                                    <TextField
                                        inputRef={inputRef}
                                        autoFocus
                                        size="small"
                                        fullWidth
                                        autoComplete="off"
                                        placeholder={numAnswers > 1 ? 'answers separated by spaces' : 'answer'}
                                        disabled={over || submitted}
                                        value={value}
                                        onChange={(e) => setValue(e.target.value)}
                                        slotProps={{ htmlInput: { spellCheck: false } }}
                                    />
                                    <KeyHint keys={['Enter']} sx={{ mt: 1 }}>
                                        Submit
                                    </KeyHint>
                                </Box>
                            )}
                        </Box>
                    </>
                )}
                {phase === 'countdown' && <Countdown count={count} />}
                <ResultOverlay finished={finished} failed={failed} successText="Verification completed" failText="Verification failed" />
            </GameFrame>
        </Stage>
    );
}
