import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { Button, IconButton, EmptyState } from '@sandbox/ui-kit';
import { Group } from '../controls/Group.jsx';
import { StepButton } from '../controls/StepButton.jsx';
import { MAX_TATTOOS } from '../../data/tattooZones.js';
import { selectTattoos } from '../../features/ped/selectors.js';
import { prettyTattoo } from '../../lib/format.js';
import { usePedActions } from '../../hooks/usePedActions.js';

const menuProps = { slotProps: { paper: { sx: { maxHeight: 320 } } } };

/**
 * The tattoo slots of one body zone. Slots are indexed in the full
 * ped.customization.tattoos list (what Lua expects); the designs come from
 * SET_TATTOOS_DATA filtered by zone.
 */
export function TattooZone({ zone, label }) {
    const catalogue = useSelector((s) => s.app.tattoos);
    const tattoos = useSelector(selectTattoos);
    const actions = usePedActions();

    const designs = useMemo(() => catalogue.filter((t) => t && t.Zone === zone && t.Name), [catalogue, zone]);
    const slots = useMemo(() => tattoos.map((t, index) => ({ t, index })).filter((s) => s.t && s.t.Zone === zone), [tattoos, zone]);
    const full = tattoos.length >= MAX_TATTOOS;

    const onAdd = () => {
        if (full) return;
        actions.sound('SELECT');
        actions.tattooAdd(zone);
    };
    const choose = (index, design) => {
        if (!design) return;
        actions.sound('UPDOWN');
        actions.tattooSet(index, design);
    };

    return (
        <>
            <Button tone="primary" icon="plus" fullWidth onClick={onAdd} disabled={full || !designs.length}>
                {full ? `Limit of ${MAX_TATTOOS} reached` : `Add ${label.toLowerCase()} tattoo`}
            </Button>
            {!slots.length && <EmptyState icon="dragon" title={`No ${label.toLowerCase()} tattoos`} description="Add one and pick a design to see it on your skin." sx={{ py: 3 }} />}
            {slots.map(({ t, index }, n) => {
                const pos = designs.findIndex((d) => d.Name === t.Name);
                const prev = () => choose(index, designs[(pos <= 0 ? designs.length : pos) - 1]);
                const next = () => choose(index, designs[(pos + 1) % designs.length]);
                return (
                    <Group
                        key={`${zone}-${index}`}
                        title={`${label} tattoo ${n + 1}`}
                        action={<IconButton icon="trash" label="Remove tattoo" onClick={() => { actions.sound('BACK'); actions.tattooRemove(index); }} sx={{ color: 'var(--sb-danger)' }} />}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <StepButton icon="chevron-left" label="Previous design" onClick={prev} disabled={!designs.length} />
                            <Select
                                size="small"
                                fullWidth
                                value={pos >= 0 ? t.Name : ''}
                                displayEmpty
                                onChange={(e) => choose(index, designs.find((d) => d.Name === e.target.value))}
                                MenuProps={menuProps}
                                renderValue={(v) =>
                                    v ? (
                                        <span className="sb-mono">{prettyTattoo(v)}</span>
                                    ) : (
                                        <Typography variant="body2" sx={{ color: 'var(--sb-text-3)' }}>Choose a design…</Typography>
                                    )
                                }
                            >
                                {designs.map((d) => (
                                    <MenuItem key={d.Name} value={d.Name} sx={{ fontSize: 12.5 }}>
                                        <span className="sb-mono">{prettyTattoo(d.Name)}</span>
                                        <Typography variant="caption" sx={{ ml: 'auto', pl: 2 }}>
                                            {d.Collection}
                                        </Typography>
                                    </MenuItem>
                                ))}
                            </Select>
                            <StepButton icon="chevron-right" label="Next design" onClick={next} disabled={!designs.length} />
                        </Box>
                        <Typography variant="caption" className="sb-truncate">
                            {pos >= 0 ? `${pos + 1} of ${designs.length} · ${t.Collection}` : `${designs.length} designs available`}
                        </Typography>
                    </Group>
                );
            })}
        </>
    );
}
