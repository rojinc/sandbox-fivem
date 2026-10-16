import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { Icon, IconButton, Kbd, fetchNui } from '@sandbox/ui-kit';
import { useRole, useTick, useGovJob, useUser } from '../../hooks/index.js';
import { pageTitle } from '../../lib/nav.js';

function AlertIndicator() {
    useTick(15000);
    const connected = useSelector((s) => s.alerts.socketConnected);
    const alerts = useSelector((s) => s.alerts.alerts);
    const bodycam = useSelector((s) => s.bodycam.show);
    const recent = alerts.filter((a) => Date.now() - (a.time ?? 0) <= 5 * 60000).length;
    const panic = alerts.some((a) => a.panic && Date.now() - (a.time ?? 0) <= 5 * 60000);

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {bodycam && (
                <Tooltip title="Body camera recording">
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1, height: 28, borderRadius: 'var(--sb-radius-pill)', background: 'var(--sb-danger-soft)', color: 'var(--sb-danger)', fontSize: 11.5, fontWeight: 600 }}>
                        <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--sb-danger)', animation: 'sb-pulse 1.4s infinite' }} />
                        REC
                    </Box>
                </Tooltip>
            )}
            <Tooltip
                title={
                    connected ? (
                        <span>
                            Dispatch online · press <Kbd>`</Kbd> to open the alerts panel
                        </span>
                    ) : (
                        'Dispatch offline'
                    )
                }
            >
                <Box
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.75,
                        px: 1.25,
                        height: 28,
                        borderRadius: 'var(--sb-radius-pill)',
                        background: panic ? 'var(--sb-danger-soft)' : connected ? 'var(--sb-success-soft)' : 'var(--sb-surface-soft)',
                        color: panic ? 'var(--sb-danger)' : connected ? 'var(--sb-success)' : 'var(--sb-text-3)',
                        fontSize: 11.5,
                        fontWeight: 600,
                        border: '1px solid transparent',
                        animation: panic ? 'sb-pulse 1s infinite' : undefined,
                    }}
                >
                    <Icon icon="bell" style={{ fontSize: 11 }} />
                    {connected ? (recent > 0 ? `${recent} active` : 'Dispatch') : 'Offline'}
                </Box>
            </Tooltip>
        </Box>
    );
}

export default function TopBar() {
    const role = useRole();
    const location = useLocation();
    const navigate = useNavigate();
    const govJob = useGovJob();
    const user = useUser();
    const title = pageTitle(location.pathname, role);

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: 60, px: 2, borderBottom: '1px solid var(--sb-border)' }}>
            <Box sx={{ display: 'flex', gap: 0.25 }}>
                <IconButton icon="arrow-left" label="Back" onClick={() => navigate(-1)} />
                <IconButton icon="arrow-right" label="Forward" onClick={() => navigate(1)} />
            </Box>
            <Typography variant="h4" className="sb-truncate" sx={{ flex: 1 }}>
                {title}
            </Typography>
            <AlertIndicator />
            {govJob?.Workplace?.Name && (
                <Typography variant="caption" className="sb-truncate" sx={{ maxWidth: 260 }}>
                    {govJob.Workplace.Name}
                    {user?.Callsign ? ` · Unit ${user.Callsign}` : ''}
                </Typography>
            )}
            <Box sx={{ width: 1, height: 24, background: 'var(--sb-border)', mx: 0.5 }} />
            <Tooltip title="Close (Esc)">
                <span>
                    <IconButton icon="xmark" label="Close terminal" onClick={() => fetchNui('Close')} />
                </span>
            </Tooltip>
        </Box>
    );
}
