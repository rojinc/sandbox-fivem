import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { fetchNui, Button } from '@sandbox/ui-kit';
import Modal from '../common/Modal.jsx';
import { ChargeGrid } from './PenalCode.jsx';
import { ChargeTypes } from '../../lib/data.js';
import { toast } from '../../lib/toast.js';

const blank = { type: 1, title: '', description: '', fine: '', jail: '', points: '' };

export default function AdminCharges() {
    const license = useSelector((s) => s.app.pointBreakpoints?.license ?? 20);
    const [selected, setSelected] = useState(null);
    const [busy, setBusy] = useState(false);
    const set = (k) => (e) => setSelected({ ...selected, [k]: e.target.value });

    const onSubmit = async () => {
        setBusy(true);
        const doc = { ...selected, fine: Number(selected.fine) || 0, jail: Number(selected.jail) || 0, points: Number(selected.points) || 0 };
        try {
            const res = await fetchNui(selected.id ? 'Update' : 'Create', { type: 'charge', doc });
            if (res) {
                toast.success(`Charge ${selected.id ? 'updated' : 'created'}`);
                setSelected(null);
            } else toast.error(`Unable to ${selected.id ? 'update' : 'create'} charge`);
        } catch (e) {
            toast.error(`Unable to ${selected.id ? 'update' : 'create'} charge`);
        }
        setBusy(false);
    };

    const onDelete = async () => {
        setBusy(true);
        try {
            const res = await fetchNui('Delete', { type: 'charge', doc: { ...selected } });
            if (res) {
                toast.success('Charge deleted');
                setSelected(null);
            } else toast.error('Unable to delete charge');
        } catch (e) {
            toast.error('Unable to delete charge');
        }
        setBusy(false);
    };

    return (
        <>
            <ChargeGrid
                onSelect={(c) => setSelected({ ...blank, ...c })}
                toolbar={
                    <Button tone="primary" icon="plus" onClick={() => setSelected({ ...blank })}>
                        New charge
                    </Button>
                }
            />
            <Modal
                open={Boolean(selected)}
                title={selected?.id ? 'Edit charge' : 'Create charge'}
                icon="gavel"
                maxWidth="md"
                onClose={() => setSelected(null)}
                onSubmit={onSubmit}
                submitLabel={selected?.id ? 'Save changes' : 'Create'}
                onDelete={selected?.id ? onDelete : undefined}
                busy={busy}
            >
                {selected && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2 }}>
                            <TextField required label="Title" value={selected.title} onChange={set('title')} autoFocus />
                            <TextField select required label="Type" value={selected.type} onChange={set('type')}>
                                {ChargeTypes.map((o) => (
                                    <MenuItem key={o.value} value={o.value}>
                                        {o.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                        <TextField required multiline minRows={4} label="Description" value={selected.description} onChange={set('description')} />
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                            <TextField type="number" label="Jail time (months)" value={selected.jail} onChange={set('jail')} slotProps={{ htmlInput: { min: 0 } }} />
                            <TextField type="number" label="Fine ($)" value={selected.fine} onChange={set('fine')} slotProps={{ htmlInput: { min: 0 } }} />
                            <TextField type="number" label="License points" helperText={`${license} points revoke a driver's license`} value={selected.points} onChange={set('points')} slotProps={{ htmlInput: { min: 0 } }} />
                        </Box>
                    </Box>
                )}
            </Modal>
        </>
    );
}
