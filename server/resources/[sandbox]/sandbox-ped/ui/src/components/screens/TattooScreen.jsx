import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Tag } from '@sandbox/ui-kit';
import { TATTOO_ZONES, MAX_TATTOOS } from '../../data/tattooZones.js';
import { forceNaked } from '../../features/app/reducer.js';
import { selectTattoos } from '../../features/ped/selectors.js';
import { TattooZone } from '../ped/TattooZone.jsx';

export function TattooScreen({ section }) {
    const dispatch = useDispatch();
    const tattoos = useSelector(selectTattoos);
    const zone = TATTOO_ZONES[section] ?? TATTOO_ZONES[0];

    // Tattoos are previewed on bare skin while this screen is open.
    useEffect(() => {
        dispatch(forceNaked(true));
        return () => dispatch(forceNaked(false));
    }, [dispatch]);

    const full = tattoos.length >= MAX_TATTOOS;
    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'var(--sb-text-2)' }}>
                    Inked designs on this character
                </Typography>
                <Tag tone={full ? 'warning' : 'neutral'} icon="dragon">
                    <span className="sb-mono">
                        {tattoos.length} / {MAX_TATTOOS}
                    </span>
                </Tag>
            </Box>
            <TattooZone key={zone.zone} zone={zone.zone} label={zone.label} />
        </>
    );
}
