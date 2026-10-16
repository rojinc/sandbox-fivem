import React from 'react';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Fade from '@mui/material/Fade';
import { dateShort } from '../../lib/format.js';
import { DepartmentData } from '../../lib/data.js';
import sealSA from '../../assets/seals/seal.webp';
import sealDOJ from '../../assets/seals/doj_seal.webp';
import badgeLSPD from '../../assets/seals/lspd_badge.webp';
import badgeSAST from '../../assets/seals/SAST.webp';
import badgeMedical from '../../assets/seals/MedicalServices.webp';
import badgeBCSO from '../../assets/seals/bcso_seal.webp';
import badgeGuardius from '../../assets/seals/guardius.webp';
import badgeDOC from '../../assets/seals/corrections.webp';

const BADGES = { lspd: badgeLSPD, bcso: badgeBCSO, sast: badgeSAST, guardius: badgeGuardius, safd: badgeMedical, corrections: badgeDOC, doj: sealDOJ };

/** Government badge shown when someone nearby flashes it (SHOW_GOV_ID). */
function GovBadge({ data }) {
    const dept = DepartmentData[data?.Department] ?? { name: data?.['Department Name'] ?? 'San Andreas Government', color: '#452f00' };
    return (
        <Box className="sb-glass-strong" sx={{ width: 620, height: 320, borderRadius: 'var(--sb-radius-xl)', display: 'grid', gridTemplateColumns: '1fr 240px', overflow: 'hidden' }}>
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Avatar src={data?.Mugshot || undefined} alt={data?.First} variant="rounded" sx={{ width: 120, height: 120, fontSize: 40, bgcolor: 'var(--sb-bg-4)', border: '2px solid var(--sb-border-strong)' }}>
                        {data?.First?.[0]}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="overline" sx={{ color: 'var(--sb-accent)' }}>
                            {data?.Title}
                        </Typography>
                        <Typography variant="h2" className="sb-truncate">
                            {data?.First?.[0]?.toUpperCase()}. {data?.Last?.substr(0, 16)}
                        </Typography>
                        {data?.Callsign ? (
                            <Typography variant="h3" className="sb-mono" sx={{ color: 'var(--sb-text-2)' }}>
                                #{data.Callsign}
                            </Typography>
                        ) : null}
                    </Box>
                </Box>
                <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                    <Typography variant="caption" className="sb-mono">
                        State ID {data?.SID}
                    </Typography>
                    {data?.DOB && (
                        <Typography variant="caption" className="sb-mono">
                            DOB {dateShort(data.DOB)}
                        </Typography>
                    )}
                </Box>
            </Box>
            <Box sx={{ background: `linear-gradient(160deg, ${dept.color} 0%, rgba(0,0,0,0.6) 100%)`, borderLeft: '1px solid var(--sb-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, p: 2 }}>
                <Box component="img" src={BADGES[data?.Department] ?? sealDOJ} alt="" sx={{ width: 150, height: 150, objectFit: 'contain', filter: 'drop-shadow(0 6px 16px rgba(0,0,0,.6))' }} />
                <Typography variant="body2" sx={{ textAlign: 'center', fontWeight: 600, whiteSpace: 'pre-line', textShadow: 'var(--sb-text-shadow)' }}>
                    {dept.name}
                </Typography>
            </Box>
        </Box>
    );
}

/** State ID card (SHOW_DRIVER_LICENSE). */
function Licence({ data }) {
    return (
        <Box className="sb-glass-strong" sx={{ width: 520, height: 300, borderRadius: 'var(--sb-radius-xl)', overflow: 'hidden', position: 'relative' }}>
            <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(79,156,255,0.18) 0%, rgba(245,184,46,0.08) 60%, transparent 100%)' }} />
            <Box sx={{ position: 'relative', p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box component="img" src={sealSA} alt="" sx={{ width: 40, height: 40, objectFit: 'contain' }} />
                    <Box>
                        <Typography variant="overline" sx={{ color: 'var(--sb-accent)' }}>
                            State of San Andreas
                        </Typography>
                        <Typography variant="h4">Identification card</Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 3, mt: 3 }}>
                    <Avatar src={data?.Mugshot || undefined} alt={data?.Name} variant="rounded" sx={{ width: 130, height: 130, fontSize: 40, bgcolor: 'var(--sb-bg-4)', border: '2px solid var(--sb-border-strong)' }}>
                        {data?.Name?.[0]}
                    </Avatar>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, alignContent: 'start', flex: 1 }}>
                        <Box sx={{ gridColumn: 'span 2' }}>
                            <Typography variant="caption">Name</Typography>
                            <Typography variant="h3" className="sb-truncate">
                                {data?.Name}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption">State ID</Typography>
                            <Typography variant="body1" className="sb-mono" sx={{ fontWeight: 600 }}>
                                {data?.SID}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption">Date of birth</Typography>
                            <Typography variant="body1" className="sb-mono" sx={{ fontWeight: 600 }}>
                                {dateShort(data?.DOB)}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption">Sex</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {data?.Gender ? 'Female' : 'Male'}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption">Expires</Typography>
                            <Typography variant="body1" className="sb-mono" sx={{ fontWeight: 600 }}>
                                Oct 1, 2026
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default function IdOverlay() {
    const mdtHidden = useSelector((s) => s.app.hidden);
    const { showing, type, data } = useSelector((s) => s.badge);
    const visible = showing && mdtHidden;
    return (
        <Fade in={visible} timeout={{ enter: 320, exit: 200 }} mountOnEnter unmountOnExit>
            <Box sx={{ position: 'fixed', left: 48, top: 0, bottom: 0, display: 'flex', alignItems: 'center', pointerEvents: 'none', zIndex: 20 }}>
                {type === 'badge' ? <GovBadge data={data} /> : <Licence data={data} />}
            </Box>
        </Fade>
    );
}
