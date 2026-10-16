import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Grow from '@mui/material/Grow';
import Typography from '@mui/material/Typography';
import { Icon, semanticColor } from '@sandbox/ui-kit';

const ToastContext = createContext(null);

const ICONS = { success: 'circle-check', error: 'circle-exclamation', info: 'circle-info', warning: 'triangle-exclamation' };

export function ToastProvider({ children }) {
    const [items, setItems] = useState([]);
    const seq = useRef(0);

    const remove = useCallback((id) => setItems((list) => list.filter((t) => t.id !== id)), []);

    const push = useCallback(
        (kind, message, ttl) => {
            const id = ++seq.current;
            setItems((list) => [...list.slice(-3), { id, kind, message: String(message ?? '') }]);
            window.setTimeout(() => remove(id), ttl);
            return id;
        },
        [remove],
    );

    const api = useMemo(
        () => ({
            success: (m) => push('success', m, 3200),
            error: (m) => push('error', m, 5000),
            info: (m) => push('info', m, 3200),
            warning: (m) => push('warning', m, 4000),
        }),
        [push],
    );

    const value = useMemo(() => ({ api, items, remove }), [api, items, remove]);
    return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
    return ctx.api;
}

/** Stack of transient notices, bottom-right of the console window. */
export function ToastViewport() {
    const ctx = useContext(ToastContext);
    if (!ctx) return null;
    return (
        <Box
            role="status"
            aria-live="polite"
            sx={{
                position: 'absolute',
                right: 20,
                bottom: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                zIndex: 30,
                pointerEvents: 'none',
            }}
        >
            {ctx.items.map((t) => (
                <Grow in key={t.id} timeout={200}>
                    <Box
                        onClick={() => ctx.remove(t.id)}
                        sx={{
                            pointerEvents: 'auto',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.25,
                            minWidth: 240,
                            maxWidth: 380,
                            px: 1.75,
                            py: 1.25,
                            borderRadius: '10px',
                            background: 'var(--sb-surface-strong)',
                            border: '1px solid var(--sb-border-strong)',
                            boxShadow: 'var(--sb-shadow-2)',
                            backdropFilter: 'blur(18px)',
                        }}
                    >
                        <Box sx={{ color: semanticColor(t.kind), fontSize: 14, display: 'grid', placeItems: 'center' }}>
                            <Icon icon={ICONS[t.kind] ?? 'circle-info'} />
                        </Box>
                        <Typography variant="body2" sx={{ color: 'var(--sb-text)', fontWeight: 500 }}>
                            {t.message}
                        </Typography>
                    </Box>
                </Grow>
            ))}
        </Box>
    );
}
