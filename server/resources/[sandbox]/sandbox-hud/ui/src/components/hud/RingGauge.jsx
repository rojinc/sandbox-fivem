import React from 'react';
import Box from '@mui/material/Box';

function polar(cx, cy, r, deg) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

/** SVG path for an arc from startDeg to endDeg (0 = top, clockwise). */
export function describeArc(cx, cy, r, startDeg, endDeg) {
    const sweep = Math.max(0, Math.min(359.999, endDeg - startDeg));
    if (sweep <= 0) return '';
    const [sx, sy] = polar(cx, cy, r, startDeg);
    const [ex, ey] = polar(cx, cy, r, startDeg + sweep);
    const large = sweep > 180 ? 1 : 0;
    return `M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`;
}

/**
 * Circular gauge. `arc` is the total sweep in degrees centred on `rotation`
 * (so arc=270, rotation=0 draws a speedometer-like open ring with the gap at
 * the bottom). Children render centred inside.
 */
export default function RingGauge({
    size = 44,
    stroke = 4,
    value = 0,
    arc = 360,
    rotation = 0,
    color = 'var(--sb-accent)',
    track = 'rgba(255,255,255,0.14)',
    counterClockwise = false,
    children,
    sx,
    ...rest
}) {
    const r = (size - stroke) / 2;
    const c = size / 2;
    const start = rotation - arc / 2;
    const pct = Math.max(0, Math.min(100, Number(value) || 0));
    const sweep = (arc * pct) / 100;
    const valueStart = counterClockwise ? start + arc - sweep : start;
    const valueEnd = valueStart + sweep;
    return (
        <Box
            sx={{ position: 'relative', width: size, height: size, flexShrink: 0, display: 'grid', placeItems: 'center', ...sx }}
            {...rest}
        >
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute', inset: 0 }}>
                <path
                    d={describeArc(c, c, r, start, start + arc)}
                    fill="none"
                    stroke={track}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                />
                {sweep > 0 && (
                    <path
                        d={describeArc(c, c, r, valueStart, valueEnd)}
                        fill="none"
                        stroke={color}
                        strokeWidth={stroke}
                        strokeLinecap="round"
                        style={{ transition: 'd 180ms var(--sb-ease)' }}
                    />
                )}
            </svg>
            <Box sx={{ position: 'relative', display: 'grid', placeItems: 'center' }}>{children}</Box>
        </Box>
    );
}
