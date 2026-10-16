import React from 'react';
import Box from '@mui/material/Box';
import { EmptyState } from '@sandbox/ui-kit';

export default function NoCallsign() {
    return (
        <Box sx={{ height: '100%', display: 'grid', placeItems: 'center' }}>
            <EmptyState
                icon="id-badge"
                title="No callsign assigned"
                description="Your callsign has not been assigned yet. A callsign is required to access the Electronic Records System. If you are not sure why you are seeing this, contact a superior."
            />
        </Box>
    );
}
