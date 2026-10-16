import React from 'react';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import { Kbd, colors } from '@sandbox/ui-kit';
import { useTicker, formatCountdown } from '../../hooks/useTicker.js';

const MEDICAL_DELAY_MS = 2 * 60 * 1000;

function Key({ children }) {
    return <Kbd style={{ margin: '0 6px', fontSize: 13, height: 24 }}>{children}</Kbd>;
}

function Line({ children }) {
    return (
        <Box className="sb-overworld" sx={{ fontSize: 20, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '2px' }}>
            {children}
        </Box>
    );
}

function Sub({ children }) {
    return (
        <Box className="sb-overworld" sx={{ fontSize: 14, color: colors.text2, mt: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {children}
        </Box>
    );
}

function Countdown({ to }) {
    const now = useTicker(1000, true);
    return (
        <Box component="span" className="sb-mono" sx={{ color: colors.accent, fontWeight: 700, ml: '6px' }}>
            {formatCountdown(to - now)}
        </Box>
    );
}

function DeathText() {
    const a = useSelector((s) => s.app);
    const now = useTicker(1000, a.isDeathTexts);
    if (!a.isDeathTexts || !a.releaseType || !a.releaseTimer) return null;

    const canRelease = now >= a.releaseTimer;
    const medicalAt = a.deathTime + MEDICAL_DELAY_MS;
    const medical =
        now < medicalAt ? (
            <Sub>
                Medical assistance can be called in
                <Countdown to={medicalAt} />
            </Sub>
        ) : (
            <Sub>
                <Key>{a.helpKey}</Key> Call for medical assistance
            </Sub>
        );

    switch (a.releaseType) {
        case 'knockout':
            if (a.isReleasing) return <Line>Standing up…</Line>;
            return canRelease ? (
                <Line>
                    Press <Key>{a.releaseKey}</Key> to stand up
                </Line>
            ) : (
                <Line>
                    Unconscious. You can stand up in
                    <Countdown to={a.releaseTimer} />
                </Line>
            );
        case 'death':
            if (a.isReleasing) return <Line>Respawning…</Line>;
            return (
                <>
                    {canRelease ? (
                        <Line>
                            Press <Key>{a.releaseKey}</Key> to respawn (${a.medicalPrice})
                        </Line>
                    ) : (
                        <Line>
                            Downed. Respawn available in
                            <Countdown to={a.releaseTimer} />
                        </Line>
                    )}
                    {medical}
                </>
            );
        case 'hospital':
            if (a.isReleasing) return <Line>Getting up…</Line>;
            return canRelease ? (
                <Line>
                    Press <Key>{a.releaseKey}</Key> to get out of bed
                </Line>
            ) : (
                <Line>
                    Being treated
                    <Countdown to={a.releaseTimer} />
                </Line>
            );
        case 'hospital_rp':
            return (
                <Line>
                    Press <Key>{a.releaseKey}</Key> to get out of bed
                </Line>
            );
        default:
            return null;
    }
}

/** Red vignette while dead plus the release/respawn instructions. */
export default function DeathOverlay() {
    const isDead = useSelector((s) => s.status.isDead);
    const blindfolded = useSelector((s) => s.app.blindfolded);
    return (
        <>
            <Fade in={isDead && !blindfolded}>
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(ellipse at center, rgba(60, 8, 12, 0.15) 0%, rgba(40, 4, 8, 0.55) 100%)',
                    }}
                />
            </Fade>
            <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 150, textAlign: 'center' }}>
                <DeathText />
            </Box>
        </>
    );
}
