import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Icon, colors } from '@sandbox/ui-kit';

/** Covers the body of a GameFrame. */
export function Overlay({ children, sx }) {
    return (
        <Box
            className="sb-anim-fade"
            sx={{
                position: 'absolute',
                inset: 0,
                zIndex: 5,
                display: 'grid',
                placeItems: 'center',
                background: 'rgba(9, 11, 15, 0.74)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                ...sx,
            }}
        >
            {children}
        </Box>
    );
}

/** Centred label + big value / icon block used by the countdown, stages and results. */
export function StatusBlock({ label, value, icon, iconColor = colors.text, spin = false, caption, animKey }) {
    return (
        <Box key={animKey} className="sb-anim-rise" sx={{ textAlign: 'center', px: 3 }}>
            <Typography variant="overline" sx={{ color: colors.text3, display: 'block', mb: 0.5 }}>
                {label}
            </Typography>
            {icon ? (
                <Box sx={{ fontSize: 44, lineHeight: 1, color: iconColor, py: 0.5 }}>
                    <Icon icon={icon} spin={spin} />
                </Box>
            ) : (
                <Typography
                    className="sb-mono"
                    sx={{ fontSize: 56, fontWeight: 600, lineHeight: 1.05, color: colors.text, letterSpacing: -1 }}
                >
                    {value}
                </Typography>
            )}
            {caption && (
                <Typography variant="body2" sx={{ color: colors.text2, mt: 1 }}>
                    {caption}
                </Typography>
            )}
        </Box>
    );
}

export function Countdown({ count, label = 'Preparing system' }) {
    return (
        <Overlay>
            <StatusBlock animKey={count} label={label} value={count > 0 ? count : 'Go'} />
        </Overlay>
    );
}

export function ResultOverlay({ finished, failed, successText = 'Success', failText = 'Failed', caption }) {
    if (!finished && !failed) return null;
    return (
        <Overlay>
            <StatusBlock
                label={finished ? 'Result' : 'Result'}
                icon={finished ? 'circle-check' : 'circle-xmark'}
                iconColor={finished ? colors.success : colors.danger}
                caption={
                    <Box component="span" sx={{ fontSize: 16, fontWeight: 600, color: finished ? colors.success : colors.danger }}>
                        {finished ? successText : failText}
                        {caption && (
                            <Box component="span" sx={{ display: 'block', fontSize: 12.5, fontWeight: 400, color: colors.text2, mt: 0.5 }}>
                                {caption}
                            </Box>
                        )}
                    </Box>
                }
            />
        </Overlay>
    );
}

export const STAGE_TEXT = ['Attempting security bypass', 'Error bypassing, reconfiguring', 'Manual verification required'];

/** The 4 s "bypass" theatre stages shown by the hacking themed games. */
export function StageBlock({ stage, icon = 'terminal', texts = STAGE_TEXT }) {
    const label = texts[Math.min(stage, texts.length - 1)];
    if (stage === 0) return <StatusBlock animKey={stage} label={label} icon="spinner" spin iconColor={colors.text2} />;
    if (stage === 1 && texts.length > 2)
        return <StatusBlock animKey={stage} label={label} icon="triangle-exclamation" iconColor={colors.danger} />;
    return <StatusBlock animKey={stage} label={label} icon={icon} iconColor={colors.accent} />;
}

/** Body filler for the stage phase so the widget keeps its size. */
export function StageBody({ stage, icon, texts, minHeight = 220 }) {
    return (
        <Box sx={{ minHeight, display: 'grid', placeItems: 'center' }}>
            <StageBlock stage={stage} icon={icon} texts={texts} />
        </Box>
    );
}
