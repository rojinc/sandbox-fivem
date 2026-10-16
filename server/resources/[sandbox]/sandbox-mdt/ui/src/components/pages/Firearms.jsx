import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { fetchNui, Tag, Button, Icon, EmptyState } from '@sandbox/ui-kit';
import SplitPane from '../common/SplitPane.jsx';
import SearchField from '../common/SearchField.jsx';
import Loader from '../common/Loader.jsx';
import Pager from '../common/Pager.jsx';
import Modal from '../common/Modal.jsx';
import { Scroll } from '../common/Surface.jsx';
import { Field, FieldGrid, ListRow, Placeholder, AppLink } from '../common/Fields.jsx';
import { toast } from '../../lib/toast.js';
import { dateLong, dateTimeLong } from '../../lib/format.js';
import { FirearmFlagTitles } from '../../lib/data.js';
import { useQueryParam } from '../../hooks/index.js';

const PER_PAGE = 8;

function FirearmList() {
    const [searchParam, setSearchParam] = useQueryParam('search');
    const [firearmId, setFirearmId] = useQueryParam('firearm');
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
            const res = await fetchNui('Search', { type: 'firearm', term: v });
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
                placeholder="Serial number, owner name or State ID"
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
                    <EmptyState icon="gun" title={searched ? 'No firearms found' : 'Search the firearm registry'} description={searched ? 'Scratched serials are not listed.' : 'Enter a serial number or owner and press Enter.'} />
                ) : (
                    results.slice((page - 1) * PER_PAGE, page * PER_PAGE).map((f) => (
                        <ListRow key={f.serial} selected={firearmId === f.serial} onClick={() => setFirearmId(f.serial)}>
                            <Box sx={{ width: 36, height: 36, borderRadius: '8px', display: 'grid', placeItems: 'center', background: 'var(--sb-surface-soft)', color: 'var(--sb-text-2)', flexShrink: 0 }}>
                                <Icon icon="gun" />
                            </Box>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography variant="body1" className="sb-truncate" sx={{ fontWeight: 600 }}>
                                    {f.model ?? 'Unknown model'}
                                </Typography>
                                <Typography variant="caption" className="sb-truncate" sx={{ display: 'block' }}>
                                    {f.owner_sid ? `${f.owner_name} (${f.owner_sid})` : f.owner_name}
                                </Typography>
                            </Box>
                            <Typography variant="body2" className="sb-mono" sx={{ color: 'var(--sb-text-2)' }}>
                                {f.serial}
                            </Typography>
                        </ListRow>
                    ))
                )}
            </Scroll>
            <Pager page={page} count={pages} onChange={setPage} />
        </>
    );
}

function FlagDialog({ open, onClose, onSubmit }) {
    const [title, setTitle] = useState('Stolen');
    const [description, setDescription] = useState('');
    useEffect(() => {
        if (open) {
            setTitle('Stolen');
            setDescription('');
        }
    }, [open]);
    return (
        <Modal open={open} title="Add firearm flag" icon="flag" onClose={onClose} onSubmit={() => onSubmit({ title, description })} submitLabel="Add flag">
            <TextField select required fullWidth label="Flag" value={title} onChange={(e) => setTitle(e.target.value)} sx={{ mb: 2 }}>
                {FirearmFlagTitles.map((t) => (
                    <MenuItem key={t} value={t}>
                        {t}
                    </MenuItem>
                ))}
            </TextField>
            <TextField required fullWidth multiline minRows={4} label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </Modal>
    );
}

function FlagRow({ flag, onRemove }) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <ListRow onClick={() => setOpen(true)} sx={{ px: 1, minHeight: 36 }}>
                <Tag tone="danger">{flag.title}</Tag>
                <Typography variant="body2" className="sb-truncate" sx={{ flex: 1, color: 'var(--sb-text-2)' }}>
                    {flag.description}
                </Typography>
                <Typography variant="caption">{dateLong(flag.date)}</Typography>
            </ListRow>
            <Modal open={open} title={flag.title} icon="flag" onClose={() => setOpen(false)} onDelete={() => onRemove(flag.id)} deleteLabel="Remove flag">
                <FieldGrid columns={2}>
                    <Field label="Issued">{dateTimeLong(flag.date)}</Field>
                    <Field label="Issued by">{flag.author_sid ? `[${flag.author_callsign}] ${flag.author_first} ${flag.author_last} (${flag.author_sid})` : 'Robbery investigation'}</Field>
                </FieldGrid>
                <Field label="Reason" wrap sx={{ mt: 2 }}>
                    {flag.description}
                </Field>
            </Modal>
        </>
    );
}

function FirearmView() {
    const [firearmId] = useQueryParam('firearm');
    const [loading, setLoading] = useState(false);
    const [firearm, setFirearm] = useState(null);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        if (!firearmId) {
            setFirearm(null);
            return;
        }
        let active = true;
        setLoading(true);
        fetchNui('View', { type: 'firearm', id: firearmId })
            .then((res) => {
                if (!active) return;
                if (res && res.serial) setFirearm({ ...res, flags: Array.isArray(res.flags) ? res.flags : [] });
                else {
                    setFirearm(null);
                    toast.error('Unable to load firearm');
                }
            })
            .catch(() => active && toast.error('Unable to load firearm'))
            .finally(() => active && setLoading(false));
        return () => {
            active = false;
        };
    }, [firearmId]);

    if (loading) return <Loader />;
    if (!firearm) return <Placeholder icon="gun" title="No firearm selected" description="Search on the left and pick a firearm to view its record." />;

    const addFlag = async (flag) => {
        try {
            const res = await fetchNui('Create', { type: 'firearm-flag', parentId: firearm.serial, doc: flag });
            if (res && typeof res === 'object') {
                setFirearm({ ...firearm, flags: [...firearm.flags, res] });
                toast.success('Flag added');
            } else toast.error('Unable to add flag');
        } catch (e) {
            toast.error('Unable to add flag');
        }
        setAdding(false);
    };

    const removeFlag = async (id) => {
        try {
            const res = await fetchNui('Delete', { type: 'firearm-flag', parentId: firearm.serial, id });
            if (res) {
                setFirearm({ ...firearm, flags: firearm.flags.filter((f) => f.id !== id) });
                toast.success('Flag removed');
            } else toast.error('Unable to remove flag');
        } catch (e) {
            toast.error('Unable to remove flag');
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 2, borderBottom: '1px solid var(--sb-border)', mb: 2 }}>
                <Box sx={{ width: 52, height: 52, borderRadius: '12px', display: 'grid', placeItems: 'center', background: 'var(--sb-accent-soft)', color: 'var(--sb-accent)', fontSize: 22, flexShrink: 0 }}>
                    <Icon icon="gun" />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="h3" className="sb-truncate">
                        {firearm.model ?? 'Unknown firearm'}
                    </Typography>
                    <Typography variant="body2" className="sb-mono" sx={{ color: 'var(--sb-text-2)' }}>
                        Serial {firearm.serial}
                    </Typography>
                </Box>
                <Button icon="flag" onClick={() => setAdding(true)}>
                    Add flag
                </Button>
            </Box>
            <Scroll>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                    <FieldGrid columns={1}>
                        <Field label="Registered owner">{firearm.owner_sid ? <AppLink to={`/people?person=${firearm.owner_sid}`}>{`${firearm.owner_name} (${firearm.owner_sid})`}</AppLink> : firearm.owner_name}</Field>
                        <Field label="Date of purchase">{dateTimeLong(firearm.purchased)}</Field>
                    </FieldGrid>
                    <Field label={`Flags (${firearm.flags.length})`}>
                        <Box sx={{ mt: 0.5 }}>
                            {firearm.flags.length === 0 && (
                                <Typography variant="body2" sx={{ color: 'var(--sb-text-3)' }}>
                                    No flags
                                </Typography>
                            )}
                            {firearm.flags.map((f, i) => (
                                <FlagRow key={f.id ?? i} flag={f} onRemove={removeFlag} />
                            ))}
                        </Box>
                    </Field>
                </Box>
            </Scroll>
            <FlagDialog open={adding} onClose={() => setAdding(false)} onSubmit={addFlag} />
        </Box>
    );
}

export default function Firearms() {
    return <SplitPane list={<FirearmList />} detail={<FirearmView />} width={480} />;
}
