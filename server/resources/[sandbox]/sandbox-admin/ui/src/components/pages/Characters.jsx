import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Button, Tag } from '@sandbox/ui-kit';
import Toolbar from '../common/Toolbar.jsx';
import SearchField from '../common/SearchField.jsx';
import DataTable from '../common/DataTable.jsx';
import Pager from '../common/Pager.jsx';
import { callNui, describeError } from '../../lib/nui.js';
import { fmtAgo, fmtDate, fmtJobs, charName } from '../../lib/format.js';

const PER_PAGE = 10; // matches PER_PAGE in server/callbacks.lua

export default function Characters() {
    const navigate = useNavigate();
    const [term, setTerm] = useState('');
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const search = useCallback(async (p, t) => {
        setLoading(true);
        setError(null);
        try {
            const res = await callNui('GetAllPlayersByCharacter', { term: t.trim(), page: p });
            if (res && typeof res === 'object' && Array.isArray(res.players)) {
                const count = Number(res.pages) || 0; // Lua returns the total document count under `pages`
                setRows(res.players);
                setTotal(count);
                setPages(Math.max(1, Math.ceil(count / PER_PAGE)));
            } else {
                setRows([]);
                setTotal(0);
                setPages(1);
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
        search(1, '');
    }, [search]);

    const submit = (value) => {
        setPage(1);
        search(1, value ?? term);
    };

    const goPage = (p) => {
        setPage(p);
        search(p, term);
    };

    const columns = [
        { key: 'SID', label: 'State ID', width: 96, mono: true, skeleton: 36 },
        { key: 'Name', label: 'Character', render: (c) => charName(c) ?? '—' },
        { key: 'User', label: 'Account', width: 110, mono: true, skeleton: 48, render: (c) => `#${c.User}` },
        { key: 'DOB', label: 'Born', width: 120, render: (c) => fmtDate(c.DOB) },
        { key: 'Jobs', label: 'Jobs', render: (c) => <span style={{ color: 'var(--sb-text-2)' }}>{fmtJobs(c.Jobs)}</span> },
        { key: 'LastPlayed', label: 'Last played', width: 150, render: (c) => fmtAgo(c.LastPlayed) },
        {
            key: 'Online',
            label: 'Status',
            width: 120,
            align: 'right',
            render: (c) =>
                c.Deleted ? (
                    <Tag tone="danger">Deleted</Tag>
                ) : c.Online ? (
                    <Tag tone="success" icon="circle">
                        Online · {c.Online}
                    </Tag>
                ) : (
                    <Tag>Offline</Tag>
                ),
        },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minHeight: 0 }}>
            <Toolbar
                count={loading ? undefined : total}
                countLabel={total === 1 ? 'character' : 'characters'}
                actions={
                    <Button tone="primary" icon="magnifying-glass" onClick={() => submit()} disabled={loading}>
                        Search
                    </Button>
                }
            >
                <SearchField value={term} onChange={setTerm} onSubmit={submit} placeholder="Full name or exact state ID" width={420} autoFocus />
                <Typography variant="caption">Searches every character on record. Press Enter to run it.</Typography>
            </Toolbar>

            <DataTable
                columns={columns}
                rows={rows}
                rowKey={(c) => `${c.SID}-${c.User}`}
                loading={loading}
                onRowClick={(c) => navigate(`/player/${c.Online}`)}
                rowDisabled={(c) => !c.Online}
                empty={
                    error
                        ? { icon: 'triangle-exclamation', title: 'Search failed', description: error }
                        : { icon: 'id-card', title: 'No characters found', description: 'Nothing on record matches that name or state ID.' }
                }
            />

            <Pager page={page} pages={pages} onChange={goPage} summary={loading ? '' : `Page ${page} of ${pages} · only online characters can be opened`} />
        </Box>
    );
}
