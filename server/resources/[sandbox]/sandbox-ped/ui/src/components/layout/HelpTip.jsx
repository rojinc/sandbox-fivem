import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Panel, Kbd, Icon } from '@sandbox/ui-kit';

function Hint({ children, label }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            {children}
            <Typography variant="caption" sx={{ color: 'var(--sb-text-2)', fontWeight: 500 }}>
                {label}
            </Typography>
        </Box>
    );
}

/** Keyboard/mouse hints, top right, non-interactive. */
export function HelpTip({ canCancel }) {
    return (
        <Panel padding="6px 12px" radius={999} sx={{ position: 'absolute', top: 24, right: 24, display: 'flex', alignItems: 'center', gap: 2, pointerEvents: 'none' }}>
            <Hint label="Rotate">
                <Kbd>Q</Kbd>
                <Kbd>E</Kbd>
            </Hint>
            <Hint label="Pose">
                <Kbd>R</Kbd>
            </Hint>
            <Hint label="Zoom">
                <Icon icon="computer-mouse" style={{ fontSize: 12, color: 'var(--sb-text-2)' }} />
            </Hint>
            <Hint label={canCancel ? 'Cancel' : 'Finish'}>
                <Kbd>Esc</Kbd>
            </Hint>
        </Panel>
    );
}
