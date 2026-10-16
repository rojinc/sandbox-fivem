import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Kbd, colors, radius } from '@sandbox/ui-kit';

/** Remaining-time bar (shrinks from the right), coloured by how much is used. */
export function TimerBar({ elapsed = 0, total = 0, height = 6, color, sx, idle = false }) {
    const used = total > 0 ? Math.min(100, Math.max(0, (elapsed / total) * 100)) : 0;
    const fill = color ?? (used < 33 ? colors.success : used < 66 ? colors.warning : colors.danger);
    return (
        <Box
            sx={{
                height,
                borderRadius: `${radius.pill}px`,
                background: 'rgba(255,255,255,0.1)',
                overflow: 'hidden',
                ...sx,
            }}
        >
            {!idle && (
                <Box
                    sx={{
                        height: '100%',
                        width: `${100 - used}%`,
                        borderRadius: `${radius.pill}px`,
                        background: fill,
                    }}
                />
            )}
        </Box>
    );
}

/** mm:ss.s style readout for the aside slot. */
export function TimeReadout({ elapsed = 0, total = 0, label }) {
    const left = Math.max(0, total - elapsed);
    return (
        <Box sx={{ textAlign: 'right', lineHeight: 1.1 }}>
            {label && (
                <Typography variant="caption" sx={{ display: 'block', color: colors.text3 }}>
                    {label}
                </Typography>
            )}
            <Typography className="sb-mono" sx={{ fontSize: 15, fontWeight: 600, color: colors.text }}>
                {(left / 1000).toFixed(1)}
                <Box component="span" sx={{ color: colors.text3, fontSize: 12, ml: 0.25 }}>
                    s
                </Box>
            </Typography>
        </Box>
    );
}

/** Row of strike slots; `used` of `total` are lit red. */
export function Strikes({ total = 0, used = 0, sx }) {
    if (total <= 0) return null;
    return (
        <Box sx={{ display: 'flex', gap: 0.75, ...sx }}>
            {Array.from({ length: total }, (_, i) => (
                <Box
                    key={i}
                    sx={{
                        flex: 1,
                        height: 8,
                        borderRadius: `${radius.pill}px`,
                        background: i < used ? colors.danger : 'rgba(255,255,255,0.1)',
                        boxShadow: i < used ? `0 0 10px ${colors.dangerSoft}` : 'none',
                        transition: 'background 150ms var(--sb-ease)',
                    }}
                />
            ))}
        </Box>
    );
}

/** Key caps followed by what they do. */
export function KeyHint({ keys = [], children, sx }) {
    return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, color: colors.text2, fontSize: 12.5, ...sx }}>
            {keys.map((k, i) => (
                <Kbd key={`${k}-${i}`}>{k}</Kbd>
            ))}
            {children && <span>{children}</span>}
        </Box>
    );
}

/** Big key cap for the round skill check / alleys. */
export function BigKey({ children, active = false, tone = colors.text, size = 48, sx }) {
    return (
        <Box
            className="sb-mono"
            sx={{
                width: size,
                height: size,
                borderRadius: `${radius.sm}px`,
                display: 'grid',
                placeItems: 'center',
                fontSize: size * 0.46,
                fontWeight: 600,
                textTransform: 'uppercase',
                color: tone,
                background: active ? colors.accentSoft : 'rgba(255,255,255,0.08)',
                border: `1px solid ${active ? colors.accent : 'rgba(255,255,255,0.18)'}`,
                boxShadow: '0 2px 0 rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.08)',
                transition: 'border-color 120ms var(--sb-ease), background 120ms var(--sb-ease)',
                ...sx,
            }}
        >
            {children}
        </Box>
    );
}

/** Code / sequence readout: one slot per expected digit. */
export function Display({ length, values = [], mask = false, sx }) {
    const slots = Math.max(length, values.length);
    return (
        <Box
            sx={{
                display: 'flex',
                gap: 0.75,
                p: 1,
                borderRadius: `${radius.md}px`,
                background: 'rgba(0,0,0,0.35)',
                border: `1px solid ${colors.border}`,
                minHeight: 52,
                alignItems: 'center',
                justifyContent: 'center',
                ...sx,
            }}
        >
            {Array.from({ length: slots }, (_, i) => {
                const v = values[i];
                const filled = v !== undefined;
                return (
                    <Box
                        key={i}
                        className="sb-mono"
                        sx={{
                            flex: 1,
                            maxWidth: 44,
                            height: 36,
                            borderRadius: `${radius.xs}px`,
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: 20,
                            fontWeight: 600,
                            color: filled ? colors.accent : colors.text3,
                            background: filled ? colors.accentSoft : 'rgba(255,255,255,0.05)',
                            transition: 'background 120ms var(--sb-ease)',
                        }}
                    >
                        {filled ? (mask ? '•' : v) : '–'}
                    </Box>
                );
            })}
        </Box>
    );
}

/** Square grid button for keypads. */
export function PadKey({ children, onClick, disabled = false, active = false, tone, sx }) {
    const color = tone ?? colors.text;
    return (
        <Box
            component="button"
            type="button"
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            className="sb-mono"
            sx={{
                appearance: 'none',
                border: `1px solid ${active ? colors.accent : colors.border}`,
                borderRadius: `${radius.sm}px`,
                background: active ? colors.accentSoft : 'rgba(255,255,255,0.05)',
                color: active ? colors.accent : color,
                fontSize: 20,
                fontWeight: 600,
                height: 52,
                cursor: disabled ? 'default' : 'pointer',
                opacity: disabled && !active ? 0.55 : 1,
                transition: 'background 120ms var(--sb-ease), border-color 120ms var(--sb-ease), transform 120ms var(--sb-ease)',
                '&:hover:not(:disabled)': { background: active ? colors.accentSoft : 'rgba(255,255,255,0.1)', borderColor: colors.borderStrong },
                '&:active:not(:disabled)': { transform: 'scale(0.97)' },
                ...sx,
            }}
        >
            {children}
        </Box>
    );
}

/** "3 / 5" style progress for the aside slot. */
export function Counter({ value, total, label }) {
    return (
        <Box sx={{ textAlign: 'right', lineHeight: 1.1 }}>
            {label && (
                <Typography variant="caption" sx={{ display: 'block', color: colors.text3 }}>
                    {label}
                </Typography>
            )}
            <Typography className="sb-mono" sx={{ fontSize: 15, fontWeight: 600 }}>
                {value}
                <Box component="span" sx={{ color: colors.text3 }}>
                    {' / '}
                    {total}
                </Box>
            </Typography>
        </Box>
    );
}
