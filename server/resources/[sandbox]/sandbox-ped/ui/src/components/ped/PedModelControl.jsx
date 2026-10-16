import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Alert from '@mui/material/Alert';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { Icon, fetchNui } from '@sandbox/ui-kit';
import { Group } from '../controls/Group.jsx';
import { StepperRow } from '../controls/StepperRow.jsx';
import PED_MODELS from '../../data/peds.js';
import { setBusy } from '../../features/app/reducer.js';
import { invalidateCatalog } from '../../features/catalog/reducer.js';

const menuProps = { slotProps: { paper: { sx: { maxHeight: 320 } } } };

/**
 * Swap the whole ped model (SetPed). The game answers true once the model is
 * loaded; clothing ranges differ per model so the catalogue is re-fetched.
 */
export function PedModelControl() {
    const dispatch = useDispatch();
    const gender = useSelector((s) => s.ped.gender);
    const model = useSelector((s) => s.ped.ped.model);
    const whitelisted = useSelector((s) => s.app.whitelistedPeds);
    const busy = useSelector((s) => s.app.busy);
    const models = PED_MODELS[gender] ?? PED_MODELS[0];
    const index = Math.max(0, models.indexOf(model));

    const setModel = async (value) => {
        if (busy || !value || value === model) return;
        dispatch(setBusy(true));
        try {
            const ok = await fetchNui('SetPed', { value });
            if (ok) {
                dispatch({ type: 'ped/model', payload: { value } });
                dispatch(invalidateCatalog());
            }
        } finally {
            dispatch(setBusy(false));
        }
    };

    const wlValue = whitelisted.some((p) => p.model === model) ? model : 'none';

    return (
        <>
            <Alert severity="warning" icon={<Icon icon="triangle-exclamation" />} sx={{ py: 0.5, fontSize: 12.5 }}>
                Models other than the default multiplayer ped may not support every option in here.
            </Alert>
            <Group title="Ped model">
                <StepperRow
                    label="Model"
                    value={index}
                    min={0}
                    max={models.length - 1}
                    onChange={(v) => setModel(models[v])}
                    caption={<span className="sb-mono">{models[index]}</span>}
                    disabled={busy}
                    slider={false}
                />
                <Select
                    size="small"
                    fullWidth
                    value={models.includes(model) ? model : ''}
                    displayEmpty
                    disabled={busy}
                    onChange={(e) => setModel(e.target.value)}
                    MenuProps={menuProps}
                    renderValue={(v) => (v ? <span className="sb-mono">{v}</span> : <Typography variant="body2" sx={{ color: 'var(--sb-text-3)' }}>Jump to a model…</Typography>)}
                >
                    {models.map((m) => (
                        <MenuItem key={m} value={m} className="sb-mono" sx={{ fontSize: 12.5 }}>
                            {m}
                        </MenuItem>
                    ))}
                </Select>
            </Group>
            {whitelisted.length > 0 && (
                <Group title="Whitelisted models">
                    <Select
                        size="small"
                        fullWidth
                        value={wlValue}
                        disabled={busy}
                        onChange={(e) => setModel(e.target.value === 'none' ? models[0] : e.target.value)}
                        MenuProps={menuProps}
                    >
                        <MenuItem value="none">None (default ped)</MenuItem>
                        {whitelisted.map((p) => (
                            <MenuItem key={p.model} value={p.model}>
                                {p.label ?? p.model}
                            </MenuItem>
                        ))}
                    </Select>
                </Group>
            )}
        </>
    );
}
