import React from 'react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { Button } from '@sandbox/ui-kit';

const dangerSx = {
    color: 'var(--sb-danger)',
    borderColor: 'rgba(240, 71, 90, 0.45)',
    '&:hover': { background: 'var(--sb-danger-soft)', borderColor: 'var(--sb-danger)' },
    '&.Mui-disabled': { color: 'var(--sb-text-disabled)', borderColor: 'var(--sb-border)' },
};

/**
 * Row of action buttons.
 * actions: [{ key, label, icon, tone?: 'primary'|'neutral'|'danger', disabled?, hint? }]
 */
export default function ActionBar({ actions, onAction, busy = false, size, sx }) {
    return (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', ...sx }}>
            {actions.map((a) => {
                const btn = (
                    <Button
                        key={a.key}
                        size={size}
                        icon={a.icon}
                        tone={a.tone === 'danger' ? 'neutral' : (a.tone ?? 'neutral')}
                        disabled={busy || Boolean(a.disabled)}
                        onClick={() => onAction(a)}
                        sx={a.tone === 'danger' ? dangerSx : undefined}
                    >
                        {a.label}
                    </Button>
                );
                return a.hint ? (
                    <Tooltip key={a.key} title={a.hint}>
                        <span style={{ display: 'inline-flex' }}>{btn}</span>
                    </Tooltip>
                ) : (
                    btn
                );
            })}
        </Box>
    );
}
