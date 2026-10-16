import React from 'react';
import { styled, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MuiButton from '@mui/material/Button';
import MuiIconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import clsx from 'clsx';
import { Icon } from '../icons.jsx';
import { colors, radius, semanticColor, semanticSoft } from '../tokens.js';

/* ------------------------------------------------------------------ */
/* Surfaces                                                            */
/* ------------------------------------------------------------------ */

/**
 * Glass panel: the standard container for anything floating over the game.
 * `strong` = more opaque (dialogs, full apps); `flat` = no blur/shadow.
 */
export const Panel = styled('div', {
    shouldForwardProp: (p) => !['strong', 'flat', 'padding', 'radius'].includes(p),
})(({ strong, flat, padding = 16, radius: r = radius.lg }) => ({
    position: 'relative',
    padding,
    borderRadius: r,
    background: flat ? colors.bg2 : strong ? colors.surfaceStrong : colors.surface,
    border: `1px solid ${colors.border}`,
    boxShadow: flat ? 'none' : strong ? '0 24px 60px rgba(0,0,0,.55)' : '0 10px 30px rgba(0,0,0,.45)',
    ...(flat
        ? {}
        : {
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
          }),
}));

/** Header row for a Panel: title, optional subtitle, actions on the right. */
export function PanelHeader({ icon, title, subtitle, actions, sx, ...rest }) {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                pb: 1.5,
                mb: 1.5,
                borderBottom: `1px solid ${colors.border}`,
                ...sx,
            }}
            {...rest}
        >
            {icon && (
                <Box
                    sx={{
                        width: 32,
                        height: 32,
                        borderRadius: `${radius.sm}px`,
                        display: 'grid',
                        placeItems: 'center',
                        background: colors.accentSoft,
                        color: colors.accent,
                        flexShrink: 0,
                    }}
                >
                    <Icon icon={icon} />
                </Box>
            )}
            <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="h4" className="sb-truncate">
                    {title}
                </Typography>
                {subtitle && (
                    <Typography variant="caption" className="sb-truncate" sx={{ display: 'block' }}>
                        {subtitle}
                    </Typography>
                )}
            </Box>
            {actions && <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>{actions}</Box>}
        </Box>
    );
}

/** Small uppercase label used above groups of content. */
export function SectionTitle({ children, sx, ...rest }) {
    return (
        <Typography variant="h6" sx={{ color: colors.text3, mb: 1, ...sx }} {...rest}>
            {children}
        </Typography>
    );
}

/* ------------------------------------------------------------------ */
/* Actions                                                             */
/* ------------------------------------------------------------------ */

/**
 * Button with an optional leading icon and `tone` shortcut
 * (primary | neutral | danger | success | ghost).
 */
export function Button({ icon, tone = 'neutral', children, sx, ...rest }) {
    const toneProps =
        tone === 'primary'
            ? { variant: 'contained', color: 'primary' }
            : tone === 'danger'
              ? { variant: 'contained', color: 'error' }
              : tone === 'success'
                ? { variant: 'contained', color: 'success' }
                : tone === 'ghost'
                  ? { variant: 'text' }
                  : { variant: 'outlined' };

    return (
        <MuiButton
            {...toneProps}
            startIcon={icon ? <Icon icon={icon} /> : undefined}
            sx={{ ...sx }}
            {...rest}
        >
            {children}
        </MuiButton>
    );
}

/** Icon-only button with a tooltip label (label is also the aria-label). */
export function IconButton({ icon, label, size = 'small', sx, ...rest }) {
    const btn = (
        <MuiIconButton size={size} aria-label={label} sx={sx} {...rest}>
            <Icon icon={icon} />
        </MuiIconButton>
    );
    return label ? <Tooltip title={label}>{btn}</Tooltip> : btn;
}

/* ------------------------------------------------------------------ */
/* Data display                                                        */
/* ------------------------------------------------------------------ */

/** Keyboard key cap, e.g. <Kbd>E</Kbd>. */
export const Kbd = styled('kbd')({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 22,
    height: 22,
    padding: '0 6px',
    borderRadius: radius.xs,
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.18)',
    boxShadow: '0 1px 0 rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.08)',
    color: colors.text,
    fontFamily: 'var(--sb-font-mono)',
    fontSize: 11,
    fontWeight: 600,
    lineHeight: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
});

/** Pill tag with a semantic tone. */
export function Tag({ tone = 'neutral', icon, children, sx, ...rest }) {
    const color = tone === 'neutral' ? colors.text2 : semanticColor(tone);
    const bg = tone === 'neutral' ? colors.surfaceSoft : semanticSoft(tone);
    return (
        <Box
            component="span"
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                height: 22,
                px: 1,
                borderRadius: `${radius.pill}px`,
                background: bg,
                color,
                fontSize: 11.5,
                fontWeight: 600,
                lineHeight: 1,
                whiteSpace: 'nowrap',
                ...sx,
            }}
            {...rest}
        >
            {icon && <Icon icon={icon} style={{ fontSize: 10 }} />}
            {children}
        </Box>
    );
}

/** Thin progress bar with optional label/value. */
export function ProgressBar({ value = 0, max = 100, color = colors.accent, label, valueLabel, height = 6, sx, ...rest }) {
    const pct = Math.max(0, Math.min(100, (value / max) * 100));
    return (
        <Box sx={{ width: '100%', ...sx }} {...rest}>
            {(label || valueLabel) && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    {label && (
                        <Typography variant="caption" sx={{ color: colors.text2 }}>
                            {label}
                        </Typography>
                    )}
                    {valueLabel && (
                        <Typography variant="caption" className="sb-mono" sx={{ color: colors.text }}>
                            {valueLabel}
                        </Typography>
                    )}
                </Box>
            )}
            <Box
                sx={{
                    height,
                    borderRadius: `${radius.pill}px`,
                    background: 'rgba(255,255,255,0.12)',
                    overflow: 'hidden',
                }}
            >
                <Box
                    sx={{
                        height: '100%',
                        width: `${pct}%`,
                        borderRadius: `${radius.pill}px`,
                        background: color,
                        transition: 'width 220ms var(--sb-ease)',
                    }}
                />
            </Box>
        </Box>
    );
}

/** Label/value pair for dashboards and detail panes. */
export function Stat({ label, value, icon, mono = true, sx, ...rest }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0, ...sx }} {...rest}>
            {icon && (
                <Box sx={{ color: colors.text3, width: 18, textAlign: 'center' }}>
                    <Icon icon={icon} />
                </Box>
            )}
            <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" sx={{ display: 'block', color: colors.text3 }}>
                    {label}
                </Typography>
                <Typography variant="body1" className={clsx(mono && 'sb-mono', 'sb-truncate')} sx={{ fontWeight: 600 }}>
                    {value}
                </Typography>
            </Box>
        </Box>
    );
}

/** Centered placeholder for empty lists. */
export function EmptyState({ icon = 'inbox', title = 'Nothing here', description, action, sx, ...rest }) {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                gap: 1,
                py: 5,
                px: 3,
                color: colors.text3,
                ...sx,
            }}
            {...rest}
        >
            <Box
                sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    background: colors.surfaceSoft,
                    color: colors.text2,
                    fontSize: 18,
                }}
            >
                <Icon icon={icon} />
            </Box>
            <Typography variant="h5" sx={{ color: colors.text2 }}>
                {title}
            </Typography>
            {description && (
                <Typography variant="body2" sx={{ maxWidth: 320 }}>
                    {description}
                </Typography>
            )}
            {action && <Box sx={{ mt: 1 }}>{action}</Box>}
        </Box>
    );
}

/** Row with an icon in a tinted square, used for lists of options/apps. */
export function IconTile({ icon, tone = 'neutral', size = 36, sx, ...rest }) {
    const color = tone === 'neutral' ? colors.text : semanticColor(tone);
    const bg = tone === 'neutral' ? colors.surfaceSoft : alpha(color, 0.16);
    return (
        <Box
            sx={{
                width: size,
                height: size,
                borderRadius: `${radius.sm}px`,
                display: 'grid',
                placeItems: 'center',
                background: bg,
                color,
                flexShrink: 0,
                fontSize: size * 0.42,
                ...sx,
            }}
            {...rest}
        >
            <Icon icon={icon} />
        </Box>
    );
}

/** Hairline divider with optional centred label. */
export function Divider({ label, sx, ...rest }) {
    if (!label) {
        return <Box sx={{ height: 1, background: colors.border, my: 1.5, ...sx }} {...rest} />;
    }
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, my: 1.5, ...sx }} {...rest}>
            <Box sx={{ flex: 1, height: 1, background: colors.border }} />
            <Typography variant="overline" sx={{ color: colors.text3 }}>
                {label}
            </Typography>
            <Box sx={{ flex: 1, height: 1, background: colors.border }} />
        </Box>
    );
}
