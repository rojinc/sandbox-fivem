import React from 'react';

/** Tiny single-series line with a soft area fill; no axes, no labels. */
export default function Sparkline({ points, width = 110, height = 30, color = 'var(--sb-accent)' }) {
    if (!points || points.length < 2) return null;
    const vs = points.map((p) => p.v);
    const max = Math.max(1, ...vs);
    const x = (i) => 1 + (i / (points.length - 1)) * (width - 2);
    const y = (v) => height - 2 - (v / max) * (height - 6);
    const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ');
    const area = `${line} L${x(points.length - 1).toFixed(1)},${height} L${x(0).toFixed(1)},${height} Z`;
    const last = points[points.length - 1];
    return (
        <svg width={width} height={height} aria-hidden="true" style={{ display: 'block', overflow: 'visible' }}>
            <path d={area} fill={color} opacity={0.14} />
            <path d={line} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
            <circle cx={x(points.length - 1)} cy={y(last.v)} r={2.5} fill={color} stroke="var(--sb-bg-2)" strokeWidth={1.5} />
        </svg>
    );
}
