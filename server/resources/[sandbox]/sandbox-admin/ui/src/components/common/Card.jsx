import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Icon } from '@sandbox/ui-kit';

/** Inner surface used inside the console window (no extra blur/shadow). */
export default function Card({ title, subtitle, icon, actions, children, sx, bodySx, ...rest }) {
    return (
        <Box
            sx={{
                background: 'var(--sb-surface-soft)',
                border: '1px solid var(--sb-border)',
                borderRadius: '14px',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
                minHeight: 0,
                ...sx,
            }}
            {...rest}
        >
            {(title || actions) && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.5 }}>
                    {icon && (
                        <Box sx={{ color: 'var(--sb-accent)', fontSize: 13, display: 'grid', placeItems: 'center' }}>
                            <Icon icon={icon} />
                        </Box>
                    )}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="h5" className="sb-truncate">
                            {title}
                        </Typography>
                        {subtitle && (
                            <Typography variant="caption" sx={{ display: 'block' }}>
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                    {actions && <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>{actions}</Box>}
                </Box>
            )}
            <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, ...bodySx }}>{children}</Box>
        </Box>
    );
}
