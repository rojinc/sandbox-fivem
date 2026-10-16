import React from 'react';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import { colors } from '@sandbox/ui-kit';
import { StatusBar, StatusNumber, StatusCircle, isStatusHidden } from './StatusItem.jsx';
import { VoiceCircle } from './VoiceIndicator.jsx';
import Buffs from './Buffs.jsx';

/** Health + armor are synthesised client-side, everything else comes from REGISTER_STATUS. */
export function useStatusList() {
    const statuses = useSelector((s) => s.status.statuses);
    const isDead = useSelector((s) => s.status.isDead);
    const health = useSelector((s) => s.status.health);
    const maxHealth = useSelector((s) => s.status.maxHealth);
    const armor = useSelector((s) => s.status.armor);

    const all = [
        {
            name: 'armor',
            icon: 'shield-halved',
            color: isDead ? '#ffffff' : colors.info,
            value: armor,
            max: 100,
            options: { hideZero: true, order: 1 },
        },
        {
            name: 'health',
            icon: isDead ? 'skull' : 'heart',
            color: isDead ? '#ffffff' : colors.success,
            value: isDead ? 100 : health,
            max: 100,
            options: { hideZero: false, visibleWhileDead: true, order: 2, customMax: isDead ? 100 : maxHealth || 100, forceIcon: isDead },
        },
        ...statuses,
    ];

    return all
        .filter((s) => s && !isStatusHidden(s, isDead))
        .sort((a, b) => (a.options?.order ?? 99) - (b.options?.order ?? 99));
}

function pick(status, mode, config) {
    const forced = status.options?.force;
    const type = forced || mode;
    const wide = config.largeBars;
    const solid = !config.transparentBg;
    if (type === 'numbers') return <StatusNumber status={status} wide={wide} solid={solid} />;
    return <StatusBar status={status} wide={wide} solid={solid} />;
}

/**
 * Row of status pills. `wrap` lets extra statuses stack upward (used next to
 * the minimap); `width` bounds the row in that case.
 */
export function StatusRow({ wrap = false, width = 258, sx }) {
    const config = useSelector((s) => s.hud.config);
    const list = useStatusList();
    if (!list.length) return null;
    return (
        <Box
            sx={{
                display: 'flex',
                gap: '6px',
                flexWrap: wrap ? 'wrap-reverse' : 'nowrap',
                width: wrap ? width : 'auto',
                justifyContent: wrap ? 'flex-start' : 'center',
                ...sx,
            }}
        >
            {list.map((status) => (
                <Box key={status.name} className="sb-anim-fade">
                    {pick(status, config.statusType, config)}
                </Box>
            ))}
        </Box>
    );
}

/** Condensed layout: voice ring, status rings and buff rings in one row. */
export function CircleRow({ wrap = false, width, sx }) {
    const config = useSelector((s) => s.hud.config);
    const list = useStatusList().filter((s) => s.name !== 'radio-freq');
    return (
        <Box
            sx={{
                display: 'flex',
                gap: '6px',
                alignItems: 'center',
                flexWrap: wrap ? 'wrap-reverse' : 'nowrap',
                width: wrap ? width : 'auto',
                ...sx,
            }}
        >
            <VoiceCircle />
            {list.map((status) => (
                <Box key={status.name} className="sb-anim-fade">
                    <StatusCircle status={status} showNumber={config.circleNumbers} />
                </Box>
            ))}
            <Buffs variant="ring" />
        </Box>
    );
}
