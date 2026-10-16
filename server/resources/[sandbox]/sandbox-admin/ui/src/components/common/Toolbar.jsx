import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/** Row above a table: search / filters on the left, count + actions on the right. */
export default function Toolbar({ children, count, countLabel = 'results', actions }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            {children}
            <Box sx={{ flex: 1 }} />
            {count !== undefined && (
                <Typography variant="body2" className="sb-mono" sx={{ color: 'var(--sb-text-3)' }}>
                    {count} {countLabel}
                </Typography>
            )}
            {actions}
        </Box>
    );
}
