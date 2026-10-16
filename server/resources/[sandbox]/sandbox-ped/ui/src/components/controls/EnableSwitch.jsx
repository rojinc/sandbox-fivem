import React from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

/** Small on/off switch with a muted label, used in group headers. */
export function EnableSwitch({ checked, onChange, disabled, label, sx }) {
    const on = Boolean(checked);
    return (
        <FormControlLabel
            labelPlacement="start"
            sx={{ m: 0, gap: 0.5, ...sx }}
            control={<Switch size="small" checked={on} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />}
            label={
                <Typography variant="caption" sx={{ color: on ? 'var(--sb-text-2)' : 'var(--sb-text-3)', fontWeight: 600 }}>
                    {label ?? (on ? 'On' : 'Off')}
                </Typography>
            }
        />
    );
}
