import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import { Icon, fetchNui, useKey, colors } from '@sandbox/ui-kit';
import { describeArc } from '../hud/RingGauge.jsx';

const SIZE = 520;
const OUTER = 236;
const INNER = 92;
const CENTER = 66;

function polar(r, deg) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return [SIZE / 2 + r * Math.cos(rad), SIZE / 2 + r * Math.sin(rad)];
}

function slicePath(start, end) {
    const gap = 1.2;
    const a0 = start + gap;
    const a1 = end - gap;
    const [ox0, oy0] = polar(OUTER, a0);
    const [ox1, oy1] = polar(OUTER, a1);
    const [ix0, iy0] = polar(INNER, a0);
    const [ix1, iy1] = polar(INNER, a1);
    const large = a1 - a0 > 180 ? 1 : 0;
    return `M ${ox0} ${oy0} A ${OUTER} ${OUTER} 0 ${large} 1 ${ox1} ${oy1} L ${ix1} ${iy1} A ${INNER} ${INNER} 0 ${large} 0 ${ix0} ${iy0} Z`;
}

/** Radial menu opened with F1 (client/interaction.lua). Slices trigger Interaction:Trigger with the item. */
export default function InteractionWheel() {
    const { show, menuItems, layer } = useSelector((s) => s.interaction);
    const [hover, setHover] = useState(null);

    const hide = () => fetchNui('Interaction:Hide');
    const back = () => (layer === 0 ? hide() : fetchNui('Interaction:Back'));
    const trigger = (item) => fetchNui('Interaction:Trigger', item);

    useKey(['Escape', 'F1'], (e) => {
        e.preventDefault();
        hide();
    }, { enabled: show });

    const n = Math.max(1, menuItems.length);
    const step = 360 / n;

    return (
        <Fade in={show} mountOnEnter unmountOnExit>
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'grid',
                    placeItems: 'center',
                    pointerEvents: 'auto',
                    background: 'radial-gradient(circle at center, rgba(5,7,10,0.35) 0%, rgba(5,7,10,0) 60%)',
                }}
                onClick={hide}
            >
                <Box sx={{ position: 'relative', width: SIZE, height: SIZE }} onClick={(e) => e.stopPropagation()}>
                    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ position: 'absolute', inset: 0 }}>
                        <defs>
                            <filter id="wheel-shadow" x="-20%" y="-20%" width="140%" height="140%">
                                <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#000" floodOpacity="0.5" />
                            </filter>
                        </defs>
                        {menuItems.map((item, i) => {
                            const start = -step / 2 + i * step;
                            const active = hover === i;
                            return (
                                <path
                                    key={item.id ?? i}
                                    d={slicePath(start, start + step)}
                                    fill={active ? 'rgba(245, 184, 46, 0.22)' : 'rgba(15, 18, 24, 0.82)'}
                                    stroke={active ? colors.accent : 'rgba(255,255,255,0.1)'}
                                    strokeWidth={1}
                                    style={{ cursor: 'pointer', transition: 'fill 120ms, stroke 120ms', filter: 'url(#wheel-shadow)' }}
                                    onMouseEnter={() => setHover(i)}
                                    onMouseLeave={() => setHover(null)}
                                    onClick={() => trigger(item)}
                                />
                            );
                        })}
                        <path
                            d={describeArc(SIZE / 2, SIZE / 2, INNER - 6, 0, 359.99)}
                            fill="none"
                            stroke="rgba(255,255,255,0.08)"
                            strokeWidth={1}
                        />
                    </svg>
                    {menuItems.map((item, i) => {
                        const mid = i * step;
                        const [x, y] = polar((OUTER + INNER) / 2, mid);
                        const active = hover === i;
                        return (
                            <Box
                                key={`label-${item.id ?? i}`}
                                sx={{
                                    position: 'absolute',
                                    left: x,
                                    top: y,
                                    transform: 'translate(-50%, -50%)',
                                    width: 118,
                                    textAlign: 'center',
                                    pointerEvents: 'none',
                                    color: active ? colors.accent : colors.text,
                                    transition: 'color 120ms',
                                }}
                            >
                                <Box sx={{ fontSize: 24, lineHeight: 1 }}>
                                    <Icon icon={item.icon ?? 'question'} />
                                </Box>
                                {item.label && (
                                    <Box className="sb-overworld" sx={{ fontSize: 12.5, fontWeight: 600, mt: '6px', lineHeight: 1.2 }}>
                                        {item.label}
                                    </Box>
                                )}
                            </Box>
                        );
                    })}
                    <Box
                        role="button"
                        aria-label={layer === 0 ? 'Close' : 'Back'}
                        onClick={back}
                        sx={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            width: CENTER * 2,
                            height: CENTER * 2,
                            transform: 'translate(-50%, -50%)',
                            borderRadius: '50%',
                            background: 'rgba(15, 18, 24, 0.9)',
                            border: `2px solid ${colors.accent}`,
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: 26,
                            color: colors.text,
                            cursor: 'pointer',
                            transition: 'background 160ms var(--sb-ease), color 160ms',
                            '&:hover': { background: colors.accentSoft, color: colors.accent },
                        }}
                    >
                        <Icon icon={layer === 0 ? 'xmark' : 'arrow-left'} />
                    </Box>
                </Box>
            </Box>
        </Fade>
    );
}
