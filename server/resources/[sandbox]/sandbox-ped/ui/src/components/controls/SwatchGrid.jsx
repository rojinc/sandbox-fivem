import React from 'react';
import Box from '@mui/material/Box';
import { fetchNui } from '@sandbox/ui-kit';

/**
 * Compact colour picker built from the palette the game reports
 * (catalog.palette: colorId -> "rgb(r, g, b)"). Only known colours are drawn,
 * so it stays honest while the palette is still loading.
 */
export function SwatchGrid({ palette, count, value, onChange, disabled }) {
    const ids = [];
    for (let i = 0; i < count; i += 1) if (palette[i]) ids.push(i);
    if (!ids.length) return null;

    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '5px', mt: 0.5 }}>
            {ids.map((i) => {
                const active = i === value;
                return (
                    <Box
                        key={i}
                        component="button"
                        type="button"
                        title={`Colour ${i}`}
                        aria-label={`Colour ${i}`}
                        aria-pressed={active}
                        disabled={disabled}
                        onClick={() => {
                            if (disabled || active) return;
                            fetchNui('FrontEndSound', { sound: 'SELECT' });
                            onChange(i);
                        }}
                        sx={{
                            width: 20,
                            height: 20,
                            p: 0,
                            borderRadius: '50%',
                            background: palette[i],
                            border: '1px solid rgba(255,255,255,0.18)',
                            outline: active ? '2px solid var(--sb-accent)' : '2px solid transparent',
                            outlineOffset: 1,
                            cursor: disabled ? 'default' : 'pointer',
                            opacity: disabled ? 0.4 : 1,
                            transition: 'transform var(--sb-dur-fast) var(--sb-ease), outline-color var(--sb-dur-fast)',
                            '&:hover': { transform: disabled ? 'none' : 'scale(1.18)' },
                            '&:focus-visible': { outlineColor: 'var(--sb-accent)' },
                        }}
                    />
                );
            })}
        </Box>
    );
}
