import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Draggable from 'react-draggable';
import { Button, Icon } from '@sandbox/ui-kit';

function DraggablePaper(props) {
    const nodeRef = useRef(null);
    return (
        <Draggable nodeRef={nodeRef} handle="#mdt-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
            <Paper ref={nodeRef} {...props} />
        </Draggable>
    );
}

/**
 * Draggable glass dialog. Pass `onSubmit` to wrap the body in a <form>
 * (Enter submits); `onAccept` for a plain confirm button; `onDelete` for a
 * destructive secondary action.
 */
export default function Modal({
    open,
    title,
    icon,
    maxWidth = 'sm',
    onClose,
    onSubmit,
    onAccept,
    onDelete,
    submitLabel = 'Save',
    acceptLabel = 'OK',
    deleteLabel = 'Delete',
    closeLabel = 'Close',
    busy = false,
    hideActions = false,
    children,
}) {
    // Dialogs live outside the window; hide them with it.
    const mdtVisible = useSelector((s) => !s.app.hidden);
    const alertsVisible = useSelector((s) => s.alerts.showing);
    const visible = Boolean(open) && (mdtVisible || alertsVisible);

    const actions = !hideActions && (
        <DialogActions>
            {onDelete && (
                <Button tone="danger" type="button" onClick={onDelete} disabled={busy} sx={{ mr: 'auto' }}>
                    {deleteLabel}
                </Button>
            )}
            <Button tone="ghost" type="button" onClick={onClose} disabled={busy}>
                {closeLabel}
            </Button>
            {onSubmit && (
                <Button tone="primary" type="submit" disabled={busy}>
                    {submitLabel}
                </Button>
            )}
            {!onSubmit && onAccept && (
                <Button tone="primary" type="button" onClick={onAccept} disabled={busy}>
                    {acceptLabel}
                </Button>
            )}
        </DialogActions>
    );

    const body = (
        <>
            <DialogTitle id="mdt-dialog-title" sx={{ cursor: 'move', display: 'flex', alignItems: 'center', gap: 1.25 }}>
                {icon && (
                    <Box sx={{ color: 'var(--sb-accent)', fontSize: 14, display: 'grid', placeItems: 'center' }}>
                        <Icon icon={icon} />
                    </Box>
                )}
                <span className="sb-truncate">{title}</span>
            </DialogTitle>
            <DialogContent sx={{ pt: 1 }}>{children}</DialogContent>
            {actions}
        </>
    );

    return (
        <Dialog open={visible} onClose={busy ? undefined : onClose} maxWidth={maxWidth} fullWidth PaperComponent={DraggablePaper} scroll="paper">
            {onSubmit ? (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSubmit(e);
                    }}
                >
                    {body}
                </form>
            ) : (
                body
            )}
        </Dialog>
    );
}
