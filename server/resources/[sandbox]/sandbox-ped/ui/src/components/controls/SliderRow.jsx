import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { LiveSlider } from './LiveSlider.jsx';

/** Label on the left, live value on the right, slider underneath. */
export function SliderRow({ label, value, min, max, onChange, disabled = false, unit = '' }) {
    const current = typeof value === 'number' ? value : 0;
    return (
        <Box sx={{ opacity: disabled ? 0.55 : 1, transition: 'opacity var(--sb-dur-fast) var(--sb-ease)' }}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1 }}>
                <Typography variant="body2" className="sb-truncate" sx={{ color: disabled ? 'var(--sb-text-3)' : 'var(--sb-text)', fontWeight: 500 }}>
                    {label}
                </Typography>
                <Typography component="span" className="sb-mono" sx={{ fontSize: 12.5, fontWeight: 600, color: 'var(--sb-text-2)' }}>
                    {current > 0 && min < 0 ? `+${current}` : current}
                    {unit}
                </Typography>
            </Box>
            <LiveSlider value={current} min={min} max={max} onChange={onChange} disabled={disabled} />
        </Box>
    );
}
