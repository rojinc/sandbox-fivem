import React, { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { fetchNui, Tag, IconButton, EmptyState } from '@sandbox/ui-kit';
import { Surface, Scroll, Toolbar } from '../common/Surface.jsx';
import SearchField from '../common/SearchField.jsx';
import Loader from '../common/Loader.jsx';
import Pager from '../common/Pager.jsx';
import { toast } from '../../lib/toast.js';
import { PropertyTypes } from '../../lib/data.js';

const PER_PAGE = 14;

export default function Properties() {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    useEffect(() => {
        let active = true;
        setLoading(true);
        fetchNui('GetProperties', {})
            .then((res) => active && setResults(Array.isArray(res) ? res : []))
            .catch(() => active && setResults([]))
            .finally(() => active && setLoading(false));
        return () => {
            active = false;
        };
    }, []);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return results;
        return results.filter(
            (r) =>
                String(r.label ?? '').toLowerCase().includes(term) ||
                (r.owner && `${r.owner.First} ${r.owner.Last}`.toLowerCase().includes(term)) ||
                (r.owner && String(r.owner.SID) === term),
        );
    }, [results, search]);

    useEffect(() => setPage(1), [search]);
    const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));

    const mark = async (p) => {
        try {
            const res = await fetchNui('FindProperty', p._id ?? p.id);
            if (res) toast.success('Property marked on GPS');
            else toast.error('Unable to mark property');
        } catch (e) {
            toast.error('Unable to mark property');
        }
    };

    return (
        <Surface sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <Toolbar sx={{ mb: 2 }}>
                <SearchField value={search} onChange={setSearch} placeholder="Search by address, owner name or State ID" sx={{ maxWidth: 480 }} autoFocus />
                <Typography variant="caption" sx={{ ml: 'auto' }}>
                    {filtered.length} properties
                </Typography>
            </Toolbar>
            <Scroll>
                {loading ? (
                    <Loader />
                ) : filtered.length === 0 ? (
                    <EmptyState icon="house-chimney" title="No properties found" />
                ) : (
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>Address</TableCell>
                                <TableCell>Owner</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell align="right">GPS</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE).map((p) => (
                                <TableRow key={p._id ?? p.id} hover>
                                    <TableCell sx={{ fontWeight: 500 }}>{p.label}</TableCell>
                                    <TableCell>
                                        {p.owner ? (
                                            <span>
                                                {p.owner.First} {p.owner.Last} <span className="sb-mono" style={{ color: 'var(--sb-text-3)' }}>[{p.owner.SID}]</span>
                                            </span>
                                        ) : (
                                            <Tag tone="neutral">Dynasty 8</Tag>
                                        )}
                                    </TableCell>
                                    <TableCell>{PropertyTypes[p.type] ?? 'Property'}</TableCell>
                                    <TableCell align="right">
                                        <IconButton icon="location-crosshairs" label="Mark on GPS" onClick={() => mark(p)} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Scroll>
            <Pager page={page} count={pages} onChange={setPage} />
        </Surface>
    );
}
