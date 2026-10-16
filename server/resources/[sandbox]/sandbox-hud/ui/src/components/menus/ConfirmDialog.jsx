import React from 'react';
import { useSelector } from 'react-redux';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import { Button, RichText, fetchNui, useKey, colors } from '@sandbox/ui-kit';

/** Yes/No dialog for Confirm:Show (client/confirm.lua). */
export default function ConfirmDialog() {
    const confirm = useSelector((s) => s.confirm);
    const accept = () => fetchNui('Confirm:Yes', { event: confirm.yes, data: confirm.data });
    const deny = () => fetchNui('Confirm:No', { event: confirm.no, data: confirm.data });

    useKey('Escape', deny, { enabled: confirm.showing });
    useKey('Enter', accept, { enabled: confirm.showing });

    return (
        <Dialog open={Boolean(confirm.showing)} onClose={deny} fullWidth maxWidth="xs">
            <DialogTitle>{confirm.title}</DialogTitle>
            {confirm.description && (
                <DialogContent>
                    <Box sx={{ color: colors.text2, fontSize: 14, lineHeight: 1.5 }}>
                        <RichText text={confirm.description} component="div" />
                    </Box>
                </DialogContent>
            )}
            <DialogActions>
                <Button tone="ghost" onClick={deny}>
                    {confirm.denyLabel ?? 'No'}
                </Button>
                <Button tone="primary" onClick={accept}>
                    {confirm.acceptLabel ?? 'Yes'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
