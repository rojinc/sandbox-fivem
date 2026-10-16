import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { fetchNui, Button, Icon, EmptyState } from '@sandbox/ui-kit';
import { Surface, Scroll } from '../common/Surface.jsx';
import { ListRow } from '../common/Fields.jsx';
import Loader from '../common/Loader.jsx';
import { toast } from '../../lib/toast.js';
import { STATIC_LIBRARY } from '../../config.js';
import { usePermissions, useGovJob } from '../../hooks/index.js';

const ADD = '__add__';

export default function Library() {
    const hasPerm = usePermissions();
    const myJob = useGovJob();
    const governmentJobs = useSelector((s) => s.data.data.governmentJobs) ?? [];
    const allJobData = useSelector((s) => s.data.data.governmentJobsData) ?? {};
    const isSysAdmin = hasPerm(true);

    const [loading, setLoading] = useState(false);
    const [docs, setDocs] = useState([]);
    const [selected, setSelected] = useState(null);
    const [creating, setCreating] = useState({ job: myJob?.Id ?? 'police', workplace: false, link: '', label: '' });

    const staticDocs = useMemo(
        () => (STATIC_LIBRARY[myJob?.Id] ?? []).filter((d) => d.link).map((d, i) => ({ ...d, id: `static-${i}`, builtIn: true })),
        [myJob],
    );
    const all = [...staticDocs, ...docs];

    const load = async () => {
        setLoading(true);
        try {
            const res = await fetchNui('GetLibraryDocuments', {});
            const list = Array.isArray(res) ? res : [];
            setDocs(list);
            setSelected((cur) => (cur && [...staticDocs, ...list].some((d) => d.id === cur) ? cur : (staticDocs[0]?.id ?? list[0]?.id ?? null)));
        } catch (e) {
            setDocs([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const onAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetchNui('AddLibraryDocument', creating);
            if (res) {
                toast.success('Document added to the library');
                setCreating({ ...creating, label: '', link: '' });
                await load();
            } else toast.error('Unable to add document');
        } catch (err) {
            toast.error('Unable to add document');
        }
        setLoading(false);
    };

    const onRemove = async (id) => {
        setLoading(true);
        try {
            const res = await fetchNui('RemoveLibraryDocument', { id });
            if (res) {
                toast.success('Document removed');
                setSelected(null);
                await load();
            } else toast.error('Unable to remove document');
        } catch (err) {
            toast.error('Unable to remove document');
        }
        setLoading(false);
    };

    const current = all.find((d) => d.id === selected);
    const jobData = allJobData[creating.job];

    return (
        <Box sx={{ height: '100%', minHeight: 0, display: 'grid', gridTemplateColumns: '280px minmax(0, 1fr)', gap: 2 }}>
            <Surface sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <Typography variant="h6" sx={{ color: 'var(--sb-text-3)', mb: 1 }}>
                    Documents
                </Typography>
                <Scroll>
                    {loading && all.length === 0 ? (
                        <Loader />
                    ) : (
                        <>
                            {all.map((d) => (
                                <ListRow key={d.id} selected={selected === d.id} onClick={() => setSelected(d.id)}>
                                    <Box sx={{ color: selected === d.id ? 'var(--sb-accent)' : 'var(--sb-text-3)', fontSize: 13 }}>
                                        <Icon icon={d.builtIn ? 'book' : 'file-pdf'} />
                                    </Box>
                                    <Typography variant="body2" className="sb-truncate" sx={{ fontWeight: 500 }}>
                                        {d.label}
                                    </Typography>
                                </ListRow>
                            ))}
                            {all.length === 0 && <EmptyState icon="book" title="Library is empty" />}
                        </>
                    )}
                </Scroll>
                {isSysAdmin && (
                    <Button tone={selected === ADD ? 'primary' : 'neutral'} icon="plus" onClick={() => setSelected(ADD)} sx={{ mt: 1.5 }}>
                        Add document
                    </Button>
                )}
            </Surface>

            <Surface sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, p: selected === ADD ? 3 : 1 }}>
                {selected === ADD ? (
                    <Box component="form" onSubmit={onAdd} sx={{ width: 560, maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography variant="h4">Add a document</Typography>
                        <TextField required label="Label" value={creating.label} onChange={(e) => setCreating({ ...creating, label: e.target.value })} slotProps={{ htmlInput: { maxLength: 64 } }} />
                        <TextField required label="Link (PDF)" value={creating.link} onChange={(e) => setCreating({ ...creating, link: e.target.value })} slotProps={{ htmlInput: { maxLength: 400 } }} />
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            <TextField select label="Agency" value={creating.job} onChange={(e) => setCreating({ ...creating, job: e.target.value, workplace: false })}>
                                {governmentJobs.map((j) => (
                                    <MenuItem key={j} value={j}>
                                        {allJobData[j]?.Name ?? j}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField select label="Department" value={creating.workplace} onChange={(e) => setCreating({ ...creating, workplace: e.target.value })}>
                                <MenuItem value={false}>All departments</MenuItem>
                                {(jobData?.Workplaces ?? []).map((w) => (
                                    <MenuItem key={w.Id} value={w.Id}>
                                        {w.Name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button tone="primary" type="submit" icon="plus" disabled={loading}>
                                Add to library
                            </Button>
                        </Box>
                    </Box>
                ) : current ? (
                    <>
                        <Box component="iframe" src={current.link} title={current.label} sx={{ flex: 1, width: '100%', border: 0, borderRadius: 'var(--sb-radius-md)', background: '#fff' }} />
                        {isSysAdmin && !current.builtIn && (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
                                <Button tone="danger" icon="trash-can" onClick={() => onRemove(current.id)} disabled={loading}>
                                    Remove document
                                </Button>
                            </Box>
                        )}
                    </>
                ) : (
                    <Box sx={{ height: '100%', display: 'grid', placeItems: 'center' }}>
                        <EmptyState icon="book" title="Select a document" description="Standard operating procedures and guides open here." />
                    </Box>
                )}
            </Surface>
        </Box>
    );
}
