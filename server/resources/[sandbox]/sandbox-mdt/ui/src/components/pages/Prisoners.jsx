import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { fetchNui, IconButton, EmptyState, ProgressBar } from '@sandbox/ui-kit';
import { Surface, Scroll, Toolbar } from '../common/Surface.jsx';
import SearchField from '../common/SearchField.jsx';
import Loader from '../common/Loader.jsx';
import Pager from '../common/Pager.jsx';
import Modal from '../common/Modal.jsx';
import { toast } from '../../lib/toast.js';
import { dateTime } from '../../lib/format.js';
import { useTick } from '../../hooks/index.js';

const PER_PAGE = 12;

export const monthsRemaining = (prisoner) => Math.max(0, Math.ceil((prisoner?.Jailed?.Release - Date.now() / 1000) / 60));

/** Shared list used by the DOC page and the public visitation kiosk. */
export function PrisonerTable({ prisoners, loading, action, actionHeader }) {
    useTick(30000);
    const [page, setPage] = useState(1);
    const pages = Math.max(1, Math.ceil(prisoners.length / PER_PAGE));
    useEffect(() => setPage(1), [prisoners.length]);

    if (loading) return <Loader />;
    if (prisoners.length === 0) return <EmptyState icon="handcuffs" title="No inmates awake" description="Only inmates currently in the city are listed." />;

    return (
        <>
            <Scroll>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>Inmate</TableCell>
                            <TableCell sx={{ width: 260 }}>Sentence</TableCell>
                            <TableCell>Sentenced</TableCell>
                            <TableCell>Release</TableCell>
                            <TableCell>DOC reductions</TableCell>
                            {actionHeader && <TableCell align="right">{actionHeader}</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {prisoners.slice((page - 1) * PER_PAGE, page * PER_PAGE).map((p) => {
                            const remain = monthsRemaining(p);
                            const total = p.Jailed?.Duration ?? 0;
                            return (
                                <TableRow key={p.SID} hover>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {p.First} {p.Last}
                                        </Typography>
                                        <Typography variant="caption" className="sb-mono">
                                            State ID {p.SID}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <ProgressBar value={total - remain} max={total || 1} valueLabel={`${remain} / ${total} mo left`} color="var(--sb-info)" />
                                    </TableCell>
                                    <TableCell>{dateTime(p.Jailed?.Time, { unix: true })}</TableCell>
                                    <TableCell>{dateTime(p.Jailed?.Release, { unix: true })}</TableCell>
                                    <TableCell className="sb-mono">{p.Jailed?.Reduced ?? 0} months</TableCell>
                                    {action && <TableCell align="right">{action(p)}</TableCell>}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Scroll>
            <Pager page={page} count={pages} onChange={setPage} />
        </>
    );
}

export function usePrisoners() {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const load = async () => {
        setLoading(true);
        try {
            const res = await fetchNui('DOCGetPrisoners', {});
            setResults(Array.isArray(res) ? res : []);
        } catch (e) {
            setResults([]);
        }
        setLoading(false);
    };
    useEffect(() => {
        load();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    return { loading, results, reload: load };
}

export function filterPrisoners(list, search) {
    const term = search.trim().toLowerCase();
    if (!term) return list;
    return list.filter((r) => `${r.First} ${r.Last}`.toLowerCase().includes(term) || String(r.SID) === term);
}

function ReductionDialog({ prisoner, onClose, onSubmit }) {
    const [value, setValue] = useState('');
    useEffect(() => setValue(''), [prisoner]);
    const submit = () => {
        const n = parseInt(value, 10);
        const remain = monthsRemaining(prisoner);
        if (Number.isNaN(n) || n <= 0 || n > 100) return toast.error('Enter a reduction between 1 and 100 months');
        if (n > remain) return toast.error('Cannot reduce more than the remaining sentence');
        onSubmit({ SID: prisoner.SID, reduction: n });
    };
    return (
        <Modal open={Boolean(prisoner)} title={`Reduce sentence · ${prisoner?.First} ${prisoner?.Last}`} icon="hourglass-half" onClose={onClose} onSubmit={submit} submitLabel="Reduce sentence">
            <Typography variant="body2" sx={{ color: 'var(--sb-text-2)', mb: 2 }}>
                {prisoner ? `${monthsRemaining(prisoner)} months remain on this sentence. The reduction is logged.` : ''}
            </Typography>
            <TextField autoFocus fullWidth label="Reduction (months)" value={value} onChange={(e) => /^\d*$/.test(e.target.value) && setValue(e.target.value)} slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 3 } }} />
        </Modal>
    );
}

export default function Prisoners() {
    const navigate = useNavigate();
    const { loading, results, reload } = usePrisoners();
    const [search, setSearch] = useState('');
    const [reducing, setReducing] = useState(null);
    const filtered = useMemo(() => filterPrisoners(results, search), [results, search]);

    const onReduce = async (data) => {
        setReducing(null);
        try {
            const res = await fetchNui('DOCReduceSentence', data);
            if (res) {
                toast.success('Sentence reduced');
                reload();
            } else toast.error('Unable to reduce sentence');
        } catch (e) {
            toast.error('Unable to reduce sentence');
        }
    };

    return (
        <Surface sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <Toolbar sx={{ mb: 2 }}>
                <SearchField value={search} onChange={setSearch} placeholder="Search by inmate name or State ID" sx={{ maxWidth: 440 }} autoFocus />
                <Typography variant="caption" sx={{ ml: 'auto' }}>
                    {filtered.length} inmates
                </Typography>
                <IconButton icon="arrows-rotate" label="Refresh" onClick={reload} />
            </Toolbar>
            <PrisonerTable
                prisoners={filtered}
                loading={loading}
                actionHeader="Actions"
                action={(p) => (
                    <Box sx={{ display: 'inline-flex', gap: 0.5 }}>
                        <IconButton icon="user" label="View profile" onClick={() => navigate(`/people?person=${p.SID}`)} />
                        <IconButton icon="hourglass-half" label="Reduce sentence" onClick={() => setReducing(p)} />
                    </Box>
                )}
            />
            <ReductionDialog prisoner={reducing} onClose={() => setReducing(null)} onSubmit={onReduce} />
        </Surface>
    );
}
