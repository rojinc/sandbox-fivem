import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import { Icon, RichText, colors, semanticColor } from '@sandbox/ui-kit';
import { useElapsed } from '../../hooks/useTicker.js';

const TYPE_ICON = {
    success: 'circle-check',
    warning: 'triangle-exclamation',
    error: 'circle-xmark',
    info: 'circle-info',
    standard: 'bell',
    custom: 'bell',
};

function toneOf(type) {
    return ['success', 'warning', 'error', 'info'].includes(type) ? type : 'neutral';
}

function Toast({ notification }) {
    const dispatch = useDispatch();
    const [visible, setVisible] = useState(false);
    const persistent = !(notification.duration > 0);
    const elapsed = useElapsed(notification.created, persistent ? Infinity : notification.duration, !persistent);
    const done = !persistent && elapsed >= notification.duration;

    useEffect(() => {
        const t = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(t);
    }, []);

    useEffect(() => {
        if (done || notification.hide) setVisible(false);
    }, [done, notification.hide]);

    const onTransitionEnd = () => {
        if (!visible) dispatch({ type: 'REMOVE_ALERT', payload: { id: notification._id } });
    };

    const tone = toneOf(notification.type);
    const accent = tone === 'neutral' ? colors.accent : semanticColor(tone);
    const style = notification.style ?? {};
    const remaining = persistent ? 1 : Math.max(0, 1 - elapsed / notification.duration);

    return (
        <Box
            onTransitionEnd={onTransitionEnd}
            className="sb-glass"
            sx={{
                width: 340,
                borderRadius: '12px',
                overflow: 'hidden',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateX(0)' : 'translateX(24px)',
                transition: 'opacity 220ms var(--sb-ease), transform 260ms var(--sb-ease-out)',
                ...(style.alert ?? {}),
            }}
        >
            <Box sx={{ display: 'flex', gap: '12px', p: '10px 12px 10px 10px', ...(style.body ?? {}) }}>
                <Box
                    sx={{
                        width: 30,
                        height: 30,
                        borderRadius: '8px',
                        flexShrink: 0,
                        display: 'grid',
                        placeItems: 'center',
                        background: `${accent}24`,
                        color: accent,
                        fontSize: 14,
                    }}
                >
                    <Icon icon={notification.icon || TYPE_ICON[notification.type] || 'bell'} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0, fontSize: 13.5, lineHeight: 1.4, pt: '5px', color: colors.text }}>
                    <RichText text={notification.message} component="div" />
                </Box>
                {persistent && (
                    <Box sx={{ color: colors.text3, fontSize: 10, pt: '7px', flexShrink: 0 }}>
                        <Icon icon="thumbtack" />
                    </Box>
                )}
            </Box>
            {!persistent && (
                <Box sx={{ height: 3, background: 'rgba(255,255,255,0.08)', ...(style.progressBg ?? {}) }}>
                    <Box
                        sx={{
                            height: '100%',
                            width: `${remaining * 100}%`,
                            background: accent,
                            ...(style.progress ?? {}),
                        }}
                    />
                </Box>
            )}
        </Box>
    );
}

/** Top-right toast stack: persistent notifications first, newest on top within each group. */
export default function NotificationStack() {
    const notifications = useSelector((s) => s.notifications.notifications);
    const ordered = [
        ...notifications.filter((n) => !(n.duration > 0)).sort((a, b) => b.created - a.created),
        ...notifications.filter((n) => n.duration > 0).sort((a, b) => b.created - a.created),
    ];
    if (!ordered.length) return null;
    return (
        <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {ordered.map((n) => (
                <Toast key={n._id} notification={n} />
            ))}
        </Box>
    );
}
