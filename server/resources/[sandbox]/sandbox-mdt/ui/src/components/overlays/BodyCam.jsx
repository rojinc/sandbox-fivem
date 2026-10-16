import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Fade from '@mui/material/Fade';
import { clock, dayLong } from '../../lib/format.js';
import { useGovJob, useUser } from '../../hooks/index.js';

/** Body camera recording stamp (TOGGLE_BODYCAM / SET_BODYCAM). */
export default function BodyCam() {
    const job = useGovJob();
    const user = useUser();
    const showing = useSelector((s) => s.bodycam.show);
    const mdtHidden = useSelector((s) => s.app.hidden);
    const alertsShowing = useSelector((s) => s.alerts.showing);
    const [now, setNow] = useState(Date.now());

    const visible = showing && mdtHidden && !alertsShowing && Boolean(user) && ['police', 'ems', 'prison'].includes(job?.Id);

    useEffect(() => {
        if (!visible) return undefined;
        const i = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(i);
    }, [visible]);

    return (
        <Fade in={visible} mountOnEnter unmountOnExit>
            <Box className="sb-overworld" sx={{ position: 'fixed', top: 18, right: 22, pointerEvents: 'none', zIndex: 5, textAlign: 'right', fontFamily: 'var(--sb-font-mono)', fontSize: 13, color: 'var(--sb-text)', lineHeight: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--sb-danger)', boxShadow: '0 0 10px var(--sb-danger)', animation: 'sb-pulse 1.2s infinite' }} />
                    <Typography component="span" sx={{ fontFamily: 'inherit', fontWeight: 700, letterSpacing: 1 }}>
                        REC · BODY CAM
                    </Typography>
                </Box>
                <div>
                    {user?.First?.[0]}. {user?.Last} [{user?.Callsign || 'NOTSET'}]
                </div>
                <div style={{ color: 'var(--sb-text-2)' }}>{job?.Workplace?.Name}</div>
                <div>
                    {dayLong(now)} · {clock(now)}
                </div>
            </Box>
        </Fade>
    );
}
