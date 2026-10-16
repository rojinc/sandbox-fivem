import React, { useState } from 'react';
import Box from '@mui/material/Box';
import { Icon, colors, useKey } from '@sandbox/ui-kit';
import { Stage } from '../Stage.jsx';
import { GameFrame } from '../GameFrame.jsx';
import { Countdown, ResultOverlay } from '../Overlays.jsx';
import { Display, KeyHint, PadKey, TimeReadout, TimerBar } from '../Bits.jsx';
import { useGame } from '../../hooks/useGame.js';
import { usePhases } from '../../hooks/usePhases.js';
import { useRaf } from '../../hooks/useRaf.js';
import { toNumber } from '../../lib/random.js';
import { play } from '../../lib/sounds.js';

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * Keypad: type the code (`total`, also `data.code`) and confirm. The entered
 * digits are reported back to Lua as `entered`.
 */
export default function Keypad({ game }) {
    const { over, finished, failed, succeed, fail } = useGame();
    const code = String(game.total ?? game.data?.code ?? '');
    const digits = code.split('').filter(Boolean).map((c) => Number(c));
    const maxLen = Math.max(1, Math.floor(toNumber(game.difficulty, 0)) || digits.length || 1);
    const limit = toNumber(game.limit, 0);
    const mask = Boolean(game.mask);

    const { playing, count } = usePhases({ countdown: game.countdown ? toNumber(game.countdown, 5) : -1 });
    const [entered, setEntered] = useState([]);
    const [time, setTime] = useState(0);

    useRaf((elapsed) => {
        setTime(elapsed);
        if (elapsed > limit) fail();
    }, playing && limit > 0 && !over);

    const press = (d) => {
        if (!playing || over || entered.length >= maxLen) return;
        play('beep');
        setEntered((e) => [...e, d]);
    };
    const back = () => {
        if (!playing || over || entered.length === 0) return;
        play('back');
        setEntered((e) => e.slice(0, -1));
    };
    const submit = () => {
        if (!playing || over || entered.length < digits.length) return;
        play('confirm');
        const str = entered.join('');
        const ok = entered.length === digits.length && entered.every((d, i) => d === digits[i]);
        if (ok) succeed(false, { entered: str });
        else fail({ entered: str });
    };

    useKey(DIGITS, (e) => {
        if (e.repeat) return;
        press(Number(e.key));
    });
    useKey('Backspace', (e) => {
        e.preventDefault();
        back();
    });
    useKey('Enter', (e) => {
        if (e.repeat) return;
        submit();
    });

    return (
        <Stage>
            <GameFrame
                icon="hashtag"
                title="Keypad"
                subtitle="Enter the access code"
                width={300}
                aside={limit > 0 && playing ? <TimeReadout elapsed={time} total={limit} label="Time left" /> : null}
            >
                <Display length={digits.length} values={entered} mask={mask} />
                <TimerBar elapsed={time} total={limit} idle={!playing || limit <= 0} sx={{ my: 1.5 }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                        <PadKey key={d} disabled={!playing || over || entered.length >= maxLen} onClick={() => press(d)}>
                            {d}
                        </PadKey>
                    ))}
                    <PadKey tone={colors.danger} disabled={!playing || over || entered.length === 0} onClick={back}>
                        <Icon icon="delete-left" />
                    </PadKey>
                    <PadKey disabled={!playing || over || entered.length >= maxLen} onClick={() => press(0)}>
                        0
                    </PadKey>
                    <PadKey
                        tone={colors.success}
                        active={playing && !over && entered.length >= digits.length}
                        disabled={!playing || over || entered.length < digits.length}
                        onClick={submit}
                        sx={{ '&.sb-mono': {}, color: colors.success }}
                    >
                        <Icon icon="check" />
                    </PadKey>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5 }}>
                    <KeyHint keys={['0-9']}>Type</KeyHint>
                    <KeyHint keys={['⌫']}>Delete</KeyHint>
                    <KeyHint keys={['Enter']}>Confirm</KeyHint>
                </Box>
                {!playing && <Countdown count={count} />}
                <ResultOverlay finished={finished} failed={failed} successText="Access granted" failText="Access denied" />
            </GameFrame>
        </Stage>
    );
}
