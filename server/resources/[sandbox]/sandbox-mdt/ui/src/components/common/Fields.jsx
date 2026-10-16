import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { Icon, EmptyState } from '@sandbox/ui-kit';

/** Label above a value; `mono` for ids, plates, numbers. */
export function Field({ label, children, mono = false, sx, valueSx, wrap = false }) {
    return (
        <Box sx={{ minWidth: 0, ...sx }}>
            <Typography variant="caption" sx={{ display: 'block', color: 'var(--sb-text-3)', mb: 0.25 }}>
                {label}
            </Typography>
            <Typography
                variant="body1"
                component="div"
                className={clsx(mono && 'sb-mono', !wrap && 'sb-truncate')}
                sx={{ fontWeight: 500, color: 'var(--sb-text)', whiteSpace: wrap ? 'pre-line' : undefined, ...valueSx }}
            >
                {children ?? '—'}
            </Typography>
        </Box>
    );
}

/** Responsive grid of Fields. */
export function FieldGrid({ columns = 2, children, sx, gap = 2 }) {
    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap, ...sx }}>{children}</Box>
    );
}

/** In-app link styled with the accent. */
export function AppLink({ to, children, sx, ...rest }) {
    return (
        <Box
            component={Link}
            to={to}
            sx={{
                color: 'var(--sb-accent)',
                fontWeight: 500,
                '&:hover': { textDecoration: 'underline' },
                ...sx,
            }}
            {...rest}
        >
            {children}
        </Box>
    );
}

/** "Nothing selected" placeholder for detail panes. */
export function Placeholder({ icon, title, description, action, sx }) {
    return (
        <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', ...sx }}>
            <EmptyState icon={icon} title={title} description={description} action={action} />
        </Box>
    );
}

/** Clickable list row with selected / hover states. */
export function ListRow({ selected = false, onClick, children, sx, disabled = false, component = 'div', ...rest }) {
    return (
        <Box
            component={component}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick && !disabled ? 0 : undefined}
            onClick={disabled ? undefined : onClick}
            onKeyDown={(e) => {
                if (onClick && !disabled && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onClick(e);
                }
            }}
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                minHeight: 40,
                px: 1.5,
                py: 1,
                borderRadius: 'var(--sb-radius-md)',
                border: '1px solid transparent',
                cursor: onClick && !disabled ? 'pointer' : 'default',
                opacity: disabled ? 0.5 : 1,
                outline: 'none',
                transition: 'background var(--sb-dur-fast) var(--sb-ease), border-color var(--sb-dur-fast) var(--sb-ease)',
                background: selected ? 'var(--sb-accent-soft)' : 'transparent',
                borderColor: selected ? 'var(--sb-border-accent)' : 'transparent',
                '&:hover': onClick && !disabled ? { background: selected ? 'var(--sb-accent-soft)' : 'var(--sb-surface-hover)' } : undefined,
                '&:focus-visible': { borderColor: 'var(--sb-border-strong)' },
                ...sx,
            }}
            {...rest}
        >
            {children}
        </Box>
    );
}

/** Small inline icon + text line (location, time…). */
export function Meta({ icon, children, sx, mono = false }) {
    return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, color: 'var(--sb-text-2)', fontSize: 12.5, minWidth: 0, ...sx }}>
            {icon && (
                <Box component="span" sx={{ color: 'var(--sb-text-3)', fontSize: 11, display: 'inline-flex' }}>
                    <Icon icon={icon} />
                </Box>
            )}
            <Box component="span" className={clsx('sb-truncate', mono && 'sb-mono')}>
                {children}
            </Box>
        </Box>
    );
}

/** Horizontal divider with spacing. */
export function Rule({ sx }) {
    return <Box sx={{ height: 1, background: 'var(--sb-border)', my: 1.5, ...sx }} />;
}
