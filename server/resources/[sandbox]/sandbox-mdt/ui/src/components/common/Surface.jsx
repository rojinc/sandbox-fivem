import React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Icon } from '@sandbox/ui-kit';

/** Soft inner card used inside the terminal window. */
export const Surface = styled('div', { shouldForwardProp: (p) => !['padding', 'tone'].includes(p) })(
    ({ padding = 16 }) => ({
        position: 'relative',
        padding,
        borderRadius: 'var(--sb-radius-lg)',
        background: 'var(--sb-surface-soft)',
        border: '1px solid var(--sb-border)',
        minWidth: 0,
    }),
);

/** Header line of a Surface: icon tile, title, count/subtitle, actions. */
export function SurfaceHeader({ icon, title, subtitle, actions, sx }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.5, minHeight: 32, ...sx }}>
            {icon && (
                <Box
                    sx={{
                        width: 30,
                        height: 30,
                        borderRadius: '8px',
                        display: 'grid',
                        placeItems: 'center',
                        background: 'var(--sb-accent-soft)',
                        color: 'var(--sb-accent)',
                        flexShrink: 0,
                        fontSize: 13,
                    }}
                >
                    <Icon icon={icon} />
                </Box>
            )}
            <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="h5" className="sb-truncate">
                    {title}
                </Typography>
                {subtitle && (
                    <Typography variant="caption" className="sb-truncate" sx={{ display: 'block' }}>
                        {subtitle}
                    </Typography>
                )}
            </Box>
            {actions && <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', flexShrink: 0 }}>{actions}</Box>}
        </Box>
    );
}

/** Scrollable column that fills its parent. */
export const Scroll = styled('div')({
    minHeight: 0,
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
});

/** Full-height page wrapper. */
export const Page = styled('div')({
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
});

/** Toolbar row above a list. */
export const Toolbar = styled('div')({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
});
