import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import { fetchNui, colors } from '@sandbox/ui-kit';
import { useElapsed } from '../../hooks/useTicker.js';

const LINGER_MS = 1200;

/**
 * Timed action bar. Runs from START_PROGRESS for `duration` ms, then tells Lua
 * (Progress:Finish). CANCEL/FAIL from Lua or FINISH from us linger briefly
 * with a state label before the bar hides itself.
 */
export default function ProgressBar() {
    const dispatch = useDispatch();
    const { showing, label, duration, cancelled, failed, finished, startTime } = useSelector((s) => s.progress);
    const settled = cancelled || failed || finished;
    const elapsed = useElapsed(startTime, duration, showing && !settled);
    const reported = useRef(null);

    // completion
    useEffect(() => {
        if (!showing || settled || !startTime) return;
        if (duration > 0 && elapsed >= duration && reported.current !== startTime) {
            reported.current = startTime;
            dispatch({ type: 'FINISH_PROGRESS' });
            fetchNui('Progress:Finish');
        }
    }, [elapsed, duration, showing, settled, startTime, dispatch]);

    // linger then hide
    useEffect(() => {
        if (!showing || !settled) return undefined;
        const t = setTimeout(() => dispatch({ type: 'HIDE_PROGRESS' }), LINGER_MS);
        return () => clearTimeout(t);
    }, [showing, settled, dispatch]);

    const pct = duration > 0 ? Math.min(100, (elapsed / duration) * 100) : 0;
    const color = finished ? colors.success : cancelled || failed ? colors.danger : colors.accent;
    const text = finished ? 'Finished' : failed ? 'Failed' : cancelled ? 'Cancelled' : label || 'Working…';
    const seconds = duration > 0 ? `${Math.ceil((duration - elapsed) / 1000)}s` : '';

    return (
        <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 184, display: 'flex', justifyContent: 'center' }}>
            <Fade in={showing} mountOnEnter unmountOnExit>
                <Box className="sb-glass" sx={{ width: 380, borderRadius: '12px', p: '10px 14px 12px' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: '8px' }}>
                        <Box className="sb-truncate" sx={{ fontSize: 14, fontWeight: 600, color: settled ? color : colors.text }}>
                            {text}
                        </Box>
                        {!settled && (
                            <Box className="sb-mono" sx={{ fontSize: 12, color: colors.text2, flexShrink: 0, ml: 2 }}>
                                {seconds}
                            </Box>
                        )}
                    </Box>
                    <Box sx={{ height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}>
                        <Box
                            sx={{
                                height: '100%',
                                width: `${settled ? 100 : pct}%`,
                                borderRadius: 999,
                                background: color,
                                transition: settled ? 'width 200ms var(--sb-ease), background 200ms' : 'none',
                            }}
                        />
                    </Box>
                </Box>
            </Fade>
        </Box>
    );
}
