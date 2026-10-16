import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import { fetchNui, Tag, Icon, IconButton, EmptyState } from '@sandbox/ui-kit';
import { Surface, SurfaceHeader, Scroll } from '../common/Surface.jsx';
import { ListRow, Meta, Field, FieldGrid } from '../common/Fields.jsx';
import Modal from '../common/Modal.jsx';
import Loader from '../common/Loader.jsx';
import Pager from '../common/Pager.jsx';
import { RichView } from '../common/RichEditor.jsx';
import { toast } from '../../lib/toast.js';
import { fromNow, dateTimeLong } from '../../lib/format.js';
import { BOLOTypes } from '../../lib/data.js';
import { usePermissions, usePerson, useRole, useTick, useUser, useGovJob } from '../../hooks/index.js';

const NOTICES_PER_PAGE = 6;

/* ------------------------------------------------------------------ */
/* Notice board                                                        */
/* ------------------------------------------------------------------ */

function NoticeDialog({ notice, onClose, onDeleted }) {
    const hasPerm = usePermissions();
    const user = useUser();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);

    useEffect(() => {
        if (!notice) return;
        let active = true;
        setLoading(true);
        setData(null);
        fetchNui('View', { type: 'notice', id: notice.id })
            .then((res) => {
                if (!active) return;
                if (res && res.id != null) setData(res);
                else toast.error('Unable to load notice');
            })
            .catch(() => toast.error('Unable to load notice'))
            .finally(() => active && setLoading(false));
        return () => {
            active = false;
        };
    }, [notice]);

    const canDelete = Boolean(notice) && (hasPerm(true) || (data && data.creator == user?.SID));

    const onDelete = async () => {
        try {
            const res = await fetchNui('Delete', { type: 'notice', id: notice.id });
            if (res) {
                toast.success('Notice removed');
                onDeleted?.();
                onClose();
            } else toast.error('Unable to remove notice');
        } catch (e) {
            toast.error('Unable to remove notice');
        }
    };

    return (
        <Modal open={Boolean(notice)} title={notice?.title ?? 'Notice'} icon="bullhorn" maxWidth="md" onClose={onClose} onDelete={canDelete && !loading ? onDelete : undefined} deleteLabel="Remove notice">
            {loading ? (
                <Loader />
            ) : data ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <RichView html={data.description} />
                    <FieldGrid columns={3}>
                        <Field label="Posted">{dateTimeLong(data.created)}</Field>
                        <Field label="Author" mono>
                            State ID {data.creator}
                        </Field>
                        <Field label="Audience">{data.restricted === 'public' ? 'Public' : data.restricted}</Field>
                    </FieldGrid>
                </Box>
            ) : null}
        </Modal>
    );
}

function NoticeBoard({ notices, onChanged }) {
    useTick();
    const navigate = useNavigate();
    const hasPerm = usePermissions();
    const [page, setPage] = useState(1);
    const [open, setOpen] = useState(null);
    const list = Array.isArray(notices) ? [...notices].sort((a, b) => new Date(b.created) - new Date(a.created)) : [];
    const pages = Math.max(1, Math.ceil(list.length / NOTICES_PER_PAGE));
    const canPost = hasPerm('PD_HIGH_COMMAND') || hasPerm('SAFD_HIGH_COMMAND') || hasPerm('DOJ_JUDGE') || hasPerm('GOV_MAYOR') || hasPerm('GOV_DA') || hasPerm('GOV_CPUB') || hasPerm('DOC_HIGH_COMMAND');

    useEffect(() => setPage(1), [notices]);

    return (
        <Surface sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <SurfaceHeader icon="bullhorn" title="Notice board" subtitle={`${list.length} notice${list.length === 1 ? '' : 's'}`} actions={canPost && <IconButton icon="plus" label="Post a notice" onClick={() => navigate('/create/notice')} />} />
            <Scroll>
                {list.length === 0 && <EmptyState icon="bullhorn" title="No notices" description="Department notices appear here." />}
                {list.slice((page - 1) * NOTICES_PER_PAGE, page * NOTICES_PER_PAGE).map((n) => (
                    <ListRow key={n.id} onClick={() => setOpen(n)}>
                        <Box sx={{ width: 30, height: 30, borderRadius: '8px', display: 'grid', placeItems: 'center', background: 'var(--sb-surface-soft)', color: 'var(--sb-text-2)', fontSize: 12, flexShrink: 0 }}>
                            <Icon icon={n.restricted && n.restricted !== 'public' && n.restricted !== 'government' ? 'lock' : 'circle-info'} />
                        </Box>
                        <Typography variant="body1" className="sb-truncate" sx={{ flex: 1, fontWeight: 500 }}>
                            {n.title}
                        </Typography>
                        <Meta icon="clock">{fromNow(n.created)}</Meta>
                    </ListRow>
                ))}
            </Scroll>
            <Pager page={page} count={pages} onChange={setPage} />
            <NoticeDialog notice={open} onClose={() => setOpen(null)} onDeleted={onChanged} />
        </Surface>
    );
}

/* ------------------------------------------------------------------ */
/* BOLOs                                                               */
/* ------------------------------------------------------------------ */

function BoloDialog({ bolo, onClose }) {
    const dispatch = useDispatch();
    const formatPerson = usePerson();

    const onDismiss = async () => {
        try {
            const res = await fetchNui('Delete', { type: 'BOLO', id: bolo.id });
            if (res) {
                dispatch({ type: 'REMOVE_DATA', payload: { type: 'bolos', id: bolo.id } });
                toast.success('BOLO dismissed');
                onClose();
            } else toast.error('Unable to dismiss BOLO');
        } catch (e) {
            toast.error('Unable to dismiss BOLO');
        }
    };

    const type = BOLOTypes.find((b) => b.value == bolo?.type);
    return (
        <Modal open={Boolean(bolo)} title={bolo?.title ?? 'BOLO'} icon="eye" maxWidth="sm" onClose={onClose} onDelete={bolo ? onDismiss : undefined} deleteLabel="Dismiss BOLO">
            {bolo && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FieldGrid columns={2}>
                        <Field label="Issuing officer">{bolo.author ? formatPerson(bolo.author.First, bolo.author.Last, bolo.author.Callsign, bolo.author.SID) : 'Unknown'}</Field>
                        <Field label="Type">{type?.label ?? 'Unknown'}</Field>
                        <Field label="Issued">{dateTimeLong(bolo.time)}</Field>
                    </FieldGrid>
                    <Field label="Summary" wrap>
                        {bolo.summary}
                    </Field>
                    <Field label="Description" wrap>
                        {bolo.description}
                    </Field>
                </Box>
            )}
        </Modal>
    );
}

function BoloBoard() {
    useTick();
    const navigate = useNavigate();
    const bolos = useSelector((s) => s.data.data.bolos);
    const list = Array.isArray(bolos) ? [...bolos].sort((a, b) => (b.time ?? 0) - (a.time ?? 0)) : [];
    const [open, setOpen] = useState(null);

    return (
        <Surface sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <SurfaceHeader icon="eye" title="Active BOLOs" subtitle="Be on the lookout" actions={<IconButton icon="plus" label="Create BOLO" onClick={() => navigate('/create/bolo')} />} />
            <Scroll>
                {list.length === 0 && <EmptyState icon="eye" title="No active BOLOs" />}
                {list.map((b) => (
                    <ListRow key={b.id} onClick={() => setOpen(b)}>
                        <Box sx={{ width: 30, height: 30, borderRadius: '8px', display: 'grid', placeItems: 'center', background: 'var(--sb-warning-soft)', color: 'var(--sb-warning)', fontSize: 12, flexShrink: 0 }}>
                            <Icon icon={BOLOTypes.find((t) => t.value == b.type)?.icon ?? 'eye'} />
                        </Box>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="body1" className="sb-truncate" sx={{ fontWeight: 500 }}>
                                {b.title}
                            </Typography>
                            <Typography variant="caption" className="sb-truncate" sx={{ display: 'block' }}>
                                {b.summary}
                            </Typography>
                        </Box>
                        <Meta icon="clock">{fromNow(b.time)}</Meta>
                    </ListRow>
                ))}
            </Scroll>
            <BoloDialog bolo={open} onClose={() => setOpen(null)} />
        </Surface>
    );
}

/* ------------------------------------------------------------------ */
/* Warrants + DOJ availability                                         */
/* ------------------------------------------------------------------ */

function WarrantBoard({ warrants }) {
    useTick();
    const navigate = useNavigate();
    const list = (Array.isArray(warrants) ? warrants : []).filter((w) => w.state === 'active').sort((a, b) => new Date(a.expires) - new Date(b.expires));
    return (
        <Surface sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <SurfaceHeader icon="file-contract" title="Recent warrants" subtitle="Active, soonest to expire first" actions={<IconButton icon="arrow-right" label="All warrants" onClick={() => navigate('/warrants')} />} />
            <Scroll>
                {list.length === 0 && <EmptyState icon="file-contract" title="No active warrants" />}
                {list.map((w) => (
                    <ListRow key={w.id} onClick={() => navigate(`/warrants?warrant=${w.id}`)}>
                        <Tag tone="success">#{w.id}</Tag>
                        <Typography variant="body1" className="sb-truncate" sx={{ flex: 1, fontWeight: 500 }}>
                            {w.title}
                        </Typography>
                        <Meta icon="hourglass-half">expires {fromNow(w.expires)}</Meta>
                    </ListRow>
                ))}
            </Scroll>
        </Surface>
    );
}

function DojBoard({ govWorkers }) {
    const list = (Array.isArray(govWorkers) ? govWorkers : []).slice().sort((a, b) => String(a.Workplace).localeCompare(String(b.Workplace)) || String(a.Last).localeCompare(String(b.Last)));
    return (
        <Surface sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <SurfaceHeader icon="scale-balanced" title="Available DOJ" subtitle={`${list.length} on duty`} />
            <Scroll>
                {list.length === 0 && <EmptyState icon="scale-balanced" title="No DOJ on duty" />}
                {list.map((d, i) => (
                    <ListRow key={`${d.SID}-${i}`}>
                        <Avatar sx={{ width: 30, height: 30, fontSize: 12, bgcolor: 'var(--sb-bg-4)' }}>{d.First?.[0]}</Avatar>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="body1" className="sb-truncate" sx={{ fontWeight: 500 }}>
                                {d.Grade} {d.First?.[0]}. {d.Last}
                            </Typography>
                            <Typography variant="caption" className="sb-truncate" sx={{ display: 'block' }}>
                                {d.Workplace}
                            </Typography>
                        </Box>
                        <Meta icon="phone" mono>
                            {d.Phone}
                        </Meta>
                        <Meta icon="id-card" mono>
                            {d.SID}
                        </Meta>
                    </ListRow>
                ))}
            </Scroll>
        </Surface>
    );
}

/* ------------------------------------------------------------------ */

export default function Home() {
    const dispatch = useDispatch();
    const role = useRole();
    const govJob = useGovJob();
    const user = useUser();
    const lastFetch = useSelector((s) => s.data.data.homeLastFetch);
    const warrants = useSelector((s) => s.data.data.warrants);
    const notices = useSelector((s) => s.data.data.notices);
    const govWorkers = useSelector((s) => s.data.data.govWorkers);

    const refresh = async () => {
        dispatch({ type: 'SET_DATA', payload: { type: 'homeLastFetch', data: Date.now() } });
        try {
            const res = await fetchNui('GetHomeData', {});
            if (res && typeof res === 'object') {
                if (res.warrants) dispatch({ type: 'SET_DATA', payload: { type: 'warrants', data: res.warrants } });
                if (res.notices) dispatch({ type: 'SET_DATA', payload: { type: 'notices', data: res.notices } });
                if (res.govWorkers) dispatch({ type: 'SET_DATA', payload: { type: 'govWorkers', data: res.govWorkers } });
            }
        } catch (e) {
            // offline; keep what we have
        }
    };

    useEffect(() => {
        if (user && (!lastFetch || Date.now() - lastFetch > 120000)) refresh();
    }, [user, lastFetch]); // eslint-disable-line react-hooks/exhaustive-deps

    const showBolos = role === 'police';
    const showWarrants = ['police', 'doj', 'da', 'publicdefenders', 'government', 'attorney', 'public'].includes(role);
    const showDoj = role === 'police' || govJob?.Id === 'government';

    const columns = 1 + (showBolos ? 1 : 0);
    const bottom = [showWarrants && <WarrantBoard key="w" warrants={warrants} />, showDoj && <DojBoard key="d" govWorkers={govWorkers} />].filter(Boolean);

    return (
        <Box sx={{ height: '100%', minHeight: 0, display: 'grid', gridTemplateRows: bottom.length ? 'minmax(0, 1fr) minmax(0, 1fr)' : 'minmax(0, 1fr)', gap: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: 2, minHeight: 0 }}>
                <NoticeBoard notices={notices} onChanged={refresh} />
                {showBolos && <BoloBoard />}
            </Box>
            {bottom.length > 0 && (
                <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${bottom.length}, minmax(0, 1fr))`, gap: 2, minHeight: 0 }}>{bottom}</Box>
            )}
        </Box>
    );
}
