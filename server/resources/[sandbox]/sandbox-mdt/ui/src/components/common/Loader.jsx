import React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

export default function Loader({ text = 'Loading', size = 36, sx }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5, py: 6, color: 'var(--sb-text-3)', ...sx }}>
            <CircularProgress size={size} thickness={3} />
            <Typography variant="body2">{text}</Typography>
        </Box>
    );
}
