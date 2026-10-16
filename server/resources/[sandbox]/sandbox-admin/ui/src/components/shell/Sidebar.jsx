import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Typography from '@mui/material/Typography';
import { Icon, Kbd, SectionTitle } from '@sandbox/ui-kit';
import logo from '../../assets/logo.webp';
import { useToast } from '../common/Toasts.jsx';
import { callNui, describeError, readResult } from '../../lib/nui.js';
import { selectPermissionLevel } from '../../features/app/reducer.js';
import { LEVEL } from '../../lib/permissions.js';

const itemSx = {
    borderRadius: '8px',
    minHeight: 38,
    px: 1.5,
    gap: 1.25,
    color: 'var(--sb-text-2)',
    transition: 'background var(--sb-dur-fast) var(--sb-ease), color var(--sb-dur-fast) var(--sb-ease)',
    '& .nav-icon': { width: 18, display: 'grid', placeItems: 'center', color: 'var(--sb-text-3)', fontSize: 13 },
    '&:hover': { background: 'var(--sb-surface-hover)', color: 'var(--sb-text)' },
    '&:hover .nav-icon': { color: 'var(--sb-text-2)' },
    '&.active': { background: 'var(--sb-accent-soft)', color: 'var(--sb-text)' },
    '&.active .nav-icon': { color: 'var(--sb-accent)' },
    '&.Mui-focusVisible': { boxShadow: 'inset 0 0 0 1px var(--sb-border-accent)', background: 'var(--sb-surface-hover)' },
};

function Item({ icon, label, trailing, ...rest }) {
    return (
        <ListItemButton disableRipple sx={itemSx} {...rest}>
            <Box className="nav-icon">
                <Icon icon={icon} />
            </Box>
            <Typography sx={{ fontSize: 13, fontWeight: 500, flex: 1, minWidth: 0 }} className="sb-truncate">
                {label}
            </Typography>
            {trailing}
        </ListItemButton>
    );
}

export default function Sidebar({ links, admin }) {
    const toast = useToast();
    const level = useSelector(selectPermissionLevel);
    const [busy, setBusy] = useState(null);

    const tool = async (name, okText) => {
        if (busy) return;
        setBusy(name);
        try {
            const res = await callNui(name);
            if (res === false) toast.error('You are not allowed to do that.');
            else if (res && typeof res === 'object') {
                const r = readResult(res, okText, 'Action failed');
                (r.ok ? toast.success : toast.error)(r.message);
            } else toast.success(okText);
        } catch (e) {
            toast.error(describeError(e));
        } finally {
            setBusy(null);
        }
    };

    return (
        <Box
            component="nav"
            aria-label="Console navigation"
            sx={{
                gridRow: '1 / span 2',
                borderRight: '1px solid var(--sb-border)',
                background: 'rgba(255,255,255,0.025)',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, height: 60, borderBottom: '1px solid var(--sb-border)' }}>
                <Box
                    component="img"
                    src={logo}
                    alt=""
                    sx={{ width: 34, height: 34, borderRadius: '50%', boxShadow: '0 0 0 1px var(--sb-border-strong)' }}
                />
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, lineHeight: 1.15, letterSpacing: -0.2 }}>Sandbox</Typography>
                    <Typography variant="caption" sx={{ display: 'block', lineHeight: 1.2 }}>
                        {admin ? 'Admin console' : 'Staff console'}
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: 1.25, pt: 2 }}>
                <SectionTitle sx={{ px: 1.5 }}>Navigate</SectionTitle>
                <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                    {links.map((l) => (
                        <Item key={l.path} component={NavLink} to={l.path} end={l.end} icon={l.icon} label={l.label} />
                    ))}
                </List>

                <SectionTitle sx={{ px: 1.5, mt: 3 }}>Tools</SectionTitle>
                <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                    <Item icon="id-badge" label="Toggle player IDs" onClick={() => tool('ToggleIDs', 'Player ID tags toggled')} />
                    {level >= LEVEL.INVISIBLE && (
                        <Item icon="eye-slash" label="Toggle invisibility" onClick={() => tool('ToggleInvisible', 'Invisibility toggled')} />
                    )}
                    <Item icon="link-slash" label="Stop spectating" onClick={() => tool('StopAllAttach', 'Detach requested')} />
                </List>
            </Box>

            <Box sx={{ px: 2.5, py: 1.75, borderTop: '1px solid var(--sb-border)', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Kbd>Esc</Kbd>
                <Typography variant="caption">closes the console</Typography>
            </Box>
        </Box>
    );
}
