import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import { Icon } from '@sandbox/ui-kit';
import { usePermissions, useRole, useSeal, useUser, useGovJob } from '../../hooks/index.js';
import { navForRole, branding } from '../../lib/nav.js';

function NavItem({ item, active, onClick }) {
    return (
        <Box
            component="button"
            type="button"
            onClick={onClick}
            aria-current={active ? 'page' : undefined}
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                width: '100%',
                height: 38,
                px: 1.5,
                border: 0,
                borderRadius: 'var(--sb-radius-sm)',
                background: active ? 'var(--sb-accent-soft)' : 'transparent',
                color: active ? 'var(--sb-accent)' : 'var(--sb-text-2)',
                fontWeight: active ? 600 : 500,
                fontSize: 13.5,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'background var(--sb-dur-fast) var(--sb-ease), color var(--sb-dur-fast) var(--sb-ease)',
                '&:hover': { background: active ? 'var(--sb-accent-soft)' : 'var(--sb-surface-hover)', color: active ? 'var(--sb-accent)' : 'var(--sb-text)' },
                '&:focus-visible': { outline: '1px solid var(--sb-accent)', outlineOffset: -1 },
            }}
        >
            <Box sx={{ width: 20, textAlign: 'center', fontSize: 14 }}>
                <Icon icon={item.icon} />
            </Box>
            <span className="sb-truncate">{item.label}</span>
        </Box>
    );
}

export default function NavRail() {
    const role = useRole();
    const seal = useSeal();
    const user = useUser();
    const govJob = useGovJob();
    const attorney = useSelector((s) => s.app.attorney);
    const hasPerm = usePermissions();
    const location = useLocation();
    const navigate = useNavigate();
    const brand = branding(govJob, attorney);

    const links = navForRole(role).filter((l) => l.section || !l.permission || hasPerm(l.permission));
    const hasSystem = links.some((l) => l.section) && links.filter((l) => l.permission === true).length > 0;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, borderRight: '1px solid var(--sb-border)', background: 'rgba(255,255,255,0.025)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, height: 72, borderBottom: '1px solid var(--sb-border)' }}>
                <Box component="img" src={seal} alt="" sx={{ width: 40, height: 40, objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,.5))' }} />
                <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body1" className="sb-truncate" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                        {brand.primary}
                    </Typography>
                    <Typography variant="caption" className="sb-truncate" sx={{ display: 'block', lineHeight: 1.3 }}>
                        {brand.secondary}
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 1.25, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                {links.map((l, i) => {
                    if (l.section) {
                        if (!hasSystem) return null;
                        return (
                            <Typography key={`s-${i}`} variant="overline" sx={{ color: 'var(--sb-text-3)', px: 1.5, pt: 1.5, pb: 0.5 }}>
                                {l.section}
                            </Typography>
                        );
                    }
                    const active = l.path === '/' ? location.pathname === '/' : location.pathname.startsWith(l.path);
                    return <NavItem key={l.path} item={l} active={active} onClick={() => navigate(l.path)} />;
                })}
            </Box>

            {user && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1.5, borderTop: '1px solid var(--sb-border)' }}>
                    <Avatar src={user.Mugshot || undefined} alt={user.First} sx={{ width: 36, height: 36, fontSize: 14, bgcolor: 'var(--sb-bg-4)' }}>
                        {user.First?.[0]}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="body2" className="sb-truncate" sx={{ fontWeight: 600, color: 'var(--sb-text)' }}>
                            {user.First} {user.Last}
                        </Typography>
                        <Typography variant="caption" className="sb-truncate" sx={{ display: 'block' }}>
                            {govJob?.Grade?.Name ?? (attorney ? 'Attorney' : 'Citizen')}
                        </Typography>
                    </Box>
                    {user.Callsign ? (
                        <Typography variant="body2" className="sb-mono" sx={{ color: 'var(--sb-accent)', fontWeight: 600 }}>
                            {user.Callsign}
                        </Typography>
                    ) : null}
                </Box>
            )}
        </Box>
    );
}
