import React from 'react';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Grow from '@mui/material/Grow';
import { Icon, RichText, colors } from '@sandbox/ui-kit';

/** The newest key prompt ("{key}E{/key} Open door"), centred above the vehicle cluster. */
export default function ActionPrompt() {
    const actions = useSelector((s) => s.actions.actions);
    const action = actions.length ? actions[actions.length - 1] : null;
    return (
        <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 244, display: 'flex', justifyContent: 'center' }}>
            <Grow in={Boolean(action)} mountOnEnter unmountOnExit>
                <Box
                    className="sb-glass"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        px: '14px',
                        py: '8px',
                        borderRadius: '999px',
                        fontSize: 15,
                        fontWeight: 500,
                        color: colors.text,
                        maxWidth: 560,
                    }}
                >
                    <Box sx={{ color: colors.accent, fontSize: 13, display: 'flex' }}>
                        <Icon icon="circle-info" />
                    </Box>
                    <RichText text={action?.message ?? ''} component="span" />
                </Box>
            </Grow>
        </Box>
    );
}
