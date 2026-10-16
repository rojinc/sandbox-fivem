import React from 'react';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import { Group } from '../controls/Group.jsx';
import { StepperRow } from '../controls/StepperRow.jsx';
import { SwatchGrid } from '../controls/SwatchGrid.jsx';
import { usePedActions } from '../../hooks/usePedActions.js';

function Chip({ rgb }) {
    return (
        <Box
            sx={{
                width: 24,
                height: 24,
                flexShrink: 0,
                borderRadius: '50%',
                background: rgb || 'var(--sb-bg-4)',
                border: '1px solid var(--sb-border-strong)',
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.35)',
            }}
        />
    );
}

/**
 * Base + highlight colour for hair, eyebrows or facial hair
 * (ped.customization.colors.<name>), picked from the game's hair palette.
 */
export function HairColorControl({ name, title = 'Colour' }) {
    const colors = useSelector((s) => s.ped.ped.customization.colors?.[name]);
    const palette = useSelector((s) => s.catalog.palette);
    const count = useSelector((s) => s.catalog.hairColors);
    const actions = usePedActions();
    if (!colors) return null;

    const max = count ? count - 1 : null;
    const row = (type, label) => {
        const slot = colors[type] ?? { index: 0 };
        const idx = Number(slot.index) || 0;
        const set = (v) => actions.hairColor(name, type, v);
        return (
            <Box key={type}>
                <StepperRow
                    label={label}
                    value={idx}
                    min={0}
                    max={max}
                    onChange={set}
                    slider={false}
                    leading={<Chip rgb={palette[idx] ?? slot.rgb} />}
                    caption={count ? `${idx + 1} of ${count}` : undefined}
                />
                <SwatchGrid palette={palette} count={count} value={idx} onChange={set} />
            </Box>
        );
    };

    return (
        <Group title={title}>
            {row('color1', 'Base colour')}
            {row('color2', 'Highlight')}
        </Group>
    );
}
