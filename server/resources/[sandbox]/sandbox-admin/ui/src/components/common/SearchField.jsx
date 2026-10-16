import React from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Box from '@mui/material/Box';
import { Icon, IconButton } from '@sandbox/ui-kit';

export default function SearchField({ value, onChange, onSubmit, placeholder = 'Search', width = 360, autoFocus = false, sx }) {
    return (
        <OutlinedInput
            size="small"
            value={value}
            autoFocus={autoFocus}
            placeholder={placeholder}
            inputProps={{ 'aria-label': placeholder }}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && onSubmit) {
                    e.preventDefault();
                    onSubmit(value);
                }
            }}
            startAdornment={
                <InputAdornment position="start">
                    <Box sx={{ color: 'var(--sb-text-3)', fontSize: 12, display: 'grid' }}>
                        <Icon icon="magnifying-glass" />
                    </Box>
                </InputAdornment>
            }
            endAdornment={
                value ? (
                    <InputAdornment position="end">
                        <IconButton
                            icon="xmark"
                            label="Clear"
                            onClick={() => {
                                onChange('');
                                if (onSubmit) onSubmit('');
                            }}
                            sx={{ mr: -0.5 }}
                        />
                    </InputAdornment>
                ) : null
            }
            sx={{ width, height: 36, fontSize: 13, '& input': { py: 0 }, ...sx }}
        />
    );
}
