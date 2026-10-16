import React from 'react';
import Box from '@mui/material/Box';
import { Icon, colors } from '@sandbox/ui-kit';
import RingGauge from './RingGauge.jsx';

/** Visibility rules shared by every status presentation (ported from the Lua contract's options). */
export function isStatusHidden(status, isDead) {
    const o = status.options ?? {};
    const value = Number(status.value);
    const max = o.customMax ? o.customMax : status.max || 100;
    const pct = Number.isFinite(value) ? (value / max) * 100 : 100;
    if (o.hideZero && Number.isFinite(value) && value <= 0) return true;
    if (o.hideHigh && Number.isFinite(value) && pct >= 90) return true;
    if (isDead && !o.visibleWhileDead) return true;
    return false;
}

export function isStatusLow(status) {
    const value = Number(status.value);
    if (!status.flash || !Number.isFinite(value)) return false;
    return status.inverted ? value >= 90 : value <= 10;
}

export function statusPercent(status) {
    const value = Number(status.value);
    const max = status.options?.customMax ? status.options.customMax : status.max || 100;
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(100, (value / max) * 100));
}

const pillBase = (solid) => ({
    display: 'flex',
    alignItems: 'center',
    height: 26,
    borderRadius: '8px',
    background: solid ? 'rgba(15, 18, 24, 0.9)' : 'rgba(15, 18, 24, 0.58)',
    border: `1px solid ${colors.border}`,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    overflow: 'hidden',
    transition: 'opacity 200ms var(--sb-ease)',
});

/** Icon + thin horizontal bar. */
export function StatusBar({ status, wide = false, solid = false }) {
    const low = isStatusLow(status);
    const pct = statusPercent(status);
    return (
        <Box
            sx={{
                ...pillBase(solid),
                width: wide ? 128 : 84,
                animation: low ? 'sb-pulse 1s linear infinite' : 'none',
            }}
        >
            <Box
                sx={{
                    width: 26,
                    height: '100%',
                    display: 'grid',
                    placeItems: 'center',
                    color: status.color || colors.text,
                    fontSize: 11,
                    borderRight: `1px solid ${colors.border}`,
                    flexShrink: 0,
                }}
            >
                <Icon icon={status.icon} />
            </Box>
            <Box sx={{ flex: 1, px: '7px' }}>
                <Box sx={{ height: 5, borderRadius: 999, background: 'rgba(255,255,255,0.14)', overflow: 'hidden' }}>
                    <Box
                        sx={{
                            height: '100%',
                            width: `${pct}%`,
                            borderRadius: 999,
                            background: low ? colors.danger : status.color || colors.accent,
                            transition: 'width 220ms var(--sb-ease)',
                        }}
                    />
                </Box>
            </Box>
        </Box>
    );
}

/** Icon + numeric value (also used for forced-number statuses such as the radio frequency). */
export function StatusNumber({ status, wide = false, solid = false }) {
    const low = isStatusLow(status);
    return (
        <Box
            sx={{
                ...pillBase(solid),
                width: wide ? 128 : 84,
                borderLeft: `3px solid ${status.color || colors.accent}`,
                animation: low ? 'sb-pulse 1s linear infinite' : 'none',
            }}
        >
            <Box
                sx={{
                    width: 24,
                    height: '100%',
                    display: 'grid',
                    placeItems: 'center',
                    color: colors.text2,
                    fontSize: 11,
                    flexShrink: 0,
                }}
            >
                <Icon icon={status.icon} />
            </Box>
            <Box
                className="sb-mono sb-truncate"
                sx={{ flex: 1, textAlign: 'center', pr: '8px', fontSize: 12.5, fontWeight: 600, color: colors.text }}
            >
                {status.value}
            </Box>
        </Box>
    );
}

/** Ring with the icon (or the number) in the middle: used by the condensed layout. */
export function StatusCircle({ status, showNumber = false }) {
    const low = isStatusLow(status);
    const pct = statusPercent(status);
    const numeric = showNumber && !status.options?.forceIcon;
    return (
        <RingGauge
            size={44}
            stroke={4}
            value={pct}
            color={low ? colors.danger : status.color || colors.accent}
            sx={{ animation: low ? 'sb-pulse 1s linear infinite' : 'none' }}
        >
            <Box
                sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(15, 18, 24, 0.85)',
                    display: 'grid',
                    placeItems: 'center',
                    position: 'relative',
                    color: colors.text,
                    fontSize: 13,
                }}
            >
                {numeric ? (
                    <>
                        <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', opacity: 0.15, fontSize: 15 }}>
                            <Icon icon={status.icon} />
                        </Box>
                        <Box className="sb-mono" sx={{ fontSize: 11, fontWeight: 600, position: 'relative' }}>
                            {status.value}
                        </Box>
                    </>
                ) : (
                    <Icon icon={status.icon} />
                )}
            </Box>
        </RingGauge>
    );
}
