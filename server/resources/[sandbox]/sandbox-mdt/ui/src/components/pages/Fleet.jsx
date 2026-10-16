import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { fetchNui, Tag, EmptyState } from '@sandbox/ui-kit';
import { Surface, Scroll, Toolbar } from '../common/Surface.jsx';
import SearchField from '../common/SearchField.jsx';
import Loader from '../common/Loader.jsx';
import { VehicleTypes } from '../../lib/data.js';
import { dateLong } from '../../lib/format.js';
import { useGovJob } from '../../hooks/index.js';

export default function Fleet() {
    const navigate = useNavigate();
    const myJob = useGovJob();
    const jobData = useSelector((s) => s.data.data.governmentJobsData)?.[myJob?.Id];
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [results, setResults] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        let active = true;
        setLoading(true);
        fetchNui('ViewVehicleFleet', {})
            .then((res) => {
                if (!active) return;
                if (Array.isArray(res)) setResults(res);
                else {
                    setResults([]);
                    setError(res === false);
                }
            })
            .catch(() => active && setError(true))
            .finally(() => active && setLoading(false));
        return () => {
            active = false;
        };
    }, []);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        const list = term
            ? results.filter((r) => String(r.VIN ?? '').toLowerCase().includes(term) || String(r.RegisteredPlate ?? '').toLowerCase().includes(term) || `${r.Make} ${r.Model}`.toLowerCase().includes(term))
            : results;
        return [...list].sort((a, b) => (a.RegistrationDate ?? 0) - (b.RegistrationDate ?? 0));
    }, [results, search]);

    const workplaceName = (id) => jobData?.Workplaces?.find((w) => w.Id === id)?.Name ?? 'All';

    return (
        <Surface sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <Toolbar sx={{ mb: 2 }}>
                <SearchField value={search} onChange={setSearch} placeholder="Search by plate, VIN or make / model" sx={{ maxWidth: 480 }} autoFocus error={error} helperText={error ? 'Unable to load the fleet' : undefined} />
                <Typography variant="caption" sx={{ ml: 'auto' }}>
                    {filtered.length} vehicles
                </Typography>
            </Toolbar>
            <Scroll>
                {loading ? (
                    <Loader />
                ) : filtered.length === 0 ? (
                    <EmptyState icon="truck" title="No fleet vehicles" description="Vehicles owned by your agency appear here." />
                ) : (
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>Plate</TableCell>
                                <TableCell>Vehicle</TableCell>
                                <TableCell>VIN</TableCell>
                                <TableCell>Department</TableCell>
                                <TableCell>Assigned</TableCell>
                                <TableCell>Storage</TableCell>
                                <TableCell>Registered</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtered.map((v) => (
                                <TableRow key={v.VIN} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/vehicles?vehicle=${encodeURIComponent(v.VIN)}&fleet-manage=1`)}>
                                    <TableCell className="sb-mono" sx={{ fontWeight: 600 }}>
                                        {v.RegisteredPlate}
                                    </TableCell>
                                    <TableCell>
                                        {v.Make} {v.Model} {v.Type ? <Tag tone="neutral">{VehicleTypes[v.Type] ?? 'Vehicle'}</Tag> : null}
                                    </TableCell>
                                    <TableCell className="sb-mono" sx={{ color: 'var(--sb-text-2)' }}>
                                        {v.VIN}
                                    </TableCell>
                                    <TableCell>{workplaceName(v.Owner?.Workplace)}</TableCell>
                                    <TableCell>{v.GovAssigned?.length > 0 ? v.GovAssigned.map((g) => `(${g.Callsign ?? 'N/A'}) ${g.First?.[0]}. ${g.Last}`).join(', ') : <span style={{ color: 'var(--sb-text-3)' }}>Unassigned</span>}</TableCell>
                                    <TableCell>{v.Storage?.Name ?? 'Unknown'}</TableCell>
                                    <TableCell>{v.RegistrationDate ? dateLong(v.RegistrationDate, { unix: true }) : 'Unknown'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Scroll>
        </Surface>
    );
}
