import React from 'react';
import Box from '@mui/material/Box';
import { Button, Icon } from '@sandbox/ui-kit';
import { NakedToggle } from '../ped/NakedToggle.jsx';
import { formatMoney } from '../../lib/format.js';

/** Sticky bottom bar: undress preview, error line, cancel / save. */
export function Footer({ mode, price, busy, saving, error, onCancel, onSave }) {
    const saveLabel = mode.canCancel ? (price > 0 ? `${mode.saveLabel} ${formatMoney(price)}` : 'Save') : mode.saveLabel;
    return (
        <Box sx={{ borderTop: '1px solid var(--sb-border)', px: 2, py: 1.5, background: 'rgba(0, 0, 0, 0.16)' }}>
            {error && (
                <Box
                    role="alert"
                    sx={{
                        mb: 1.25,
                        px: 1.25,
                        py: 0.75,
                        borderRadius: 'var(--sb-radius-sm)',
                        background: 'var(--sb-danger-soft)',
                        color: 'var(--sb-danger)',
                        fontSize: 12.5,
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                    }}
                >
                    <Icon icon="circle-exclamation" />
                    {error}
                </Box>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NakedToggle />
                <Box sx={{ flex: 1 }} />
                {mode.canCancel && (
                    <Button tone="ghost" icon="xmark" onClick={onCancel} disabled={saving}>
                        Cancel
                    </Button>
                )}
                <Button tone="primary" icon={mode.canCancel ? 'floppy-disk' : 'check'} onClick={onSave} disabled={busy || saving}>
                    {saving ? 'Saving…' : saveLabel}
                </Button>
            </Box>
        </Box>
    );
}
