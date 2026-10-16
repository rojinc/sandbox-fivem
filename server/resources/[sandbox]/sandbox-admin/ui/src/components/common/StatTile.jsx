import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Icon, semanticColor } from '@sandbox/ui-kit';
import Card from './Card.jsx';

export default function StatTile({ label, value, suffix, hint, icon, tone, aside, children, sx }) {
    return (
        <Card sx={{ p: 2, gap: 0.5, minHeight: 112, ...sx }} bodySx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Typography variant="overline" sx={{ color: 'var(--sb-text-3)' }}>
                    {label}
                </Typography>
                {icon && (
                    <Box sx={{ color: tone ? semanticColor(tone) : 'var(--sb-text-3)', fontSize: 13, display: 'grid' }}>
                        <Icon icon={icon} />
                    </Box>
                )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75, minWidth: 0 }}>
                    <Typography className="sb-mono" sx={{ fontSize: 30, fontWeight: 600, lineHeight: 1.05, letterSpacing: -0.6 }}>
                        {value}
                    </Typography>
                    {suffix && (
                        <Typography className="sb-mono" sx={{ color: 'var(--sb-text-3)', fontSize: 14 }}>
                            {suffix}
                        </Typography>
                    )}
                </Box>
                {aside}
            </Box>
            {children ?? (hint && <Typography variant="caption">{hint}</Typography>)}
        </Card>
    );
}
