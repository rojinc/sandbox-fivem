import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Alert from '@mui/material/Alert';
import { fetchNui, Tag, Button, EmptyState } from '@sandbox/ui-kit';
import SplitPane from '../common/SplitPane.jsx';
import SearchField from '../common/SearchField.jsx';
import Loader from '../common/Loader.jsx';
import Modal from '../common/Modal.jsx';
import { Scroll } from '../common/Surface.jsx';
import { Field, FieldGrid, ListRow, Placeholder, Rule } from '../common/Fields.jsx';
import { toast } from '../../lib/toast.js';
import { dateTimeLong, dateTime, fromNow, humanizeMinutes } from '../../lib/format.js';
import { usePermissions, usePerson, useQueryParam, useGovJob, useUser, useIsHighCommand } from '../../hooks/index.js';

const parseDutyTime = (dutyTime, job) => {
    const sessions = dutyTime?.[job];
    if (!Array.isArray(sessions)) return '0 minutes';
    const after = Date.now() / 1000 - 7 * 24 * 3600;
    const minutes = sessions.filter((t) => t.time >= after).reduce((a, t) => a + (t.minutes ?? 0), 0);
    return humanizeMinutes(minutes);
};

const checkSuspension = (data, job) => {
    const s = data?.[job];
    if (s && s.Expires > Date.now() / 1000) return s;
    return null;
};

/* ------------------------------------------------------------------ */
/* Hire                                                                */
/* ------------------------------------------------------------------ */

function HireDialog({ open, selectedJob, systemAdminMode, onClose, onHired }) {
    const myJob = useGovJob();
    const jobData = useSelector((s) => s.data.data.governmentJobsData)?.[selectedJob];
    const workplaces = jobData?.Workplaces ?? [];
    const defaultWorkplace = myJob?.Id === selectedJob ? myJob?.Workplace?.Id : workplaces[0]?.Id;
    const [sid, setSid] = useState('');
    const [workplace, setWorkplace] = useState(defaultWorkplace);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (open) {
            setSid('');
            setWorkplace(defaultWorkplace);
        }
    }, [open, selectedJob]); // eslint-disable-line react-hooks/exhaustive-deps

    const wp = workplaces.find((w) => w.Id === workplace);
    const grade = [...(wp?.Grades ?? [])].sort((a, b) => (a.Level ?? 0) - (b.Level ?? 0))[0];

    const onSubmit = async () => {
        if (!wp || !grade) return toast.error('Pick a department');
        setBusy(true);
        try {
            const res = await fetchNui('HireEmployee', { SID: parseInt(sid, 10), JobId: selectedJob, WorkplaceId: wp.Id, GradeId: grade.Id });
            if (res) {
                toast.success(`State ID ${sid} hired as ${wp.Name} ${grade.Name}`);
                onHired();
                onClose();
            } else toast.error('Unable to hire that person');
        } catch (e) {
            toast.error('Unable to hire that person');
        }
        setBusy(false);
    };

    return (
        <Modal open={open} title="Hire" icon="user-plus" onClose={onClose} onSubmit={onSubmit} submitLabel="Hire" busy={busy}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                <TextField required autoFocus fullWidth label="State ID of the new hire" value={sid} onChange={(e) => /^\d*$/.test(e.target.value) && setSid(e.target.value)} slotProps={{ htmlInput: { inputMode: 'numeric' } }} />
                {systemAdminMode && <TextField select disabled fullWidth label="Agency" value={selectedJob}><MenuItem value={selectedJob}>{jobData?.Name ?? selectedJob}</MenuItem></TextField>}
                {(selectedJob === 'police' || selectedJob === 'government') && (
                    <TextField select fullWidth label="Department" value={workplace ?? ''} onChange={(e) => setWorkplace(e.target.value)}>
                        {workplaces.map((w) => (
                            <MenuItem key={w.Id} value={w.Id}>
                                {w.Name}
                            </MenuItem>
                        ))}
                    </TextField>
                )}
                <TextField disabled fullWidth label="Starting rank" value={grade?.Name ?? ''} />
            </Box>
        </Modal>
    );
}

/* ------------------------------------------------------------------ */
/* Member panel                                                        */
/* ------------------------------------------------------------------ */

function MemberPanel({ officer, selectedJob, onUpdate }) {
    const hasPerm = usePermissions();
    const isHighCommand = useIsHighCommand();
    const user = useUser();
    const myJob = useGovJob();
    const jobData = useSelector((s) => s.data.data.governmentJobsData)?.[selectedJob];
    const availablePermissions = useSelector((s) => s.data.data.permissions) ?? {};
    const availableQualifications = useSelector((s) => s.data.data.qualifications) ?? {};

    const job = officer.Jobs?.find((j) => j.Id === selectedJob);
    const canFire = hasPerm('MDT_FIRE') || isHighCommand;
    const canPromote = hasPerm('MDT_PROMOTE') || isHighCommand;
    const canEdit = hasPerm('MDT_EDIT_EMPLOYEE') || isHighCommand;
    const isSelf = officer.SID === user?.SID;
    const suspension = checkSuspension(officer.MDTSuspension, selectedJob);

    const [dialog, setDialog] = useState(null);
    const [picture, setPicture] = useState('');
    const [callsign, setCallsign] = useState('');
    const [pJob, setPJob] = useState(job);
    const [quals, setQuals] = useState([]);
    const [days, setDays] = useState('3');
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        setDialog(null);
        setPJob(job);
    }, [officer]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!job) return <Placeholder icon="user-tie" title="Not a member" description="This person does not hold the selected job." />;

    const gradePermissions = jobData?.Workplaces?.find((w) => w.Id === job.Workplace?.Id)?.Grades?.find((g) => g.Id === job.Grade?.Id)?.Permissions ?? {};
    const permList = Array.isArray(gradePermissions) ? gradePermissions : Object.keys(gradePermissions).filter((k) => gradePermissions[k]);
    const hasCallsign = job.Id === 'police' || (job.Id === 'ems' && job.Workplace?.Id === 'safd') || (job.Id === 'prison' && job.Workplace?.Id === 'corrections');

    const call = async (fn, success, failure) => {
        setBusy(true);
        try {
            const res = await fn();
            if (res) {
                toast.success(success);
                setDialog(null);
                onUpdate();
            } else toast.error(failure);
        } catch (e) {
            toast.error(failure);
        }
        setBusy(false);
    };

    const saveCallsign = async () => {
        const value = parseInt(callsign, 10);
        if (officer.Callsign == value) return setDialog(null);
        setBusy(true);
        try {
            const free = await fetchNui('CheckCallsign', value);
            if (!free) {
                toast.error('Callsign already assigned');
                setBusy(false);
                return;
            }
        } catch (e) {
            toast.error('Unable to check callsign');
            setBusy(false);
            return;
        }
        await call(() => fetchNui('Update', { type: 'person', SID: officer.SID, Key: 'Callsign', Data: value }), 'Callsign updated', 'Unable to update callsign');
    };

    const printBadge = () => {
        fetchNui('Close').catch(() => {});
        fetchNui('PrintBadge', { SID: officer.SID, JobId: job.Id }).catch(() => {});
    };

    const qualOptions = Object.keys(availableQualifications).filter((q) => {
        const d = availableQualifications[q];
        if (!d) return false;
        if (!d.restrict) return true;
        if (d.restrict.weapon && (job.Id === 'police' || job.Id === 'prison')) return true;
        return d.restrict.job === job.Id && (!d.restrict.workplace || d.restrict.workplace === job.Workplace?.Id);
    });

    const wpGrades = jobData?.Workplaces?.find((w) => w.Id === pJob?.Workplace?.Id)?.Grades ?? [];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%' }}>
            {(!isSelf && !officer.MDTSystemAdmin) || (isHighCommand && isSelf) ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, pb: 2, borderBottom: '1px solid var(--sb-border)', mb: 2 }}>
                    {!isSelf && canPromote && (
                        <Button
                            icon="pen-to-square"
                            onClick={() => {
                                setPJob(job);
                                setDialog('job');
                            }}
                        >
                            Edit position
                        </Button>
                    )}
                    {isHighCommand && (
                        <Button
                            icon="certificate"
                            onClick={() => {
                                setQuals(officer.Qualifications ?? []);
                                setDialog('quals');
                            }}
                        >
                            Qualifications
                        </Button>
                    )}
                    {isHighCommand && (
                        <Button icon="id-badge" onClick={printBadge}>
                            Print badge
                        </Button>
                    )}
                    {!isSelf && canFire && !suspension && (job.Id === 'police' || job.Id === 'ems') && (
                        <Button
                            icon="user-clock"
                            onClick={() => {
                                setDays('3');
                                setDialog('suspend');
                            }}
                        >
                            Suspend
                        </Button>
                    )}
                    {!isSelf && canFire && suspension && (job.Id === 'police' || job.Id === 'ems') && (
                        <Button icon="user-check" onClick={() => setDialog('unsuspend')}>
                            Revoke suspension
                        </Button>
                    )}
                    {!isSelf && canFire && (
                        <Button icon="user-minus" tone="danger" onClick={() => setDialog('fire')} sx={{ ml: 'auto' }}>
                            Terminate
                        </Button>
                    )}
                </Box>
            ) : null}

            <Scroll>
                {suspension && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Suspended for {suspension.Length} days · expires {fromNow(suspension.Expires, { unix: true })} ({dateTimeLong(suspension.Expires, { unix: true })}) · by [{suspension.Actioned?.Callsign}] {suspension.Actioned?.First?.[0]}. {suspension.Actioned?.Last}
                    </Alert>
                )}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Avatar
                                src={officer.Mugshot || undefined}
                                alt={officer.First}
                                variant="rounded"
                                onClick={
                                    canEdit
                                        ? () => {
                                              setPicture(officer.Mugshot ?? '');
                                              setDialog('picture');
                                          }
                                        : undefined
                                }
                                sx={{ width: 112, height: 112, fontSize: 36, bgcolor: 'var(--sb-bg-4)', border: '1px solid var(--sb-border-strong)', cursor: canEdit ? 'pointer' : 'default', '&:hover': canEdit ? { filter: 'brightness(0.8)' } : undefined }}
                            >
                                {officer.First?.[0]}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography variant="h3" className="sb-truncate">
                                    {officer.First} {officer.Last}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'var(--sb-text-2)' }}>
                                    {job.Workplace?.Name} · {job.Grade?.Name}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.75, mt: 1, flexWrap: 'wrap' }}>
                                    {officer.MDTSystemAdmin && <Tag tone="warning">System admin</Tag>}
                                    {isSelf && <Tag tone="info">You</Tag>}
                                </Box>
                            </Box>
                        </Box>
                        <FieldGrid columns={2}>
                            <Field label="State ID" mono>
                                {officer.SID}
                            </Field>
                            <Field label="Phone" mono>
                                {officer.Phone ?? '—'}
                            </Field>
                            {hasCallsign && (
                                <Field label="Callsign" mono>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <span>{officer.Callsign ? officer.Callsign : 'Not set'}</span>
                                        {canEdit && (
                                            <Button
                                                size="small"
                                                tone="ghost"
                                                onClick={() => {
                                                    setCallsign(officer.Callsign ? String(officer.Callsign) : '');
                                                    setDialog('callsign');
                                                }}
                                            >
                                                Change
                                            </Button>
                                        )}
                                    </Box>
                                </Field>
                            )}
                            <Field label="Department">{job.Workplace?.Name}</Field>
                            <Field label="Rank">{job.Grade?.Name}</Field>
                        </FieldGrid>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Field label="Qualifications">
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.5 }}>
                                {(officer.Qualifications ?? []).length === 0 && (
                                    <Typography variant="body2" sx={{ color: 'var(--sb-text-3)' }}>
                                        No qualifications
                                    </Typography>
                                )}
                                {(officer.Qualifications ?? []).map((q) => (
                                    <Tag key={q} tone="info">
                                        {availableQualifications[q]?.name ?? q}
                                    </Tag>
                                ))}
                            </Box>
                        </Field>
                        <Field label="Rank permissions">
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.5 }}>
                                {permList.length === 0 && (
                                    <Typography variant="body2" sx={{ color: 'var(--sb-text-3)' }}>
                                        None
                                    </Typography>
                                )}
                                {permList.map((k) => (
                                    <Tag key={k} tone="neutral">
                                        {availablePermissions[k]?.name ?? k}
                                    </Tag>
                                ))}
                            </Box>
                        </Field>
                        <Rule />
                        {officer.LastClockOn?.[job.Id] && (
                            <Field label="Last clocked on">
                                {dateTimeLong(officer.LastClockOn[job.Id], { unix: true })} · {fromNow(officer.LastClockOn[job.Id], { unix: true })}
                            </Field>
                        )}
                        {officer.TimeClockedOn?.[job.Id] && (
                            <Field label="Time on duty (last 7 days)">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <span>{parseDutyTime(officer.TimeClockedOn, job.Id)}</span>
                                    <Button size="small" tone="ghost" onClick={() => setDialog('duty')}>
                                        Sessions
                                    </Button>
                                </Box>
                            </Field>
                        )}
                    </Box>
                </Box>
            </Scroll>

            <Modal open={dialog === 'picture'} title="Profile picture" icon="camera" onClose={() => setDialog(null)} onSubmit={() => call(() => fetchNui('Update', { type: 'person', SID: officer.SID, Key: 'Mugshot', Data: picture }), 'Profile picture updated', 'Unable to update picture')} busy={busy}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Avatar src={picture || undefined} variant="rounded" sx={{ width: 96, height: 96, bgcolor: 'var(--sb-bg-4)' }} />
                    <TextField fullWidth required label="Image URL" value={picture} onChange={(e) => setPicture(e.target.value)} autoFocus />
                </Box>
            </Modal>
            <Modal open={dialog === 'callsign'} title="Update callsign" icon="id-badge" onClose={() => setDialog(null)} onSubmit={saveCallsign} busy={busy}>
                <TextField fullWidth required autoFocus label="Callsign" helperText="Three digits, numbers only" value={callsign} onChange={(e) => /^\d{0,3}$/.test(e.target.value) && setCallsign(e.target.value)} slotProps={{ htmlInput: { pattern: '[0-9]{3}', maxLength: 3, inputMode: 'numeric' } }} />
            </Modal>
            <Modal open={dialog === 'job'} title="Edit position" icon="pen-to-square" onClose={() => setDialog(null)} onSubmit={() => call(() => fetchNui('ManageEmployment', { SID: officer.SID, data: pJob, JobId: myJob?.Id }), 'Employment updated', 'Unable to update employment')} busy={busy}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                    <TextField
                        select
                        fullWidth
                        disabled={!isHighCommand || pJob?.Id === 'ems'}
                        label="Department"
                        value={pJob?.Workplace?.Id ?? ''}
                        onChange={(e) => {
                            const wp = jobData?.Workplaces?.find((w) => w.Id === e.target.value);
                            const g = [...(wp?.Grades ?? [])].sort((a, b) => (a.Level ?? 0) - (b.Level ?? 0))[0];
                            setPJob({ ...pJob, Workplace: wp, Grade: g });
                        }}
                    >
                        {(jobData?.Workplaces ?? []).map((w) => (
                            <MenuItem key={w.Id} value={w.Id}>
                                {w.Name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField select fullWidth disabled={!canPromote} label="Rank" value={pJob?.Grade?.Id ?? ''} onChange={(e) => setPJob({ ...pJob, Grade: wpGrades.find((g) => g.Id === e.target.value) })}>
                        {wpGrades.map((g) => (
                            <MenuItem key={g.Id} value={g.Id} disabled={!hasPerm(true) && (g.Level ?? 0) >= (myJob?.Grade?.Level ?? 0)}>
                                {g.Name}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>
            </Modal>
            <Modal open={dialog === 'quals'} title="Qualifications" icon="certificate" onClose={() => setDialog(null)} onSubmit={() => call(() => fetchNui('Update', { type: 'person', SID: officer.SID, Key: 'Qualifications', Data: quals }), 'Qualifications updated', 'Unable to update qualifications')} busy={busy}>
                <TextField
                    select
                    fullWidth
                    label="Qualifications"
                    value={quals}
                    onChange={(e) => setQuals(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                    sx={{ mt: 1 }}
                    slotProps={{
                        select: {
                            multiple: true,
                            renderValue: (sel) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {sel.map((v) => (
                                        <Chip key={v} size="small" label={availableQualifications[v]?.name ?? v} />
                                    ))}
                                </Box>
                            ),
                        },
                    }}
                >
                    {qualOptions.map((q) => (
                        <MenuItem key={q} value={q} dense>
                            <Checkbox size="small" checked={quals.includes(q)} sx={{ p: 0.5, mr: 1 }} />
                            <ListItemText primary={availableQualifications[q]?.name ?? q} />
                        </MenuItem>
                    ))}
                </TextField>
            </Modal>
            <Modal open={dialog === 'fire'} title={`Terminate ${officer.First} ${officer.Last}?`} icon="user-minus" onClose={() => setDialog(null)} onAccept={() => call(() => fetchNui('FireEmployee', { SID: officer.SID, JobId: job.Id }), 'Employee terminated', 'Unable to terminate employee')} acceptLabel="Terminate" closeLabel="Cancel" busy={busy}>
                <Typography variant="body2">
                    This removes {job.Workplace?.Name} {job.Grade?.Name} {officer.First} {officer.Last} from the agency and clears their callsign.
                </Typography>
            </Modal>
            <Modal open={dialog === 'suspend'} title={`Suspend ${officer.First} ${officer.Last}?`} icon="user-clock" onClose={() => setDialog(null)} onSubmit={() => {
                const n = parseInt(days, 10);
                if (Number.isNaN(n) || n <= 0 || n >= 99) return toast.error('Enter a length between 1 and 98 days');
                call(() => fetchNui('SuspendEmployee', { SID: officer.SID, JobId: job.Id, Length: n }), 'Employee suspended', 'Unable to suspend employee');
            }} submitLabel="Suspend" busy={busy}>
                <TextField fullWidth required autoFocus label="Suspension length (days)" value={days} onChange={(e) => /^\d{0,2}$/.test(e.target.value) && setDays(e.target.value)} slotProps={{ htmlInput: { inputMode: 'numeric' } }} sx={{ mt: 1 }} />
            </Modal>
            <Modal open={dialog === 'unsuspend'} title={`Revoke suspension for ${officer.First} ${officer.Last}?`} icon="user-check" onClose={() => setDialog(null)} onAccept={() => call(() => fetchNui('UnsuspendEmployee', { SID: officer.SID, JobId: job.Id }), 'Suspension revoked', 'Unable to revoke suspension')} acceptLabel="Revoke" closeLabel="Cancel" busy={busy}>
                <Typography variant="body2">They will be able to go on duty again immediately.</Typography>
            </Modal>
            <Modal open={dialog === 'duty'} title="Recent duty sessions" icon="clock" onClose={() => setDialog(null)}>
                {(officer.TimeClockedOn?.[job.Id] ?? []).length === 0 && <Alert severity="info">No sessions recorded.</Alert>}
                <Box sx={{ maxHeight: 360, overflowY: 'auto' }}>
                    {[...(officer.TimeClockedOn?.[job.Id] ?? [])].reverse().map((s, i) => (
                        <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, borderBottom: '1px solid var(--sb-border)' }}>
                            <Typography variant="body2">{dateTime(s.time, { unix: true })}</Typography>
                            <Typography variant="body2" className="sb-mono" sx={{ color: 'var(--sb-text-2)' }}>
                                {humanizeMinutes(s.minutes)}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Modal>
        </Box>
    );
}

/* ------------------------------------------------------------------ */

export default function Roster({ systemAdminMode = false }) {
    const myJob = useGovJob();
    const hasPerm = usePermissions();
    const isHighCommand = useIsHighCommand();
    const formatPerson = usePerson();
    const governmentJobs = useSelector((s) => s.data.data.governmentJobs) ?? [];
    const allJobData = useSelector((s) => s.data.data.governmentJobsData) ?? {};
    const [idParam] = useQueryParam('id');

    const [selectedJob, setSelectedJob] = useState(myJob?.Id ?? governmentJobs[0]);
    const jobData = allJobData[selectedJob];
    const [workplace, setWorkplace] = useState('');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [officers, setOfficers] = useState([]);
    const [selected, setSelected] = useState(null);
    const [selectedLoading, setSelectedLoading] = useState(false);
    const [hire, setHire] = useState(false);

    const canHire = hasPerm('MDT_HIRE') || isHighCommand;

    const load = async (job) => {
        setLoading(true);
        try {
            const res = await fetchNui('RosterView', { job });
            setOfficers(Array.isArray(res) ? res : []);
        } catch (e) {
            setOfficers([]);
        }
        setLoading(false);
    };

    const select = async (sid) => {
        setSelectedLoading(true);
        try {
            const res = await fetchNui('RosterSelect', { job: selectedJob, person: sid });
            setSelected(res && res.SID ? res : null);
        } catch (e) {
            setSelected(null);
        }
        setSelectedLoading(false);
    };

    useEffect(() => {
        setWorkplace('');
        setSelected(null);
        load(selectedJob);
    }, [selectedJob]);

    useEffect(() => {
        if (idParam) select(idParam);
    }, [idParam]); // eslint-disable-line react-hooks/exhaustive-deps

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return officers
            .filter((o) => {
                const j = o.Jobs?.find((x) => x.Id === selectedJob);
                if (!j) return false;
                if (workplace && j.Workplace?.Id !== workplace) return false;
                if (!term) return true;
                return `${o.First} ${o.Last}`.toLowerCase().includes(term) || String(o.Callsign ?? '').includes(term) || String(o.SID) === term;
            })
            .sort((a, b) => (a.Callsign ?? 9999) - (b.Callsign ?? 9999) || String(a.Last).localeCompare(String(b.Last)));
    }, [officers, search, workplace, selectedJob]);

    const refresh = () => {
        if (selected?.SID) select(selected.SID);
        setTimeout(() => load(selectedJob), 100);
    };

    const list = (
        <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 1.5, pr: 4 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {systemAdminMode && (
                        <TextField select size="small" label="Agency" value={selectedJob ?? ''} onChange={(e) => setSelectedJob(e.target.value)} sx={{ flex: 1 }}>
                            {governmentJobs.map((j) => (
                                <MenuItem key={j} value={j}>
                                    {allJobData[j]?.Name ?? j}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}
                    <TextField select size="small" label="Department" value={workplace} onChange={(e) => setWorkplace(e.target.value)} sx={{ flex: 1 }}>
                        <MenuItem value="">All departments</MenuItem>
                        {(jobData?.Workplaces ?? []).map((w) => (
                            <MenuItem key={w.Id} value={w.Id}>
                                {w.Name}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <SearchField value={search} onChange={setSearch} placeholder="Name, callsign or State ID" autoFocus />
                    {canHire && (
                        <Button tone="primary" icon="user-plus" onClick={() => setHire(true)} sx={{ flexShrink: 0 }}>
                            Hire
                        </Button>
                    )}
                </Box>
            </Box>
            <Typography variant="caption" sx={{ mb: 0.5 }}>
                {filtered.length} member{filtered.length === 1 ? '' : 's'}
            </Typography>
            <Scroll>
                {loading ? (
                    <Loader />
                ) : filtered.length === 0 ? (
                    <EmptyState icon="user-tie" title="No members" />
                ) : (
                    filtered.map((o) => {
                        const j = o.Jobs?.find((x) => x.Id === selectedJob);
                        return (
                            <ListRow key={o.SID} selected={selected?.SID === o.SID} onClick={() => select(o.SID)} disabled={selectedLoading}>
                                <Avatar src={o.Mugshot || undefined} alt={o.First} sx={{ width: 36, height: 36, bgcolor: 'var(--sb-bg-4)', fontSize: 13 }}>
                                    {o.First?.[0]}
                                </Avatar>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography variant="body1" className="sb-truncate" sx={{ fontWeight: 600 }}>
                                        {formatPerson(o.First, o.Last, false, o.SID)}
                                    </Typography>
                                    <Typography variant="caption" className="sb-truncate" sx={{ display: 'block' }}>
                                        {j?.Workplace?.Name} · {j?.Grade?.Name}
                                    </Typography>
                                </Box>
                                {o.Callsign ? (
                                    <Typography variant="body2" className="sb-mono" sx={{ color: 'var(--sb-accent)', fontWeight: 600 }}>
                                        {o.Callsign}
                                    </Typography>
                                ) : (
                                    <Tag tone="neutral">no callsign</Tag>
                                )}
                            </ListRow>
                        );
                    })
                )}
            </Scroll>
            <HireDialog open={hire} selectedJob={selectedJob} systemAdminMode={systemAdminMode} onClose={() => setHire(false)} onHired={refresh} />
        </>
    );

    const detail = selectedLoading ? <Loader /> : selected ? <MemberPanel officer={selected} selectedJob={selectedJob} onUpdate={refresh} /> : <Placeholder icon="user-tie" title="No member selected" description="Pick someone on the roster to view and manage their record." />;

    return <SplitPane list={list} detail={detail} width={520} />;
}
