import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import { fetchNui, Tag, Button, Icon, IconButton, EmptyState } from '@sandbox/ui-kit';
import SplitPane from '../common/SplitPane.jsx';
import SearchField from '../common/SearchField.jsx';
import Loader from '../common/Loader.jsx';
import Pager from '../common/Pager.jsx';
import Modal from '../common/Modal.jsx';
import { Scroll } from '../common/Surface.jsx';
import { OfficerPicker } from '../common/Pickers.jsx';
import { Field, FieldGrid, ListRow, Placeholder, AppLink, Rule } from '../common/Fields.jsx';
import { toast } from '../../lib/toast.js';
import { dateLong, dateTimeLong, dateTimeFull } from '../../lib/format.js';
import { VehicleTypes, VehicleIcons, VehicleFlagTypes } from '../../lib/data.js';
import { usePermissions, usePerson, useQueryParam, useGovJob, useUser } from '../../hooks/index.js';

const PER_PAGE = 8;

/* ------------------------------------------------------------------ */
/* List                                                                */
/* ------------------------------------------------------------------ */

function VehicleList() {
    const [searchParam, setSearchParam] = useQueryParam('search');
    const [vehicleId, setVehicleId] = useQueryParam('vehicle');
    const [term, setTerm] = useState(searchParam ?? '');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [searched, setSearched] = useState(false);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);

    const run = async (value, p = 1, reset = true) => {
        const v = (value ?? '').trim();
        if (!v) return;
        setLoading(true);
        setError(false);
        setSearched(true);
        setSearchParam(v);
        try {
            const res = await fetchNui('Search', { type: 'vehicle', term: v, page: p, perPage: PER_PAGE });
            if (res && Array.isArray(res.data)) {
                setResults(res.data);
                if (reset) setPages(res.pages ?? 1);
                else if (res.pages && res.pages > pages) setPages(res.pages);
            } else {
                setResults([]);
                setError(res === false);
            }
        } catch (e) {
            setError(true);
            setResults([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (searchParam) run(searchParam);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <>
            <SearchField
                value={term}
                onChange={setTerm}
                onSubmit={(v) => {
                    setPage(1);
                    run(v, 1, true);
                }}
                onClear={() => {
                    setTerm('');
                    setResults([]);
                    setSearched(false);
                    setSearchParam(null);
                }}
                placeholder="Plate, VIN, make / model or “SID: 123”"
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
                    <EmptyState icon="car" title={searched ? 'No vehicles found' : 'Search the DMV registry'} description={searched ? 'Try a partial plate or VIN.' : 'Enter a plate, VIN or make and press Enter.'} />
                ) : (
                    results.map((v) => (
                        <ListRow key={v.VIN} selected={vehicleId === v.VIN} onClick={() => setVehicleId(v.VIN, { 'fleet-manage': null })}>
                            <Box sx={{ width: 36, height: 36, borderRadius: '8px', display: 'grid', placeItems: 'center', background: 'var(--sb-surface-soft)', color: 'var(--sb-text-2)', flexShrink: 0 }}>
                                <Icon icon={VehicleIcons[v.Type] ?? 'car'} />
                            </Box>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography variant="body1" className="sb-truncate" sx={{ fontWeight: 600 }}>
                                    {v.Make} {v.Model}
                                </Typography>
                                <Typography variant="caption" className="sb-truncate" sx={{ display: 'block' }}>
                                    {v.Owner?.Type === 0 ? `Owner State ID ${v.Owner?.Id}` : 'Organisation / business'}
                                    {v.Type ? ` · ${VehicleTypes[v.Type]}` : ''}
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="body2" className="sb-mono" sx={{ fontWeight: 600 }}>
                                    {v.RegisteredPlate}
                                </Typography>
                                <Typography variant="caption" className="sb-mono" sx={{ display: 'block' }}>
                                    {v.VIN}
                                </Typography>
                            </Box>
                        </ListRow>
                    ))
                )}
            </Scroll>
            <Pager
                page={page}
                count={pages}
                onChange={(p) => {
                    setPage(p);
                    run(term, p, false);
                }}
            />
        </>
    );
}

/* ------------------------------------------------------------------ */
/* Detail                                                              */
/* ------------------------------------------------------------------ */

function FlagDialog({ open, onClose, onSubmit }) {
    const user = useUser();
    const [type, setType] = useState('');
    const [description, setDescription] = useState('');
    useEffect(() => {
        if (open) {
            setType('');
            setDescription('');
        }
    }, [open]);
    return (
        <Modal
            open={open}
            title="Add vehicle flag"
            icon="flag"
            onClose={onClose}
            onSubmit={() =>
                onSubmit({
                    Date: Date.now(),
                    Author: { Callsign: user?.Callsign, SID: user?.SID, First: user?.First, Last: user?.Last },
                    Type: type,
                    Description: description,
                })
            }
            submitLabel="Add flag"
        >
            <TextField select required fullWidth label="Flag" value={type} onChange={(e) => setType(e.target.value)} sx={{ mb: 2 }}>
                {VehicleFlagTypes.map((f) => (
                    <MenuItem key={f.value} value={f.value}>
                        {f.label}
                    </MenuItem>
                ))}
            </TextField>
            <TextField required fullWidth multiline minRows={4} label="Reason" value={description} onChange={(e) => setDescription(e.target.value)} />
        </Modal>
    );
}

function StrikeDialog({ open, onClose, onSubmit }) {
    const user = useUser();
    const [description, setDescription] = useState('');
    useEffect(() => {
        if (open) setDescription('');
    }, [open]);
    return (
        <Modal
            open={open}
            title="Add strike"
            icon="triangle-exclamation"
            onClose={onClose}
            onSubmit={() => onSubmit({ Date: Date.now(), Author: { Callsign: user?.Callsign, SID: user?.SID, First: user?.First, Last: user?.Last }, Description: description })}
            submitLabel="Add strike"
        >
            <TextField required fullWidth multiline minRows={4} label="Reason" value={description} onChange={(e) => setDescription(e.target.value)} autoFocus />
        </Modal>
    );
}

function AssigneesDialog({ open, existing, onClose, onSubmit }) {
    const myJob = useGovJob();
    const [assigned, setAssigned] = useState([]);
    useEffect(() => {
        if (open) setAssigned(Array.isArray(existing) ? existing : []);
    }, [open, existing]);
    return (
        <Modal open={open} title="Assigned drivers" icon="user-shield" onClose={onClose} onSubmit={() => onSubmit(assigned)} submitLabel="Update">
            <OfficerPicker job={myJob?.Id ?? 'police'} label="Assigned drivers" value={assigned} onChange={setAssigned} />
        </Modal>
    );
}

function FlagRow({ flag, onRemove, canEdit }) {
    const formatPerson = usePerson();
    const [open, setOpen] = useState(false);
    const def = VehicleFlagTypes.find((f) => f.value === flag.Type) ?? { label: 'Unknown flag', tone: 'danger' };
    return (
        <>
            <ListRow onClick={() => setOpen(true)} sx={{ px: 1, minHeight: 36 }}>
                <Tag tone={def.tone}>{def.label}</Tag>
                <Typography variant="body2" className="sb-truncate" sx={{ flex: 1, color: 'var(--sb-text-2)' }}>
                    {flag.Description}
                </Typography>
                <Typography variant="caption">{dateLong(flag.Date)}</Typography>
            </ListRow>
            <Modal open={open} title={def.label} icon="flag" onClose={() => setOpen(false)} onDelete={canEdit ? () => onRemove(flag.Type) : undefined} deleteLabel="Remove flag">
                <FieldGrid columns={2}>
                    <Field label="Issued">{dateTimeLong(flag.Date)}</Field>
                    <Field label="Issued by">{flag.Author ? formatPerson(flag.Author.First, flag.Author.Last, flag.Author.Callsign, flag.Author.SID) : 'Unknown'}</Field>
                </FieldGrid>
                <Field label="Reason" wrap sx={{ mt: 2 }}>
                    {flag.Description}
                </Field>
            </Modal>
        </>
    );
}

function StrikeRow({ index, strike, onRemove }) {
    const formatPerson = usePerson();
    const hasPerm = usePermissions();
    const [open, setOpen] = useState(false);
    return (
        <>
            <ListRow onClick={() => setOpen(true)} sx={{ px: 1, minHeight: 36 }}>
                <Tag tone="danger">Strike {index + 1}</Tag>
                <Typography variant="body2" className="sb-truncate" sx={{ flex: 1, color: 'var(--sb-text-2)' }}>
                    {strike.Description}
                </Typography>
                <Typography variant="caption">{dateLong(strike.Date)}</Typography>
            </ListRow>
            <Modal open={open} title={`Vehicle strike ${index + 1}`} icon="triangle-exclamation" onClose={() => setOpen(false)} onDelete={hasPerm(true) ? () => onRemove(index) : undefined} deleteLabel="Remove strike">
                <FieldGrid columns={2}>
                    <Field label="Issued">{dateTimeLong(strike.Date)}</Field>
                    <Field label="Issued by">{strike.Author ? formatPerson(strike.Author.First, strike.Author.Last, strike.Author.Callsign, strike.Author.SID) : 'Unknown'}</Field>
                </FieldGrid>
                <Field label="Reason" wrap sx={{ mt: 2 }}>
                    {strike.Description}
                </Field>
            </Modal>
        </>
    );
}

function VehicleView() {
    const myJob = useGovJob();
    const govJobs = useSelector((s) => s.data.data.governmentJobs) ?? [];
    const [vehicleId] = useQueryParam('vehicle');
    const [fleetManage] = useQueryParam('fleet-manage');
    const [loading, setLoading] = useState(false);
    const [vehicle, setVehicle] = useState(null);
    const [dialog, setDialog] = useState(null);

    useEffect(() => {
        if (!vehicleId) {
            setVehicle(null);
            return;
        }
        let active = true;
        setLoading(true);
        fetchNui('View', { type: 'vehicle', id: vehicleId })
            .then((res) => {
                if (!active) return;
                if (res && res.VIN) setVehicle(res);
                else {
                    setVehicle(null);
                    toast.error('Unable to load vehicle');
                }
            })
            .catch(() => active && toast.error('Unable to load vehicle'))
            .finally(() => active && setLoading(false));
        return () => {
            active = false;
        };
    }, [vehicleId]);

    if (loading) return <Loader />;
    if (!vehicle) return <Placeholder icon="car" title="No vehicle selected" description="Search on the left and pick a vehicle to view its record." />;

    const isPolice = myJob?.Id === 'police';
    const flags = vehicle.Flags ?? [];
    const strikes = vehicle.Strikes ?? [];
    const ownerType = (id) => (govJobs.includes(id) ? 'Government' : 'Business');

    const addFlag = async (flag) => {
        if (flags.find((f) => f.Type === flag.Type)) return toast.error('That flag is already on this vehicle');
        try {
            const res = await fetchNui('Create', { type: 'vehicle-flag', parent: vehicle.VIN, plate: vehicle.RegisteredPlate, doc: flag });
            if (res) {
                setVehicle({ ...vehicle, Flags: [...flags, flag] });
                toast.success('Flag added');
            } else toast.error('Unable to add flag');
        } catch (e) {
            toast.error('Unable to add flag');
        }
        setDialog(null);
    };

    const removeFlag = async (type) => {
        try {
            const res = await fetchNui('Delete', { type: 'vehicle-flag', parent: vehicle.VIN, plate: vehicle.RegisteredPlate, removeRadarFlag: flags.length <= 1, id: type });
            if (res) {
                setVehicle({ ...vehicle, Flags: flags.filter((f) => f.Type !== type) });
                toast.success('Flag removed');
            } else toast.error('Unable to remove flag');
        } catch (e) {
            toast.error('Unable to remove flag');
        }
    };

    const saveStrikes = async (next, success, failure) => {
        try {
            const res = await fetchNui('Update', { type: 'vehicle-strikes', VIN: vehicle.VIN, strikes: next });
            if (res) {
                setVehicle({ ...vehicle, Strikes: next });
                toast.success(success);
            } else toast.error(failure);
        } catch (e) {
            toast.error(failure);
        }
        setDialog(null);
    };

    const assignDrivers = async (assigned) => {
        try {
            const res = await fetchNui('SetAssignedDrivers', { vehicle: vehicle.VIN, assigned });
            if (res) {
                setVehicle({ ...vehicle, GovAssigned: assigned });
                toast.success('Assigned drivers updated');
            } else toast.error('Unable to update assigned drivers');
        } catch (e) {
            toast.error('Unable to update assigned drivers');
        }
        setDialog(null);
    };

    const track = async () => {
        try {
            const res = await fetchNui('TrackFleetVehicle', { vehicle: vehicle.VIN });
            if (res) toast.success('GPS location marked');
            else toast.error('Unable to track vehicle');
        } catch (e) {
            toast.error('Unable to track vehicle');
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 2, borderBottom: '1px solid var(--sb-border)', mb: 2 }}>
                <Box sx={{ width: 52, height: 52, borderRadius: '12px', display: 'grid', placeItems: 'center', background: 'var(--sb-accent-soft)', color: 'var(--sb-accent)', fontSize: 22, flexShrink: 0 }}>
                    <Icon icon={VehicleIcons[vehicle.Type] ?? 'car'} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="h3" className="sb-truncate">
                        {vehicle.Make} {vehicle.Model}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Typography variant="body2" className="sb-mono" sx={{ fontWeight: 600 }}>
                            {vehicle.RegisteredPlate}
                        </Typography>
                        <Tag tone="neutral">{VehicleTypes[vehicle.Type] ?? 'Vehicle'}</Tag>
                        {vehicle.Storage?.Type === 0 && <Tag tone="warning">Impounded</Tag>}
                        {flags.length > 0 && <Tag tone="danger">{flags.length} flag{flags.length === 1 ? '' : 's'}</Tag>}
                    </Box>
                </Box>
                {isPolice && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button icon="flag" onClick={() => setDialog('flag')}>
                            Add flag
                        </Button>
                        <Button icon="triangle-exclamation" onClick={() => (strikes.length >= 15 ? toast.error('Strike limit reached') : setDialog('strike'))}>
                            Add strike
                        </Button>
                    </Box>
                )}
            </Box>

            <Scroll>
                {vehicle.RadarFlag && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        Radar flagged: {vehicle.RadarFlag}
                    </Alert>
                )}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <FieldGrid columns={2}>
                            <Field label="VIN" mono>
                                {vehicle.VIN}
                            </Field>
                            <Field label="Registered plate" mono>
                                {vehicle.RegisteredPlate}
                            </Field>
                            <Field label="Registered owner" sx={{ gridColumn: 'span 2' }}>
                                {vehicle.Owner?.Type === 0 ? (
                                    <AppLink to={`/people?person=${vehicle.Owner?.Id}`}>
                                        {vehicle.Owner?.Person ? `${vehicle.Owner.Person.First} ${vehicle.Owner.Person.Last}` : `State ID ${vehicle.Owner?.Id}`}
                                    </AppLink>
                                ) : (
                                    `${ownerType(vehicle.Owner?.Id)} · ${vehicle.Owner?.JobName ?? 'Unknown'}`
                                )}
                            </Field>
                            <Field label="Registration date">{vehicle.RegistrationDate ? dateLong(vehicle.RegistrationDate, { unix: true }) : 'Unknown'}</Field>
                            <Field label="Impounded">{vehicle.Storage?.Type === 0 ? 'Yes' : 'No'}</Field>
                            {fleetManage === '1' && (
                                <>
                                    <Field label="Storage location">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <span className="sb-truncate">{vehicle.Storage?.Name ?? 'Unknown'}</span>
                                            <Tooltip title="Mark on GPS">
                                                <span>
                                                    <IconButton icon="location-crosshairs" label="Track vehicle" onClick={track} />
                                                </span>
                                            </Tooltip>
                                        </Box>
                                    </Field>
                                    <Field label="Assigned drivers">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <span className="sb-truncate">{vehicle.GovAssigned?.length > 0 ? vehicle.GovAssigned.map((g) => `(${g.Callsign ?? 'N/A'}) ${g.First?.[0]}. ${g.Last}`).join(', ') : 'Unassigned'}</span>
                                            <IconButton icon="pen-to-square" label="Edit assigned drivers" onClick={() => setDialog('assign')} />
                                        </Box>
                                    </Field>
                                </>
                            )}
                        </FieldGrid>
                        <Rule />
                        <Field label="Ownership history" wrap>
                            {vehicle.OwnerHistory?.length
                                ? vehicle.OwnerHistory.map((o, i) => (
                                      <div key={i}>
                                          {o.Type === 0 ? (o.First ? `Transferred from State ID ${o.Id} (${o.First} ${o.Last}) on ${dateTimeFull(o.Time, { unix: true })}` : `Transferred from State ID ${o.Id}`) : 'Transferred from an organisation'}
                                      </div>
                                  ))
                                : 'No previous owners'}
                        </Field>
                        {vehicle.PreviousPlates?.length > 0 && (
                            <Field label="License plate history" wrap mono>
                                {vehicle.PreviousPlates.map((p, i) => (
                                    <div key={i}>
                                        {p.oldPlate} → {p.newPlate} · {dateTimeFull(p.time, { unix: true })}
                                    </div>
                                ))}
                            </Field>
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Field label={`Flags (${flags.length})`}>
                            <Box sx={{ mt: 0.5 }}>
                                {flags.length === 0 && (
                                    <Typography variant="body2" sx={{ color: 'var(--sb-text-3)' }}>
                                        No flags
                                    </Typography>
                                )}
                                {flags.map((f) => (
                                    <FlagRow key={f.Type} flag={f} onRemove={removeFlag} canEdit={isPolice} />
                                ))}
                            </Box>
                        </Field>
                        <Field label={`Strikes (${strikes.length})`}>
                            <Box sx={{ mt: 0.5 }}>
                                {strikes.length === 0 && (
                                    <Typography variant="body2" sx={{ color: 'var(--sb-text-3)' }}>
                                        No strikes
                                    </Typography>
                                )}
                                {strikes.map((s, i) => (
                                    <StrikeRow key={i} index={i} strike={s} onRemove={(idx) => saveStrikes(strikes.filter((_, k) => k !== idx), 'Strike removed', 'Unable to remove strike')} />
                                ))}
                            </Box>
                        </Field>
                    </Box>
                </Box>
            </Scroll>

            <FlagDialog open={dialog === 'flag'} onClose={() => setDialog(null)} onSubmit={addFlag} />
            <StrikeDialog open={dialog === 'strike'} onClose={() => setDialog(null)} onSubmit={(s) => saveStrikes([...strikes, s], 'Strike added', 'Unable to add strike')} />
            <AssigneesDialog open={dialog === 'assign'} existing={vehicle.GovAssigned} onClose={() => setDialog(null)} onSubmit={assignDrivers} />
        </Box>
    );
}

export default function Vehicles() {
    return <SplitPane list={<VehicleList />} detail={<VehicleView />} width={480} />;
}
