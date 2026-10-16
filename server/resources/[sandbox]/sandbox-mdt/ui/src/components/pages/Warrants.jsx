import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import { fetchNui, Tag, Button, EmptyState } from '@sandbox/ui-kit';
import SplitPane from '../common/SplitPane.jsx';
import SearchField from '../common/SearchField.jsx';
import Loader from '../common/Loader.jsx';
import Pager from '../common/Pager.jsx';
import Modal from '../common/Modal.jsx';
import { Scroll } from '../common/Surface.jsx';
import { Field, FieldGrid, ListRow, Placeholder, AppLink, Meta } from '../common/Fields.jsx';
import { RichView } from '../common/RichEditor.jsx';
import { toast } from '../../lib/toast.js';
import { dateTimeFull, fromNow } from '../../lib/format.js';
import { WarrantStates, warrantState } from '../../lib/data.js';
import { useQueryParam, useGovJob, useTick } from '../../hooks/index.js';

const PER_PAGE = 8;

function WarrantList() {
    useTick();
    const myJob = useGovJob();
    const [searchParam, setSearchParam] = useQueryParam('search');
    const [warrantId, setWarrantId] = useQueryParam('warrant');
    const [term, setTerm] = useState(searchParam ?? '');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);

    const run = async (value, p = 1, reset = true) => {
        const v = (value ?? '').trim();
        setLoading(true);
        setError(false);
        setSearchParam(v || null);
        try {
            const res = await fetchNui('Search', { type: 'warrant', term: v, page: p, perPage: PER_PAGE });
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
        run(searchParam ?? '');
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
                    setPage(1);
                    run('', 1, true);
                }}
                placeholder="Suspect name or warrant number"
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
                    <EmptyState icon="file-contract" title="No warrants" description="Active warrants are listed first." />
                ) : (
                    results.map((w) => {
                        const st = warrantState(w.state);
                        return (
                            <ListRow key={w.id} selected={String(warrantId) === String(w.id)} onClick={() => setWarrantId(w.id)} sx={{ alignItems: 'flex-start' }}>
                                <Tag tone={st.tone} sx={{ mt: 0.25 }}>
                                    {st.label}
                                </Tag>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography variant="body1" className="sb-truncate" sx={{ fontWeight: 600 }}>
                                        <span className="sb-mono" style={{ color: 'var(--sb-text-3)' }}>#{w.id}</span> {w.title}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                                        {myJob?.Id && w.creatorName && (
                                            <Meta icon="user-shield">
                                                {w.creatorName} [{w.creatorCallsign}]
                                            </Meta>
                                        )}
                                        {(w.state === 'active' || w.state === 'expired') && <Meta icon="hourglass-half">{w.state === 'active' ? `expires ${fromNow(w.expires)}` : `expired ${fromNow(w.expires)}`}</Meta>}
                                    </Box>
                                </Box>
                            </ListRow>
                        );
                    })
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

function WarrantView() {
    const myJob = useGovJob();
    const [warrantId] = useQueryParam('warrant');
    const [loading, setLoading] = useState(false);
    const [warrant, setWarrant] = useState(null);
    const [updating, setUpdating] = useState(null);
    const [busy, setBusy] = useState(false);

    const load = async (id) => {
        setLoading(true);
        try {
            const res = await fetchNui('View', { type: 'warrant', id });
            if (res && res.id != null) setWarrant(res);
            else {
                setWarrant(null);
                toast.error('Unable to load warrant');
            }
        } catch (e) {
            toast.error('Unable to load warrant');
        }
        setLoading(false);
    };

    useEffect(() => {
        if (warrantId) load(warrantId);
        else setWarrant(null);
    }, [warrantId]);

    if (loading) return <Loader />;
    if (!warrant) return <Placeholder icon="file-contract" title="No warrant selected" description="Pick a warrant on the left to view it." />;

    const st = warrantState(warrant.state);
    const expired = warrant.state === 'active' && new Date(warrant.expires).getTime() < Date.now();

    const onUpdate = async () => {
        setBusy(true);
        try {
            const res = await fetchNui('Update', { type: 'warrant', id: warrant.id, state: updating });
            if (res) {
                toast.success('Warrant updated');
                setUpdating(null);
                load(warrant.id);
            } else toast.error('Unable to update warrant');
        } catch (e) {
            toast.error('Unable to update warrant');
        }
        setBusy(false);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 2, borderBottom: '1px solid var(--sb-border)', mb: 2 }}>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="h3" className="sb-truncate">
                        {warrant.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                        <Tag tone={st.tone}>{st.label}</Tag>
                        <Typography variant="caption" className="sb-mono">
                            Warrant #{warrant.id}
                        </Typography>
                    </Box>
                </Box>
                {myJob?.Id === 'police' && warrant.state === 'active' && (
                    <Button icon="pen-to-square" onClick={() => setUpdating('void')}>
                        Update status
                    </Button>
                )}
            </Box>
            <Scroll>
                {expired && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        This warrant has passed its expiry and will be marked expired shortly.
                    </Alert>
                )}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                    <FieldGrid columns={1}>
                        <Field label="Issued">{dateTimeFull(warrant.issued)}</Field>
                        <Field label={warrant.state === 'active' ? 'Expires' : 'Expiry'}>{dateTimeFull(warrant.expires)}</Field>
                        {warrant.suspectData && (
                            <Field label="Suspect">
                                <AppLink to={`/people?person=${warrant.suspectData.SID}`}>
                                    {warrant.suspectData.First} {warrant.suspectData.Last} ({warrant.suspectData.SID})
                                </AppLink>
                            </Field>
                        )}
                        {myJob?.Id && (
                            <>
                                <Field label="Issuing officer">
                                    [{warrant.creatorCallsign}] {warrant.creatorName} ({warrant.creatorSID})
                                </Field>
                                <Field label="Referenced report">
                                    <AppLink to={`/reports?report=${warrant.report}&mode=view`}>Report #{warrant.report}</AppLink>
                                </Field>
                            </>
                        )}
                    </FieldGrid>
                    {myJob?.Id && (
                        <Field label="Warrant notes" wrap>
                            <RichView html={warrant.notes} emptyText="No notes." sx={{ mt: 0.5 }} />
                        </Field>
                    )}
                </Box>
            </Scroll>

            <Modal open={Boolean(updating)} title="Update warrant status" icon="file-contract" onClose={() => setUpdating(null)} onSubmit={onUpdate} submitLabel="Update" busy={busy}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    A warrant cannot be reactivated once its status changes; a new warrant has to be issued.
                </Alert>
                <TextField select fullWidth label="New status" value={updating ?? 'void'} onChange={(e) => setUpdating(e.target.value)}>
                    {WarrantStates.filter((w) => w.value !== 'active').map((w) => (
                        <MenuItem key={w.value} value={w.value}>
                            {w.label}
                        </MenuItem>
                    ))}
                </TextField>
            </Modal>
        </Box>
    );
}

export default function Warrants() {
    return <SplitPane list={<WarrantList />} detail={<WarrantView />} width={480} />;
}
