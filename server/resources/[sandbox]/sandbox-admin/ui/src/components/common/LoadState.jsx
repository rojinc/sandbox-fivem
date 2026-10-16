import React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { EmptyState, Button } from '@sandbox/ui-kit';

export function Loading({ text = 'Loading…' }) {
    return (
        <Box sx={{ m: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, color: 'var(--sb-text-3)', py: 6 }}>
            <CircularProgress size={28} thickness={4} color="primary" />
            <Typography variant="body2">{text}</Typography>
        </Box>
    );
}

export function Problem({ icon = 'triangle-exclamation', title, description, retry, retryLabel = 'Try again', back }) {
    return (
        <EmptyState
            icon={icon}
            title={title}
            description={description}
            sx={{ m: 'auto' }}
            action={
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {back && (
                        <Button tone="ghost" icon="arrow-left" onClick={back}>
                            Go back
                        </Button>
                    )}
                    {retry && (
                        <Button tone="neutral" icon="arrows-rotate" onClick={retry}>
                            {retryLabel}
                        </Button>
                    )}
                </Box>
            }
        />
    );
}
