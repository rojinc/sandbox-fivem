import React from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import ConfirmDialog from '../common/ConfirmDialog.jsx';
import { BAN_LENGTHS } from '../../lib/permissions.js';

export function KickDialog({ open, playerName, reason, onReason, busy, onClose, onConfirm }) {
    return (
        <ConfirmDialog
            open={open}
            title={`Kick ${playerName}`}
            description="The player is dropped from the server immediately and sees the reason you give."
            confirmLabel="Kick player"
            confirmIcon="right-from-bracket"
            tone="danger"
            busy={busy}
            disabled={!reason.trim()}
            onClose={onClose}
            onConfirm={onConfirm}
            maxWidth="sm"
        >
            <TextField
                autoFocus
                required
                fullWidth
                multiline
                minRows={2}
                label="Reason"
                placeholder="Why is this player being kicked?"
                value={reason}
                onChange={(e) => onReason(e.target.value)}
                helperText="Required. Keep it short and specific."
            />
        </ConfirmDialog>
    );
}

export function BanDialog({ open, playerName, level, reason, onReason, length, onLength, busy, onClose, onConfirm }) {
    const lengths = BAN_LENGTHS.filter((l) => level >= l.level);
    return (
        <ConfirmDialog
            open={open}
            title={`Ban ${playerName}`}
            description="The player is removed and cannot reconnect until the ban expires."
            confirmLabel="Ban player"
            confirmIcon="ban"
            tone="danger"
            busy={busy}
            disabled={!reason.trim() || !lengths.length}
            onClose={onClose}
            onConfirm={onConfirm}
            maxWidth="sm"
        >
            <TextField select fullWidth label="Length" value={length} onChange={(e) => onLength(Number(e.target.value))}>
                {lengths.map((l) => (
                    <MenuItem key={l.value} value={l.value}>
                        {l.label}
                    </MenuItem>
                ))}
            </TextField>
            <TextField
                autoFocus
                required
                fullWidth
                multiline
                minRows={2}
                label="Reason"
                placeholder="Why is this player being banned?"
                value={reason}
                onChange={(e) => onReason(e.target.value)}
                helperText="Required. Shown to the player and logged."
            />
        </ConfirmDialog>
    );
}
