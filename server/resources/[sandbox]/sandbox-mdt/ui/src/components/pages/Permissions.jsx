import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { fetchNui, Tag, EmptyState } from '@sandbox/ui-kit';
import { Surface, Scroll, Toolbar } from '../common/Surface.jsx';
import SearchField from '../common/SearchField.jsx';
import Modal from '../common/Modal.jsx';
import { toast } from '../../lib/toast.js';
import { usePermissions, useGovJob } from '../../hooks/index.js';

/** Rank permission editor. `job="system"` lets a system admin pick any agency. */
export default function Permissions({ job = 'system' }) {
    const hasPerm = usePermissions();
    const myJob = useGovJob();
    const governmentJobs = useSelector((s) => s.data.data.governmentJobs) ?? [];
    const allJobData = useSelector((s) => s.data.data.governmentJobsData) ?? {};
    const availablePermissions = useSelector((s) => s.data.data.permissions) ?? {};
    const isSysAdmin = hasPerm(true);

    const [selectedJob, setSelectedJob] = useState(job === 'system' ? myJob?.Id ?? governmentJobs[0] : job);
    const jobData = allJobData[selectedJob];
    const [workplace, setWorkplace] = useState(jobData?.Workplaces?.[0]?.Id ?? '');
    const [search, setSearch] = useState('');
    const [editing, setEditing] = useState(null);
    const [pending, setPending] = useState([]);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        setWorkplace(allJobData[selectedJob]?.Workplaces?.[0]?.Id ?? '');
    }, [selectedJob, allJobData]);

    const grades = useMemo(() => {
        const list = jobData?.Workplaces?.find((w) => w.Id === workplace)?.Grades ?? [];
        const term = search.trim().toLowerCase();
        return [...list].filter((g) => !term || g.Name?.toLowerCase().includes(term)).sort((a, b) => (a.Level ?? 0) - (b.Level ?? 0));
    }, [jobData, workplace, search]);

    const permissionOptions = useMemo(
        () =>
            Object.keys(availablePermissions)
                .filter((k) => {
                    const d = availablePermissions[k];
                    return d && (!d.restrict || !d.restrict.job || d.restrict.job === selectedJob);
                })
                .sort(),
        [availablePermissions, selectedJob],
    );

    const onEdit = (grade) => {
        const perms = grade.Permissions ?? {};
        setPending(Array.isArray(perms) ? perms : Object.keys(perms).filter((k) => perms[k]));
        setEditing(grade);
    };

    const onSave = async () => {
        setBusy(true);
        const UpdatedPermissions = Object.fromEntries(pending.map((p) => [p, true]));
        try {
            const res = await fetchNui('Update', {
                type: 'jobPermissions',
                JobId: job === 'system' ? selectedJob : myJob?.Id,
                WorkplaceId: workplace,
                GradeId: editing.Id,
                UpdatedPermissions,
            });
            if (res) {
                toast.success('Permissions updated');
                setEditing(null);
            } else toast.error('Unable to update permissions');
        } catch (e) {
            toast.error('Unable to update permissions');
        }
        setBusy(false);
    };

    const permCount = (g) => (Array.isArray(g.Permissions) ? g.Permissions.length : Object.keys(g.Permissions ?? {}).length);

    return (
        <Surface sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <Toolbar sx={{ mb: 2 }}>
                {job === 'system' && (
                    <TextField select size="small" label="Agency" value={selectedJob ?? ''} onChange={(e) => setSelectedJob(e.target.value)} sx={{ minWidth: 220 }}>
                        {governmentJobs.map((j) => (
                            <MenuItem key={j} value={j}>
                                {allJobData[j]?.Name ?? j}
                            </MenuItem>
                        ))}
                    </TextField>
                )}
                <TextField select size="small" label="Department" value={workplace} onChange={(e) => setWorkplace(e.target.value)} sx={{ minWidth: 260 }}>
                    {(jobData?.Workplaces ?? []).map((w) => (
                        <MenuItem key={w.Id} value={w.Id}>
                            {w.Name}
                        </MenuItem>
                    ))}
                </TextField>
                <SearchField value={search} onChange={setSearch} placeholder="Filter ranks" sx={{ maxWidth: 280 }} />
            </Toolbar>
            <Scroll>
                {grades.length === 0 ? (
                    <EmptyState icon="crown" title="No ranks" description="Pick a department to manage its rank permissions." />
                ) : (
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>Rank</TableCell>
                                <TableCell>Level</TableCell>
                                <TableCell>Permissions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {grades.map((g) => (
                                <TableRow key={g.Id} hover sx={{ cursor: 'pointer' }} onClick={() => onEdit(g)}>
                                    <TableCell sx={{ fontWeight: 600 }}>{g.Name}</TableCell>
                                    <TableCell className="sb-mono">{g.Level ?? 1}</TableCell>
                                    <TableCell>
                                        <Tag tone={permCount(g) ? 'info' : 'neutral'}>{permCount(g)} permissions</Tag>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Scroll>

            <Modal open={Boolean(editing)} title={`${jobData?.Workplaces?.find((w) => w.Id === workplace)?.Name ?? ''} · ${editing?.Name ?? ''}`} icon="crown" maxWidth="md" onClose={() => setEditing(null)} onSubmit={onSave} submitLabel="Save permissions" busy={busy}>
                <Typography variant="body2" sx={{ color: 'var(--sb-text-2)', mb: 2 }}>
                    Permissions granted to every member holding this rank.
                </Typography>
                <TextField
                    select
                    fullWidth
                    label="Rank permissions"
                    value={pending}
                    onChange={(e) => setPending(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                    slotProps={{
                        select: {
                            multiple: true,
                            renderValue: (selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {[...selected].sort().map((v) => (
                                        <Chip key={v} size="small" label={availablePermissions[v]?.name ?? v} />
                                    ))}
                                </Box>
                            ),
                            MenuProps: { PaperProps: { sx: { maxHeight: 420 } } },
                        },
                    }}
                >
                    {permissionOptions.map((p) => (
                        <MenuItem key={p} value={p} dense>
                            <Checkbox size="small" checked={pending.includes(p)} sx={{ p: 0.5, mr: 1 }} />
                            <ListItemText primary={availablePermissions[p]?.name ?? p} secondary={isSysAdmin && availablePermissions[p]?.restrict?.job ? allJobData[availablePermissions[p].restrict.job]?.Name : undefined} />
                        </MenuItem>
                    ))}
                </TextField>
            </Modal>
        </Surface>
    );
}
