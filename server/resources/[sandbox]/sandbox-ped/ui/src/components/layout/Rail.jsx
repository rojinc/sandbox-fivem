import React from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { Icon } from '@sandbox/ui-kit';
import { CATEGORIES } from '../../data/modes.js';

/** Vertical category rail on the left edge of the panel. */
export function Rail({ categories, active, onSelect }) {
    return (
        <Box
            sx={{
                width: 76,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                p: 1,
                pt: 2,
                borderRight: '1px solid var(--sb-border)',
                background: 'rgba(0, 0, 0, 0.16)',
            }}
        >
            {categories.map((key) => {
                const c = CATEGORIES[key];
                const isActive = key === active;
                return (
                    <ButtonBase
                        key={key}
                        onClick={() => onSelect(key)}
                        aria-pressed={isActive}
                        aria-label={c.label}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 0.75,
                            py: 1.25,
                            px: 0.5,
                            borderRadius: 'var(--sb-radius-sm)',
                            color: isActive ? 'var(--sb-accent)' : 'var(--sb-text-2)',
                            background: isActive ? 'var(--sb-accent-soft)' : 'transparent',
                            transition: 'all var(--sb-dur-fast) var(--sb-ease)',
                            '&:hover': {
                                background: isActive ? 'var(--sb-accent-soft)' : 'var(--sb-surface-hover)',
                                color: isActive ? 'var(--sb-accent)' : 'var(--sb-text)',
                            },
                            '&.Mui-focusVisible': { boxShadow: '0 0 0 1px var(--sb-border-accent) inset' },
                        }}
                    >
                        <Icon icon={c.icon} style={{ fontSize: 16 }} />
                        <Typography sx={{ fontSize: 12, fontWeight: 600, lineHeight: 1 }}>{c.label}</Typography>
                    </ButtonBase>
                );
            })}
        </Box>
    );
}
