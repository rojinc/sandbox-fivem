import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { fetchNui, Button } from '@sandbox/ui-kit';
import { Surface, SurfaceHeader } from '../common/Surface.jsx';
import RichEditor from '../common/RichEditor.jsx';
import { toast } from '../../lib/toast.js';
import { usePermissions, useGovJob } from '../../hooks/index.js';

export default function CreateNotice() {
    const navigate = useNavigate();
    const hasPerm = usePermissions();
    const myJob = useGovJob();
    const governmentJobs = useSelector((s) => s.data.data.governmentJobs) ?? [];
    const allJobData = useSelector((s) => s.data.data.governmentJobsData) ?? {};
    const postPublic = hasPerm('DOJ_JUDGE') || hasPerm('GOV_MAYOR') || hasPerm('GOV_DA');

    const [busy, setBusy] = useState(false);
    const [restricted, setRestricted] = useState(myJob?.Id ?? 'public');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!description) {
            toast.error('Notice body cannot be empty');
            return;
        }
        setBusy(true);
        try {
            const res = await fetchNui('Create', { type: 'notice', doc: { title, description, restricted } });
            if (res) {
                toast.success('Notice posted');
                navigate(-1);
            } else toast.error('Unable to post notice');
        } catch (err) {
            toast.error('Unable to post notice');
        }
        setBusy(false);
    };

    const audiences = governmentJobs.filter((j) => myJob?.Id === j || hasPerm(true));

    return (
        <Box sx={{ height: '100%', display: 'grid', placeItems: 'start center', overflowY: 'auto' }}>
            <Surface sx={{ width: 860, maxWidth: '100%' }} padding={24}>
                <SurfaceHeader icon="bullhorn" title="New notice" subtitle="Posted to the notice board of the selected audience" />
                <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2 }}>
                        <TextField required label="Title" value={title} onChange={(e) => setTitle(e.target.value)} slotProps={{ htmlInput: { maxLength: 64 } }} autoFocus />
                        <TextField select label="Audience" value={restricted} onChange={(e) => setRestricted(e.target.value)}>
                            {postPublic && <MenuItem value="public">Public records notice</MenuItem>}
                            {audiences.map((j) => (
                                <MenuItem key={j} value={j}>
                                    {allJobData[j]?.Name ?? j}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>
                    <RichEditor label="Notice" value={description} onChange={setDescription} placeholder="Write the notice…" minHeight={300} />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button tone="ghost" type="button" onClick={() => navigate(-1)} disabled={busy}>
                            Cancel
                        </Button>
                        <Button tone="primary" type="submit" icon="paper-plane" disabled={busy}>
                            Post notice
                        </Button>
                    </Box>
                </Box>
            </Surface>
        </Box>
    );
}
