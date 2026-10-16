import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { fetchNui } from '@sandbox/ui-kit';
import PED_MODELS from '../../data/peds.js';
import { setNaked } from '../../features/app/reducer.js';

/**
 * "Undress" preview (ToggleNekked). The tattoo screen forces it on; the game
 * only supports it on the default multiplayer peds.
 */
export function NakedToggle() {
    const dispatch = useDispatch();
    const visible = useSelector((s) => s.app.visible);
    const naked = useSelector((s) => s.app.naked);
    const forced = useSelector((s) => s.app.forcedNaked);
    const gender = useSelector((s) => s.ped.gender);
    const model = useSelector((s) => s.ped.ped.model);
    const freemode = !model || model === (PED_MODELS[gender] ?? PED_MODELS[0])[0] || /^mp_[mf]_freemode_01$/.test(model);

    const value = naked || forced;
    const [busy, setBusy] = useState(false);
    const sent = useRef(false);

    useEffect(() => {
        if (!visible || sent.current === value) return;
        sent.current = value;
        setBusy(true);
        fetchNui('ToggleNekked', value).finally(() => setTimeout(() => setBusy(false), 600));
    }, [value, visible]);

    const title = forced ? 'Tattoos are previewed undressed' : !freemode ? 'Only available on the default ped' : value ? 'Put clothes back on' : 'Preview without clothes';

    return (
        <Tooltip title={title} placement="top">
            <FormControlLabel
                sx={{ m: 0, gap: 0.5 }}
                control={
                    <Switch
                        size="small"
                        checked={value}
                        disabled={forced || busy || !freemode}
                        onChange={() => {
                            fetchNui('FrontEndSound', { sound: 'SELECT' });
                            dispatch(setNaked(!naked));
                        }}
                    />
                }
                label={
                    <Typography variant="body2" sx={{ color: 'var(--sb-text-2)', fontWeight: 500 }}>
                        Undress
                    </Typography>
                }
            />
        </Tooltip>
    );
}
