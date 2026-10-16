import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { Button, SectionTitle, fetchNui, useKey } from '@sandbox/ui-kit';
import { defaultConfig } from '../../features/hud.js';

const LAYOUTS = [
    { value: 'default', label: 'Default' },
    { value: 'minimap', label: 'Statuses below the minimap' },
    { value: 'center', label: 'Statuses at the bottom centre' },
    { value: 'condensed', label: 'Condensed rings' },
];
const VEHICLE_LAYOUTS = [
    { value: 'default', label: 'Default cluster' },
    { value: 'simple', label: 'Simplified' },
    { value: 'minimal', label: 'Ring gauge' },
];
const STATUS_TYPES = {
    default: ['numbers', 'bars'],
    minimap: ['numbers', 'bars'],
    center: ['numbers', 'bars'],
    condensed: ['circles'],
};
const STATUS_LABEL = { numbers: 'Numbers', bars: 'Bars', circles: 'Circles' };
const BUFF_ANCHORS = [
    { value: 'compass', label: 'Above the compass' },
    { value: 'minimap', label: 'Below the minimap' },
];
const ALIGNMENTS = [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Centre' },
    { value: 'minimap', label: 'Minimap' },
    { value: 'compass', label: 'Compass' },
];

function Select({ name, label, value, options, onChange }) {
    return (
        <TextField select fullWidth size="small" name={name} label={label} value={value} onChange={onChange}>
            {options.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                    {o.label}
                </MenuItem>
            ))}
        </TextField>
    );
}

function Toggle({ name, label, checked, onChange }) {
    return <FormControlLabel control={<Switch name={name} checked={Boolean(checked)} onChange={onChange} />} label={label} />;
}

/** /hud configuration dialog (client/events.lua UI:Client:Configure, SaveConfig). */
export default function SettingsDialog() {
    const dispatch = useDispatch();
    const open = useSelector((s) => s.hud.settings);
    const config = useSelector((s) => s.hud.config);
    const [form, setForm] = useState({ ...defaultConfig, ...config });

    useEffect(() => {
        if (open) setForm({ ...defaultConfig, ...config });
    }, [open, config]);

    useEffect(() => {
        const allowed = STATUS_TYPES[form.layout] ?? STATUS_TYPES.default;
        if (!allowed.includes(form.statusType)) setForm((f) => ({ ...f, statusType: allowed[0] }));
    }, [form.layout, form.statusType]);

    const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    const onToggle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.checked }));

    const close = () => {
        dispatch({ type: 'TOGGLE_SETTINGS', payload: { state: false } });
        fetchNui('CloseUI');
    };
    const save = (e) => {
        e.preventDefault();
        dispatch({ type: 'SET_CONFIG', payload: { config: form } });
        fetchNui('SaveConfig', form);
        close();
    };

    useKey('Escape', close, { enabled: open });

    const statusOptions = (STATUS_TYPES[form.layout] ?? STATUS_TYPES.default).map((v) => ({ value: v, label: STATUS_LABEL[v] }));

    return (
        <Dialog open={Boolean(open)} onClose={close} fullWidth maxWidth="md">
            <form onSubmit={save}>
                <DialogTitle>HUD settings</DialogTitle>
                <DialogContent>
                    <Grid container spacing={4} sx={{ pt: 1 }}>
                        <Grid size={6}>
                            <Stack spacing={2}>
                                <SectionTitle>Layout</SectionTitle>
                                <Select name="layout" label="Status layout" value={form.layout} options={LAYOUTS} onChange={onChange} />
                                {form.layout === 'minimap' && (
                                    <Toggle name="minimapAnchor" label="Anchor statuses to the minimap" checked={form.minimapAnchor} onChange={onToggle} />
                                )}
                                {form.layout === 'center' && (
                                    <>
                                        <Select name="buffsAnchor" label="Buffs position" value={form.buffsAnchor} options={BUFF_ANCHORS} onChange={onChange} />
                                        {form.buffsAnchor === 'minimap' && (
                                            <Toggle name="buffsAnchor2" label="Anchor buffs to the minimap" checked={form.buffsAnchor2} onChange={onToggle} />
                                        )}
                                    </>
                                )}
                                {form.layout === 'condensed' && (
                                    <Select name="condenseAlignment" label="Align rings" value={form.condenseAlignment} options={ALIGNMENTS} onChange={onChange} />
                                )}
                                <SectionTitle sx={{ mt: 1 }}>Compass</SectionTitle>
                                <Toggle name="hideCompassBg" label="Hide compass background" checked={form.hideCompassBg} onChange={onToggle} />
                                <Toggle name="hideCrossStreet" label="Hide cross street" checked={form.hideCrossStreet} onChange={onToggle} />
                                <Toggle name="maskRadio" label="Mask the radio channel" checked={form.maskRadio} onChange={onToggle} />
                            </Stack>
                        </Grid>
                        <Grid size={6}>
                            <Stack spacing={2}>
                                <SectionTitle>Statuses</SectionTitle>
                                <Select name="statusType" label="Status display" value={form.statusType} options={statusOptions} onChange={onChange} />
                                {form.statusType === 'bars' && (
                                    <>
                                        <Toggle name="largeBars" label="Longer bars" checked={form.largeBars} onChange={onToggle} />
                                        <Toggle name="transparentBg" label="Translucent backgrounds" checked={form.transparentBg} onChange={onToggle} />
                                    </>
                                )}
                                {form.statusType === 'circles' && (
                                    <Toggle name="circleNumbers" label="Show numbers instead of icons" checked={form.circleNumbers} onChange={onToggle} />
                                )}
                                <SectionTitle sx={{ mt: 1 }}>Vehicle</SectionTitle>
                                <Select name="vehicle" label="Vehicle cluster" value={form.vehicle} options={VEHICLE_LAYOUTS} onChange={onChange} />
                                {form.vehicle === 'default' && (
                                    <Toggle name="showRPM" label="Show RPM bar" checked={form.showRPM} onChange={onToggle} />
                                )}
                            </Stack>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button tone="ghost" onClick={close}>
                        Cancel
                    </Button>
                    <Button tone="primary" type="submit" icon="check">
                        Save
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
