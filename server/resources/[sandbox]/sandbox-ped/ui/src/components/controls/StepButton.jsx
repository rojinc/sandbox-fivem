import React from 'react';
import MuiIconButton from '@mui/material/IconButton';
import { Icon } from '@sandbox/ui-kit';

/** Square 28px −/+ button used by steppers. */
export function StepButton({ icon, label, onClick, disabled, sx }) {
    return (
        <MuiIconButton
            size="small"
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
            sx={{
                width: 28,
                height: 28,
                flexShrink: 0,
                fontSize: 11,
                border: '1px solid var(--sb-border-strong)',
                background: 'var(--sb-surface-soft)',
                color: 'var(--sb-text)',
                '&:hover': { background: 'var(--sb-surface-hover)', borderColor: 'var(--sb-border-accent)' },
                '&:active': { background: 'var(--sb-surface-active)' },
                '&.Mui-focusVisible': { borderColor: 'var(--sb-accent)' },
                '&.Mui-disabled': { color: 'var(--sb-text-disabled)', borderColor: 'var(--sb-border)' },
                ...sx,
            }}
        >
            <Icon icon={icon} />
        </MuiIconButton>
    );
}
