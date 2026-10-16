import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Slider from '@mui/material/Slider';
import Alert from '@mui/material/Alert';
import { fetchNui, Tag, Button, Icon, EmptyState } from '@sandbox/ui-kit';
import SplitPane from '../common/SplitPane.jsx';
import SearchField from '../common/SearchField.jsx';
import Loader from '../common/Loader.jsx';
import Pager from '../common/Pager.jsx';
import Modal from '../common/Modal.jsx';
import { Scroll } from '../common/Surface.jsx';
import { Field, FieldGrid, ListRow, Placeholder, Rule } from '../common/Fields.jsx';
import { ChargeTag, useResolvedCharges } from '../common/Charges.jsx';
import { toast } from '../../lib/toast.js';
import { dateLong, dateTime } from '../../lib/format.js';
import { VehicleIcons, getReportType } from '../../lib/data.js';
import { usePermissions, useQueryParam, useGovJob } from '../../hooks/index.js';

const PER_PAGE = 8;

/* ------------------------------------------------------------------ */
/* List                                                                */
/* ------------------------------------------------------------------ */

function PeopleList() {
    const [searchParam, setSearchParam] = useQueryParam('search');
    const [personId, setPersonId] = useQueryParam('person');
    const govJobs = useSelector((s) => s.data.data.governmentJobs) ?? [];
    const [term, setTerm] = useState(searchParam ?? '');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [searched, setSearched] = useState(false);
    const [page, setPage] = useState(1);

    const run = async (value) => {
        const v = (value ?? '').trim();
        if (!v) return;
        setLoading(true);
        setError(false);
        setSearched(true);
        setSearchParam(v);
        try {
            const res = await fetchNui('Search', { type: 'people', term: v });
            if (Array.isArray(res)) setResults(res);
            else {
                setResults([]);
                setError(res === false);
            }
        } catch (e) {
            setError(true);
            setResults([]);
        }
        setPage(1);
        setLoading(false);
    };

    useEffect(() => {
        if (searchParam) run(searchParam);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const pages = Math.max(1, Math.ceil(results.length / PER_PAGE));
    const isGov = (p) => p.Jobs?.find((j) => govJobs.includes(j.Id));

    return (
        <>
            <SearchField
                value={term}
                onChange={setTerm}
                onSubmit={run}
                onClear={() => {
                    setTerm('');
                    setResults([]);
                    setSearched(false);
                    setSearchParam(null);
                }}
                placeholder="Search by name or State ID"
                loading={loading}
                error={error}
                helperText={error ? 'Search failed' : undefined}
                autoFocus
                sx={{ mb: 1.5, pr: 4 }}
            />
            <Scroll>
                {loading ? (
                    <Loader />
                ) : results.length === 0 ? (
                    <EmptyState icon="user" title={searched ? 'No people found' : 'Search the citizen registry'} description={searched ? 'Try a partial name or the State ID.' : 'Enter a name or State ID and press Enter.'} />
                ) : (
                    results.slice((page - 1) * PER_PAGE, page * PER_PAGE).map((p) => (
                        <ListRow key={p.SID} selected={String(personId) === String(p.SID)} onClick={() => setPersonId(p.SID)}>
                            <Avatar src={p.Mugshot || undefined} alt={p.First} sx={{ width: 40, height: 40, bgcolor: 'var(--sb-bg-4)', fontSize: 14 }}>
                                {p.First?.[0]}
                            </Avatar>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography variant="body1" className="sb-truncate" sx={{ fontWeight: 600 }}>
                                    {p.First} {p.Last}
                                </Typography>
                                <Typography variant="caption" className="sb-truncate" sx={{ display: 'block' }}>
                                    DOB {dateLong(p.DOB)}
                                </Typography>
                            </Box>
                            {isGov(p) && <Tag tone="info">Government</Tag>}
                            <Typography variant="body2" className="sb-mono" sx={{ color: 'var(--sb-text-2)' }}>
                                {p.SID}
                            </Typography>
                        </ListRow>
                    ))
                )}
            </Scroll>
            <Pager page={page} count={pages} onChange={setPage} />
        </>
    );
}

/* ------------------------------------------------------------------ */
/* Detail                                                              */
/* ------------------------------------------------------------------ */

const licenseStatus = (l) => {
    let status = l?.Suspended ? 'Suspended' : 'Active';
    if (l?.Points > 0) status += ` · ${l.Points} points`;
    return status;
};

function Convictions({ convictions }) {
    const grouped = useMemo(() => {
        const list = [];
        (convictions ?? []).forEach((c) => {
            const i = list.findIndex((x) => x.id == c.id);
            if (i > -1) list[i] = { ...list[i], count: (list[i].count ?? 1) + (c.count ?? 1) };
            else list.push({ ...c, count: c.count ?? 1 });
        });
        return list;
    }, [convictions]);
    const resolved = useResolvedCharges(grouped);
    const sorted = [...resolved].sort((a, b) => b.jail + b.fine - (a.jail + a.fine));
    if (sorted.length === 0) return <Alert severity="success">No past convictions on record.</Alert>;
    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, maxHeight: 180, overflowY: 'auto' }}>
            {sorted.map((c) => (
                <ChargeTag key={c.id} charge={c} count={c.count} />
            ))}
        </Box>
    );
}

function PersonView() {
    const navigate = useNavigate();
    const hasPerm = usePermissions();
    const myJob = useGovJob();
    const govJobs = useSelector((s) => s.data.data.governmentJobs) ?? [];
    const [personId] = useQueryParam('person');

    const [loading, setLoading] = useState(false);
    const [person, setPerson] = useState(null);
    const [convictions, setConvictions] = useState([]);
    const [dialog, setDialog] = useState(null); // 'mugshot' | 'flags' | 'lawyer' | 'suspensions' | 'points' | 'expunge' | 'logs'
    const [pendingMugshot, setPendingMugshot] = useState('');
    const [flags, setFlags] = useState({ Violent: false, Gang: '' });
    const [attorney, setAttorney] = useState(false);
    const [unsuspend, setUnsuspend] = useState({});
    const [points, setPoints] = useState(1);
    const [confirm, setConfirm] = useState(false);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!personId) {
            setPerson(null);
            return;
        }
        let active = true;
        setLoading(true);
        fetchNui('View', { type: 'person', id: personId })
            .then((res) => {
                if (!active) return;
                if (res && res.data) {
                    setPerson(res);
                    setConvictions(Array.isArray(res.convictions) ? res.convictions : []);
                } else {
                    setPerson(null);
                    toast.error('Unable to load person');
                }
            })
            .catch(() => active && toast.error('Unable to load person'))
            .finally(() => active && setLoading(false));
        return () => {
            active = false;
        };
    }, [personId]);

    if (loading) return <Loader />;
    if (!person) return <Placeholder icon="user" title="No person selected" description="Search on the left and pick a record to view it." />;

    const data = person.data;
    const govEmployment = data.Jobs?.find((j) => govJobs.includes(j.Id));
    const businesses = (data.Jobs ?? []).filter((j) => !govJobs.includes(j.Id) && !j.Hidden);
    const paroleMonths = person.parole && person.parole.end > Date.now() ? Math.ceil((person.parole.end - Date.now()) / 60000) : null;
    const canCreateReport = hasPerm(getReportType(0)?.requiredCreatePermission, false);
    const canViewVehicles = myJob?.Id === 'police' || (myJob?.Id === 'government' && myJob?.Workplace?.Id !== 'publicdefenders');
    const showActions = myJob?.Id === 'police' || myJob?.Id === 'government';
    const licenses = data.Licenses ?? {};
    const driverPoints = licenses.Drivers?.Points ?? 0;

    const patch = (next) => setPerson({ ...person, data: { ...person.data, ...next } });

    const updatePerson = async (Key, Data, success) => {
        setBusy(true);
        try {
            const res = await fetchNui('Update', { type: 'person', SID: data.SID, Key, Data });
            if (res) {
                patch({ [Key]: Data });
                toast.success(success);
                setDialog(null);
            } else toast.error('Update failed');
        } catch (e) {
            toast.error('Update failed');
        }
        setBusy(false);
    };

    const onSuspensions = async () => {
        const body = Object.fromEntries(Object.entries(unsuspend).filter(([, v]) => v));
        setBusy(true);
        try {
            const res = await fetchNui('RevokeSuspension', { SID: data.SID, unsuspend: body });
            if (res) {
                patch({ Licenses: res });
                toast.success('License suspensions updated');
                setDialog(null);
            } else toast.error('Failed to update suspensions');
        } catch (e) {
            toast.error('Failed to update suspensions');
        }
        setBusy(false);
    };

    const onPoints = async () => {
        const newPoints = driverPoints - points;
        if (newPoints < 0) return toast.error('Invalid point reduction');
        setBusy(true);
        try {
            const res = await fetchNui('RemovePoints', { SID: data.SID, newPoints });
            if (res) {
                patch({ Licenses: res });
                toast.success("Driver's license points updated");
                setDialog(null);
            } else toast.error('Failed to update points');
        } catch (e) {
            toast.error('Failed to update points');
        }
        setBusy(false);
    };

    const onExpunge = async () => {
        if (!confirm) return toast.error('Confirm the expungement first');
        setBusy(true);
        try {
            const res = await fetchNui('ClearRecord', { SID: data.SID });
            if (res) {
                setConvictions([]);
                toast.success('Criminal record expunged');
                setDialog(null);
            } else toast.error('Failed to expunge record');
        } catch (e) {
            toast.error('Failed to expunge record');
        }
        setBusy(false);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%' }}>
            {showActions && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, pb: 2, borderBottom: '1px solid var(--sb-border)', mb: 2 }}>
                    {myJob?.Id === 'police' && (
                        <Button
                            icon="flag"
                            onClick={() => {
                                setFlags({ Violent: Boolean(data.Flags?.Violent), Gang: typeof data.Flags?.Gang === 'string' ? data.Flags.Gang : '' });
                                setDialog('flags');
                            }}
                        >
                            Flags
                        </Button>
                    )}
                    {myJob?.Id === 'police' && (
                        <Button
                            icon="camera"
                            disabled={Boolean(govEmployment)}
                            onClick={() => {
                                setPendingMugshot(data.Mugshot ?? '');
                                setDialog('mugshot');
                            }}
                        >
                            Mugshot
                        </Button>
                    )}
                    <Button icon="file-lines" onClick={() => navigate(`/reports?search=${encodeURIComponent(`suspect: ${data.SID}`)}`)}>
                        Related reports
                    </Button>
                    {canCreateReport && (
                        <Button icon="file-circle-plus" tone="primary" onClick={() => navigate(`/reports?mode=create&addSuspect=${data.SID}`)}>
                            Create incident
                        </Button>
                    )}
                    {hasPerm('BAR_CERTIFICATIONS') && (
                        <Button
                            icon="scale-balanced"
                            onClick={() => {
                                setAttorney(Boolean(data.Attorney));
                                setDialog('lawyer');
                            }}
                        >
                            Certifications
                        </Button>
                    )}
                    {hasPerm('REVOKE_LICENSE_SUSPENSIONS') && (
                        <Button
                            icon="id-card"
                            onClick={() => {
                                setUnsuspend({});
                                setDialog('suspensions');
                            }}
                        >
                            Suspensions
                        </Button>
                    )}
                    {hasPerm('REVOKE_LICENSE_SUSPENSIONS') && (
                        <Button
                            icon="minus"
                            disabled={driverPoints <= 0}
                            onClick={() => {
                                setPoints(1);
                                setDialog('points');
                            }}
                        >
                            Points
                        </Button>
                    )}
                    {hasPerm('EXPUNGEMENT') && (
                        <Button
                            icon="broom"
                            tone="danger"
                            onClick={() => {
                                setConfirm(false);
                                setDialog('expunge');
                            }}
                        >
                            Expunge
                        </Button>
                    )}
                    {hasPerm(true) && (
                        <Button icon="clipboard-list" tone="ghost" onClick={() => setDialog('logs')}>
                            Logs
                        </Button>
                    )}
                </Box>
            )}

            <Scroll>
                {paroleMonths && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        On parole · {paroleMonths} month{paroleMonths === 1 ? '' : 's'} remaining
                    </Alert>
                )}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Avatar src={data.Mugshot || undefined} alt={data.First} variant="rounded" sx={{ width: 112, height: 112, fontSize: 36, bgcolor: 'var(--sb-bg-4)', border: '1px solid var(--sb-border-strong)' }}>
                                {data.First?.[0]}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography variant="h3" className="sb-truncate">
                                    {data.First} {data.Last}
                                </Typography>
                                <Typography variant="body2" className="sb-mono" sx={{ color: 'var(--sb-text-2)' }}>
                                    State ID {data.SID}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.75, mt: 1, flexWrap: 'wrap' }}>
                                    {data.Flags?.Violent && (
                                        <Tag tone="danger" icon="triangle-exclamation">
                                            Violent
                                        </Tag>
                                    )}
                                    {data.Attorney && <Tag tone="info">Bar certified attorney</Tag>}
                                    {govEmployment && <Tag tone="info">Government employee</Tag>}
                                </Box>
                            </Box>
                        </Box>
                        <FieldGrid columns={3}>
                            <Field label="Sex">{data.Gender ? 'Female' : 'Male'}</Field>
                            <Field label="Date of birth">{dateLong(data.DOB)}</Field>
                            <Field label="Phone" mono>
                                {data.Phone ?? '—'}
                            </Field>
                            <Field label="Violent">{data.Flags?.Violent ? 'Yes' : 'No'}</Field>
                            <Field label="Gang affiliation" sx={{ gridColumn: 'span 2' }}>
                                {data.Flags?.Gang && data.Flags.Gang.length > 0 ? data.Flags.Gang : 'None'}
                            </Field>
                        </FieldGrid>
                        <Rule />
                        <Field label="Licenses">
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                                {Object.keys(licenses).filter((k) => licenses[k]?.Active || licenses[k]?.Suspended).length === 0 && (
                                    <Typography variant="body2" sx={{ color: 'var(--sb-text-3)' }}>
                                        No licenses held
                                    </Typography>
                                )}
                                {Object.keys(licenses).map((k) => {
                                    const l = licenses[k];
                                    if (!l?.Active && !l?.Suspended) return null;
                                    return (
                                        <Box key={k} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Tag tone={l.Suspended ? 'danger' : 'success'}>{l.Suspended ? 'Suspended' : 'Active'}</Tag>
                                            <Typography variant="body2">{k} license</Typography>
                                            <Typography variant="caption" className="sb-mono" sx={{ ml: 'auto' }}>
                                                {licenseStatus(l)}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Field>
                        {canViewVehicles && (
                            <Field label="Registered vehicles">
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.5 }}>
                                    {(person.vehicles ?? []).length === 0 && (
                                        <Typography variant="body2" sx={{ color: 'var(--sb-text-3)' }}>
                                            None registered
                                        </Typography>
                                    )}
                                    {(person.vehicles ?? []).map((v) => (
                                        <Box
                                            key={v.VIN}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => navigate(`/vehicles?vehicle=${encodeURIComponent(v.VIN)}`)}
                                            onKeyDown={(e) => e.key === 'Enter' && navigate(`/vehicles?vehicle=${encodeURIComponent(v.VIN)}`)}
                                            sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.25, py: 0.5, borderRadius: 'var(--sb-radius-sm)', border: '1px solid var(--sb-border)', cursor: 'pointer', '&:hover': { background: 'var(--sb-surface-hover)' } }}
                                        >
                                            <Icon icon={VehicleIcons[v.Type] ?? 'car'} style={{ color: 'var(--sb-text-3)' }} />
                                            <Typography variant="body2">
                                                {v.Make} {v.Model}
                                            </Typography>
                                            <Typography variant="caption" className="sb-mono">
                                                {v.RegisteredPlate}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Field>
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {govEmployment && (
                            <Field label="Government employment">
                                {govEmployment.Workplace?.Name} · {govEmployment.Grade?.Name}
                            </Field>
                        )}
                        <Field label="Employment">
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.5 }}>
                                {businesses.length === 0 && (
                                    <Typography variant="body2" sx={{ color: 'var(--sb-text-3)' }}>
                                        Unemployed
                                    </Typography>
                                )}
                                {businesses.map((j) => (
                                    <Tag key={j.Id} tone="neutral" icon={person.ownedBusinesses?.includes(j.Id) ? 'crown' : undefined}>
                                        {j.Workplace?.Name ?? j.Name} · {j.Grade?.Name ?? 'Employee'}
                                    </Tag>
                                ))}
                            </Box>
                        </Field>
                        <Field label="Criminal record">
                            <Box sx={{ mt: 0.5 }}>
                                <Convictions convictions={convictions} />
                            </Box>
                        </Field>
                    </Box>
                </Box>
            </Scroll>

            {/* dialogs */}
            <Modal open={dialog === 'mugshot'} title="Update mugshot" icon="camera" onClose={() => setDialog(null)} onSubmit={() => updatePerson('Mugshot', pendingMugshot, 'Mugshot updated')} busy={busy}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Avatar src={pendingMugshot || undefined} variant="rounded" sx={{ width: 96, height: 96, bgcolor: 'var(--sb-bg-4)' }} />
                    <TextField fullWidth required label="Image URL" value={pendingMugshot} onChange={(e) => setPendingMugshot(e.target.value)} autoFocus />
                </Box>
            </Modal>
            <Modal open={dialog === 'flags'} title="Update flags" icon="flag" onClose={() => setDialog(null)} onSubmit={() => updatePerson('Flags', { Violent: flags.Violent, Gang: flags.Gang }, 'Flags updated')} busy={busy}>
                <FormControlLabel control={<Switch checked={flags.Violent} onChange={(e) => setFlags({ ...flags, Violent: e.target.checked })} />} label="Flag as violent" />
                <TextField fullWidth label="Gang affiliation" value={flags.Gang} onChange={(e) => setFlags({ ...flags, Gang: e.target.value })} sx={{ mt: 2 }} />
            </Modal>
            <Modal open={dialog === 'lawyer'} title="Update certifications" icon="scale-balanced" onClose={() => setDialog(null)} onSubmit={() => updatePerson('Attorney', attorney, 'Certification updated')} busy={busy}>
                <FormControlLabel control={<Switch checked={attorney} onChange={(e) => setAttorney(e.target.checked)} />} label="Bar certified attorney" />
            </Modal>
            <Modal open={dialog === 'suspensions'} title="License suspensions" icon="id-card" onClose={() => setDialog(null)} onSubmit={onSuspensions} submitLabel="Apply" busy={busy}>
                <Typography variant="body2" sx={{ color: 'var(--sb-text-2)', mb: 1 }}>
                    Turn a switch off to revoke that suspension. Revoking a driver's license suspension also resets its points.
                </Typography>
                {Object.keys(licenses).filter((k) => licenses[k]?.Suspended).length === 0 && <Alert severity="info">No licenses are suspended.</Alert>}
                {Object.keys(licenses)
                    .filter((k) => licenses[k]?.Suspended)
                    .map((k) => (
                        <FormControlLabel key={k} control={<Switch checked={!unsuspend[k]} onChange={(e) => setUnsuspend({ ...unsuspend, [k]: !e.target.checked })} />} label={`${k} license suspended`} sx={{ display: 'flex' }} />
                    ))}
            </Modal>
            <Modal open={dialog === 'points'} title="Remove license points" icon="minus" onClose={() => setDialog(null)} onSubmit={onPoints} submitLabel="Remove points" busy={busy}>
                <Typography variant="body2" sx={{ color: 'var(--sb-text-2)', mb: 2 }}>
                    Remove driver's license points (this does not lift a suspension). Current: {driverPoints}.
                </Typography>
                <Slider value={points} onChange={(e, v) => setPoints(v)} min={1} max={Math.max(1, driverPoints)} step={1} marks valueLabelDisplay="auto" />
            </Modal>
            <Modal open={dialog === 'expunge'} title="Expunge criminal record" icon="broom" onClose={() => setDialog(null)} onSubmit={onExpunge} submitLabel="Expunge record" busy={busy}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    This clears every sentenced conviction for {data.First} {data.Last}. It cannot be undone.
                </Alert>
                <FormControlLabel control={<Switch checked={confirm} onChange={(e) => setConfirm(e.target.checked)} />} label="I confirm the expungement" />
            </Modal>
            <Modal open={dialog === 'logs'} title="System logs" icon="clipboard-list" maxWidth="md" onClose={() => setDialog(null)}>
                {(data.MDTHistory ?? []).length === 0 && <Alert severity="info">No history recorded.</Alert>}
                <Box sx={{ maxHeight: 420, overflowY: 'auto' }}>
                    {[...(data.MDTHistory ?? [])]
                        .sort((a, b) => b.Time - a.Time)
                        .map((h, i) => (
                            <Box key={i} sx={{ py: 1, borderBottom: '1px solid var(--sb-border)' }}>
                                <Typography variant="body2">{h.Log}</Typography>
                                <Typography variant="caption" className="sb-mono">
                                    {h.Char > -1 ? `SID ${h.Char}` : 'System'} · {dateTime(h.Time)}
                                </Typography>
                            </Box>
                        ))}
                </Box>
            </Modal>
        </Box>
    );
}

export default function People() {
    return <SplitPane list={<PeopleList />} detail={<PersonView />} width={480} />;
}
