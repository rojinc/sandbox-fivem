import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import { Button, Tag } from '@sandbox/ui-kit';
import Toolbar from '../common/Toolbar.jsx';
import SearchField from '../common/SearchField.jsx';
import DataTable from '../common/DataTable.jsx';
import { callNui, describeError } from '../../lib/nui.js';
import { text } from '../../lib/format.js';

function matchesVehicle(v, term) {
    const q = term.trim().toLowerCase();
    if (!q) return true;
    return (
        `${v.Make ?? ''} ${v.Model ?? ''}`.toLowerCase().includes(q) ||
        String(v.Plate ?? '')
            .toLowerCase()
            .includes(q) ||
        String(v.VIN ?? '').toLowerCase() === q ||
        String(v.OwnerId ?? '')
            .toLowerCase()
            .includes(q)
    );
}

export function PlateChip({ plate }) {
    return (
        <Box
            component="span"
            className="sb-mono"
            sx={{
                display: 'inline-block',
                px: 0.75,
                py: 0.1,
                borderRadius: '4px',
                border: '1px solid var(--sb-border-strong)',
                background: 'rgba(255,255,255,0.06)',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 0.6,
                textTransform: 'uppercase',
            }}
        >
            {text(plate, '????????')}
        </Box>
    );
}

export default function Vehicles() {
    const navigate = useNavigate();
    const [term, setTerm] = useState('');
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await callNui('GetVehicleList', {});
            if (Array.isArray(res)) setRows(res);
            else {
                setRows([]);
                if (res === false) setError('The server refused the request (no staff permission).');
            }
        } catch (e) {
            setRows([]);
            setError(describeError(e));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const shown = useMemo(() => rows.filter((v) => matchesVehicle(v, term)).sort((a, b) => (a.Entity ?? 0) - (b.Entity ?? 0)), [rows, term]);

    const columns = [
        { key: 'Plate', label: 'Plate', width: 120, render: (v) => <PlateChip plate={v.Plate} /> },
        { key: 'Make', label: 'Vehicle', render: (v) => `${v.Make ?? 'Unknown'} ${v.Model ?? 'Unknown'}` },
        { key: 'VIN', label: 'VIN', mono: true, muted: true, render: (v) => text(v.VIN) },
        { key: 'OwnerId', label: 'Owner', width: 140, render: (v) => (v.OwnerId === undefined || v.OwnerId === null ? <Tag>Unknown</Tag> : <span className="sb-mono">{String(v.OwnerId)}</span>) },
        { key: 'Entity', label: 'Entity', width: 96, mono: true, muted: true, align: 'right' },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minHeight: 0 }}>
            <Toolbar
                count={loading ? undefined : shown.length}
                countLabel={shown.length === 1 ? 'vehicle' : 'vehicles'}
                actions={
                    <Button tone="ghost" icon="arrows-rotate" onClick={load} disabled={loading}>
                        Refresh
                    </Button>
                }
            >
                <SearchField value={term} onChange={setTerm} placeholder="Make, model, plate, exact VIN or owner" autoFocus />
            </Toolbar>

            <DataTable
                columns={columns}
                rows={shown}
                rowKey={(v) => v.Entity}
                loading={loading}
                onRowClick={(v) => navigate(`/vehicle/${v.Entity}`)}
                empty={
                    error
                        ? { icon: 'triangle-exclamation', title: 'Could not load vehicles', description: error }
                        : rows.length
                          ? { icon: 'magnifying-glass', title: 'No matches', description: 'Try a plate, a make or an owner account.' }
                          : { icon: 'car', title: 'No owned vehicles are out', description: 'Vehicles taken out of a garage show up here while they exist in the world.' }
                }
            />
        </Box>
    );
}
