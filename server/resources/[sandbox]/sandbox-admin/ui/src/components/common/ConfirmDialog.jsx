import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import { Button } from '@sandbox/ui-kit';

/**
 * Confirmation / small form dialog. Escape and the backdrop close it; the
 * global Escape-to-close handler ignores events coming from inside it.
 * When `onSubmit` is given the body is a <form> and Enter submits.
 */
export default function ConfirmDialog({
    open,
    title,
    description,
    children,
    confirmLabel = 'Confirm',
    confirmIcon,
    tone = 'primary',
    busy = false,
    disabled = false,
    onClose,
    onConfirm,
    maxWidth = 'xs',
}) {
    const submit = (e) => {
        e.preventDefault();
        if (!busy && !disabled) onConfirm();
    };

    return (
        <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth={maxWidth} fullWidth>
            <form onSubmit={submit}>
                <DialogTitle>{title}</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {description && (
                        <Typography variant="body2" sx={{ color: 'var(--sb-text-2)' }}>
                            {description}
                        </Typography>
                    )}
                    {children}
                </DialogContent>
                <DialogActions>
                    <Button tone="ghost" type="button" onClick={onClose} disabled={busy}>
                        Cancel
                    </Button>
                    <Button tone={tone} type="submit" icon={confirmIcon} disabled={busy || disabled} autoFocus={!children}>
                        {busy ? 'Working…' : confirmLabel}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
