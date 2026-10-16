import React from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import { Icon, IconButton } from '@sandbox/ui-kit';

/** Search input with clear + submit affordances. Enter submits. */
export default function SearchField({
    value,
    onChange,
    onSubmit,
    onClear,
    placeholder = 'Search',
    loading = false,
    error = false,
    helperText,
    autoFocus = false,
    disabled = false,
    sx,
    endAdornment = null,
    size = 'small',
}) {
    return (
        <TextField
            size={size}
            fullWidth
            value={value}
            disabled={disabled}
            autoFocus={autoFocus}
            placeholder={placeholder}
            error={error}
            helperText={helperText}
            onChange={(e) => onChange?.(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    onSubmit?.(value);
                }
            }}
            sx={sx}
            slotProps={{
                input: {
                    startAdornment: (
                        <InputAdornment position="start" sx={{ color: 'var(--sb-text-3)' }}>
                            {loading ? <CircularProgress size={14} color="inherit" /> : <Icon icon="magnifying-glass" />}
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position="end">
                            {value ? <IconButton icon="xmark" label="Clear" onClick={() => (onClear ? onClear() : onChange?.(''))} /> : null}
                            {endAdornment}
                        </InputAdornment>
                    ),
                },
            }}
        />
    );
}
