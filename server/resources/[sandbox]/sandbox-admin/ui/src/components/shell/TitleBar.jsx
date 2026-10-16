import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { IconButton, Button, Kbd, fetchNui } from '@sandbox/ui-kit';
import UserAvatar from '../common/UserAvatar.jsx';
import { selectUser, selectPermissionName, selectPermissionLevel } from '../../features/app/reducer.js';
import { routeTitle } from '../../lib/permissions.js';

export default function TitleBar() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const user = useSelector(selectUser);
    const permissionName = useSelector(selectPermissionName);
    const permissionLevel = useSelector(selectPermissionLevel);

    return (
        <Box
            component="header"
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 2,
                borderBottom: '1px solid var(--sb-border)',
                minWidth: 0,
            }}
        >
            <IconButton icon="chevron-left" label="Back" onClick={() => navigate(-1)} />
            <IconButton icon="chevron-right" label="Forward" onClick={() => navigate(1)} />
            <Typography variant="h4" className="sb-truncate" sx={{ ml: 1, minWidth: 0 }}>
                {routeTitle(pathname)}
            </Typography>

            <Box sx={{ flex: 1 }} />

            {user && (
                <Tooltip title="View your own player record">
                    <ButtonBase
                        onClick={() => navigate(`/player/${user.Source}`)}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.25,
                            px: 1.25,
                            py: 0.5,
                            borderRadius: '8px',
                            transition: 'background var(--sb-dur-fast) var(--sb-ease)',
                            '&:hover': { background: 'var(--sb-surface-hover)' },
                            '&.Mui-focusVisible': { boxShadow: 'inset 0 0 0 1px var(--sb-border-accent)' },
                        }}
                    >
                        <Box sx={{ textAlign: 'right', minWidth: 0 }}>
                            <Typography className="sb-truncate" sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2, maxWidth: 220 }}>
                                {user.Name}
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', lineHeight: 1.2, color: 'var(--sb-accent)' }}>
                                {permissionName || 'Staff'}
                                <Box component="span" sx={{ color: 'var(--sb-text-3)' }}>
                                    {' '}
                                    · level {permissionLevel}
                                </Box>
                            </Typography>
                        </Box>
                        <UserAvatar src={user.Avatar} name={user.Name} size={32} />
                    </ButtonBase>
                </Tooltip>
            )}

            <Box sx={{ width: '1px', height: 24, background: 'var(--sb-border)', mx: 1.5, flexShrink: 0 }} />

            <Button tone="ghost" icon="xmark" onClick={() => fetchNui('Close')} sx={{ gap: 1 }}>
                Close
                <Kbd sx={{ ml: 0.5 }}>Esc</Kbd>
            </Button>
        </Box>
    );
}
