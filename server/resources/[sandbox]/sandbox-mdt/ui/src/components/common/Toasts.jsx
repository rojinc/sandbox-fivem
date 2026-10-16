import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Icon, semanticColor, semanticSoft } from '@sandbox/ui-kit';
import { toast } from '../../lib/toast.js';

const ICONS = { success: 'circle-check', error: 'circle-exclamation', info: 'circle-info', warning: 'triangle-exclamation' };

/** Bottom-right toast stack. Mount once. */
export default function ToastHost() {
    const [items, setItems] = useState([]);

    useEffect(() => {
        const unsub = toast.subscribe((item) => {
            setItems((list) => [...list.slice(-4), item]);
            setTimeout(() => setItems((list) => list.filter((t) => t.id !== item.id)), item.duration);
        });
        return unsub;
    }, []);

    return (
        <Box sx={{ position: 'fixed', right: 24, bottom: 24, display: 'flex', flexDirection: 'column', gap: 1, zIndex: 2500, pointerEvents: 'none' }}>
            {items.map((t) => (
                <Box
                    key={t.id}
                    className="sb-glass-strong sb-anim-rise"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.25,
                        minWidth: 260,
                        maxWidth: 420,
                        px: 1.5,
                        py: 1.25,
                        borderRadius: 'var(--sb-radius-md)',
                        borderColor: semanticSoft(t.kind),
                    }}
                >
                    <Box sx={{ width: 26, height: 26, borderRadius: '50%', display: 'grid', placeItems: 'center', background: semanticSoft(t.kind), color: semanticColor(t.kind), fontSize: 12, flexShrink: 0 }}>
                        <Icon icon={ICONS[t.kind] ?? 'circle-info'} />
                    </Box>
                    <Typography variant="body2" sx={{ color: 'var(--sb-text)', fontWeight: 500 }}>
                        {t.message}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
}
