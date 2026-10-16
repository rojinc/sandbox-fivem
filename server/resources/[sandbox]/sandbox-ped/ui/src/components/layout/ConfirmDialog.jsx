import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import { Button } from '@sandbox/ui-kit';

export function ConfirmDialog({ open, title, children, confirmLabel = 'Confirm', confirmIcon, cancelLabel = 'Back', tone = 'primary', busy = false, onConfirm, onCancel }) {
    return (
        <Dialog
            open={open}
            onClose={busy ? undefined : onCancel}
            maxWidth="xs"
            fullWidth
            slotProps={{
                paper: { 'data-nui-interactive': 'true' },
                backdrop: { sx: { backgroundColor: 'rgba(5, 7, 10, 0.4)' } },
            }}
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Typography variant="body2" component="div" sx={{ color: 'var(--sb-text-2)', display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {children}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button tone="ghost" onClick={onCancel} disabled={busy}>
                    {cancelLabel}
                </Button>
                <Button tone={tone} icon={confirmIcon} onClick={onConfirm} disabled={busy} autoFocus>
                    {confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
