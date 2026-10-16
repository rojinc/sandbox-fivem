import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState, Button } from '@sandbox/ui-kit';

export default function NotFound() {
    const navigate = useNavigate();
    return (
        <EmptyState
            icon="compass"
            title="There is nothing here"
            description="That page does not exist in this console or is not available to your staff group."
            sx={{ m: 'auto' }}
            action={
                <Button tone="primary" icon="gauge-high" onClick={() => navigate('/')}>
                    Go to the dashboard
                </Button>
            }
        />
    );
}
