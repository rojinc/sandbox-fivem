import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/** A titled block of related controls on a soft surface. */
export function Group({ title, action, children, sx }) {
    return (
        <Box
            sx={{
                background: 'var(--sb-surface-soft)',
                border: '1px solid var(--sb-border)',
                borderRadius: 'var(--sb-radius-md)',
                p: 1.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.25,
                ...sx,
            }}
        >
            {(title || action) && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, minHeight: 22 }}>
                    <Typography variant="h6" sx={{ color: 'var(--sb-text-3)' }}>
                        {title}
                    </Typography>
                    {action}
                </Box>
            )}
            {children}
        </Box>
    );
}
