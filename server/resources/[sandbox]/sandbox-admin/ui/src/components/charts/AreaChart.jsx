import React, { useId, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useSize from './useSize.js';

const STEPS = [1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200, 250, 300, 400, 500, 1000];

function niceTicks(maxValue, target = 4) {
    const raw = Math.max(1, maxValue) / target;
    const step = STEPS.find((s) => s >= raw) ?? STEPS[STEPS.length - 1] * Math.ceil(raw / STEPS[STEPS.length - 1]);
    const top = step * Math.max(1, Math.ceil(Math.max(1, maxValue) / step));
    const ticks = [];
    for (let v = 0; v <= top; v += step) ticks.push(v);
    return { step, top, ticks };
}

/**
 * Single-series area chart drawn with inline SVG.
 * points: [{ t: unix seconds, v: number, label?: string }]
 * Hover shows a crosshair and a tooltip for the nearest sample.
 */
export default function AreaChart({ points, height: fixedHeight = 300, fill = false, color = 'var(--sb-accent)', formatX, formatY = (v) => String(v), unit = '' }) {
    const ref = useRef(null);
    const size = useSize(ref);
    const width = size.width;
    const height = fill ? size.height : fixedHeight;
    const gradId = useId();
    const [hover, setHover] = useState(null);

    const pad = { top: 18, right: 28, bottom: 30, left: 44 };
    const innerW = Math.max(0, width - pad.left - pad.right);
    const innerH = Math.max(0, height - pad.top - pad.bottom);

    const geom = useMemo(() => {
        const n = points.length;
        const maxV = Math.max(0, ...points.map((p) => p.v));
        const { top, ticks } = niceTicks(maxV * 1.06, 4);
        const x = (i) => pad.left + (n > 1 ? (i / (n - 1)) * innerW : innerW / 2);
        const y = (v) => pad.top + innerH - (v / top) * innerH;
        const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ');
        const base = pad.top + innerH;
        const area = n ? `${line} L${x(n - 1).toFixed(1)},${base} L${x(0).toFixed(1)},${base} Z` : '';
        const every = Math.max(1, Math.ceil(n / 8));
        return { n, top, ticks, x, y, line, area, base, every };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [points, innerW, innerH]);

    const onMove = (e) => {
        if (!geom.n) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const px = e.clientX - rect.left;
        let best = 0;
        let bestD = Infinity;
        for (let i = 0; i < geom.n; i += 1) {
            const d = Math.abs(geom.x(i) - px);
            if (d < bestD) {
                bestD = d;
                best = i;
            }
        }
        setHover(best);
    };

    const hp = hover !== null ? points[hover] : null;
    const tipLeft = hp ? geom.x(hover) : 0;
    const flip = hp && tipLeft > width - 150;

    return (
        <Box ref={ref} sx={{ position: 'relative', width: '100%', minWidth: 0, ...(fill ? { flex: 1, minHeight: 220 } : { height }) }}>
            {width > 0 && height > 0 && (
                <svg
                    width={width}
                    height={height}
                    role="img"
                    aria-label="Player count over time"
                    onMouseMove={onMove}
                    onMouseLeave={() => setHover(null)}
                    style={{ display: 'block', overflow: 'visible' }}
                >
                    <defs>
                        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                        </linearGradient>
                    </defs>

                    {geom.ticks.map((t) => (
                        <g key={t}>
                            <line
                                x1={pad.left}
                                x2={width - pad.right}
                                y1={geom.y(t)}
                                y2={geom.y(t)}
                                stroke="rgba(255,255,255,0.07)"
                                strokeDasharray={t === 0 ? undefined : '2 4'}
                            />
                            <text x={pad.left - 10} y={geom.y(t)} dy="0.35em" textAnchor="end" fontSize="11" fill="var(--sb-text-3)" fontFamily="var(--sb-font-mono)">
                                {formatY(t)}
                            </text>
                        </g>
                    ))}

                    {points.map((p, i) =>
                        i % geom.every === 0 || i === geom.n - 1 ? (
                            <text
                                key={`x${i}`}
                                x={geom.x(i)}
                                y={height - 8}
                                textAnchor={i === geom.n - 1 ? 'end' : i === 0 ? 'start' : 'middle'}
                                fontSize="11"
                                fill={i === geom.n - 1 ? 'var(--sb-text-2)' : 'var(--sb-text-3)'}
                                fontFamily="var(--sb-font-mono)"
                                fontWeight={i === geom.n - 1 ? 600 : 400}
                            >
                                {p.label ?? (formatX ? formatX(p.t) : p.t)}
                            </text>
                        ) : null,
                    )}

                    {geom.n > 0 && (
                        <>
                            <path d={geom.area} fill={`url(#${gradId})`} />
                            <path d={geom.line} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                            <circle cx={geom.x(geom.n - 1)} cy={geom.y(points[geom.n - 1].v)} r={4} fill={color} stroke="var(--sb-bg-2)" strokeWidth={2} />
                            <text
                                x={geom.x(geom.n - 1) - 10}
                                y={geom.y(points[geom.n - 1].v) - 10}
                                textAnchor="end"
                                fontSize="12"
                                fontWeight="600"
                                fill="var(--sb-text)"
                                fontFamily="var(--sb-font-mono)"
                            >
                                {formatY(points[geom.n - 1].v)}
                                {unit}
                            </text>
                        </>
                    )}

                    {hp && (
                        <g pointerEvents="none">
                            <line x1={geom.x(hover)} x2={geom.x(hover)} y1={pad.top} y2={geom.base} stroke="rgba(255,255,255,0.22)" />
                            <circle cx={geom.x(hover)} cy={geom.y(hp.v)} r={5} fill={color} stroke="var(--sb-bg-1)" strokeWidth={2} />
                        </g>
                    )}
                </svg>
            )}

            {hp && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: Math.max(0, geom.y(hp.v) - 46),
                        left: flip ? undefined : tipLeft + 12,
                        right: flip ? width - tipLeft + 12 : undefined,
                        pointerEvents: 'none',
                        px: 1.25,
                        py: 0.75,
                        borderRadius: '8px',
                        background: 'var(--sb-surface-strong)',
                        border: '1px solid var(--sb-border-strong)',
                        boxShadow: 'var(--sb-shadow-1)',
                        whiteSpace: 'nowrap',
                    }}
                >
                    <Typography variant="caption" sx={{ display: 'block', color: 'var(--sb-text-3)' }}>
                        {hp.label ?? (formatX ? formatX(hp.t) : hp.t)}
                    </Typography>
                    <Typography className="sb-mono" sx={{ fontSize: 13, fontWeight: 600 }}>
                        {formatY(hp.v)}
                        {unit}
                    </Typography>
                </Box>
            )}
        </Box>
    );
}
