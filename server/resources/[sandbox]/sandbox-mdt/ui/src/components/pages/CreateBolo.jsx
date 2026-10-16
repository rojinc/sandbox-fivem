import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { fetchNui, Button } from '@sandbox/ui-kit';
import { Surface, SurfaceHeader } from '../common/Surface.jsx';
import { toast } from '../../lib/toast.js';
import { BOLOTypes } from '../../lib/data.js';

export default function CreateBolo() {
    const navigate = useNavigate();
    const [busy, setBusy] = useState(false);
    const [state, setState] = useState({ title: '', summary: '', description: '', type: 'user' });
    const set = (k) => (e) => setState({ ...state, [k]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
            const res = await fetchNui('Create', { type: 'BOLO', doc: { ...state, time: Date.now() } });
            if (res) {
                toast.success('BOLO created');
                navigate(-1);
            } else toast.error('Unable to create BOLO');
        } catch (err) {
            toast.error('Unable to create BOLO');
        }
        setBusy(false);
    };

    return (
        <Box sx={{ height: '100%', display: 'grid', placeItems: 'start center', overflowY: 'auto' }}>
            <Surface sx={{ width: 720, maxWidth: '100%' }} padding={24}>
                <SurfaceHeader icon="eye" title="New BOLO" subtitle="Broadcast a be-on-the-lookout to every unit on duty" />
                <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2 }}>
                        <TextField required label="Title" value={state.title} onChange={set('title')} slotProps={{ htmlInput: { maxLength: 64 } }} autoFocus />
                        <TextField select required label="Type" value={state.type} onChange={set('type')}>
                            {BOLOTypes.map((o) => (
                                <MenuItem key={o.value} value={o.value}>
                                    {o.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>
                    <TextField required label="Summary" helperText="One line shown on the dashboard" value={state.summary} onChange={set('summary')} slotProps={{ htmlInput: { maxLength: 72 } }} />
                    <TextField required label="Description" multiline minRows={6} value={state.description} onChange={set('description')} />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button tone="ghost" type="button" onClick={() => navigate(-1)} disabled={busy}>
                            Cancel
                        </Button>
                        <Button tone="primary" type="submit" icon="paper-plane" disabled={busy}>
                            Publish BOLO
                        </Button>
                    </Box>
                </Box>
            </Surface>
        </Box>
    );
}
