import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Button, Tag } from '@sandbox/ui-kit';
import Toolbar from '../common/Toolbar.jsx';
import SearchField from '../common/SearchField.jsx';
import DataTable from '../common/DataTable.jsx';
import { matchesPlayer, CharacterCell } from './Players.jsx';
import { callNui, describeError } from '../../lib/nui.js';
import { fmtAgo, fmtDateTime, text } from '../../lib/format.js';

export default function DisconnectedPlayers() {
    const navigate = useNavigate();
    const [term, setTerm] = useState('');
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await callNui('GetPlayerList', { disconnected: true });
            if (Array.isArray(res)) setRows(res);
            else {
                setRows([]);
                if (res === false) setError('The server refused the request (no staff permission).');
            }
        } catch (e) {
            setError(describeError(e));
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const shown = useMemo(
        () => rows.filter((p) => matchesPlayer(p, term)).sort((a, b) => (b.DisconnectedTime ?? 0) - (a.DisconnectedTime ?? 0)),
        [rows, term],
    );

    const columns = [
        { key: 'Source', label: 'Last ID', width: 84, mono: true, skeleton: 28 },
        { key: 'AccountID', label: 'Account', width: 110, mono: true, skeleton: 48, render: (p) => `#${p.AccountID}` },
        { key: 'Name', label: 'Player' },
        { key: 'Character', label: 'Character', render: (p) => <CharacterCell character={p.Character} /> },
        {
            key: 'DisconnectedTime',
            label: 'Left',
            width: 200,
            render: (p) => (
                <Box>
                    <Typography variant="body2" sx={{ fontSize: 13 }}>
                        {fmtAgo(p.DisconnectedTime)}
                    </Typography>
                    <Typography variant="caption" className="sb-mono">
                        {fmtDateTime(p.DisconnectedTime)}
                    </Typography>
                </Box>
            ),
        },
        {
            key: 'Reason',
            label: 'Reason',
            width: 320,
            render: (p) => (
                <Typography variant="body2" className="sb-truncate" sx={{ fontSize: 13, color: 'var(--sb-text-2)', maxWidth: 300 }} title={text(p.Reason, '')}>
                    {text(p.Reason, 'Unknown')}
                </Typography>
            ),
        },
        { key: 'IsStaff', label: '', width: 90, align: 'right', render: (p) => (p.IsStaff ? <Tag tone="info">Staff</Tag> : null) },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minHeight: 0 }}>
            <Toolbar
                count={loading ? undefined : shown.length}
                countLabel="recent disconnects"
                actions={
                    <Button tone="ghost" icon="arrows-rotate" onClick={load} disabled={loading}>
                        Refresh
                    </Button>
                }
            >
                <SearchField value={term} onChange={setTerm} placeholder="Name, account, character or state ID" autoFocus />
                <Typography variant="caption">The server keeps the last 60 disconnects.</Typography>
            </Toolbar>

            <DataTable
                columns={columns}
                rows={shown}
                rowKey={(p) => `${p.Source}-${p.DisconnectedTime}`}
                loading={loading}
                onRowClick={(p) => navigate(`/player/${p.Source}`)}
                empty={
                    error
                        ? { icon: 'triangle-exclamation', title: 'Could not load disconnects', description: error }
                        : rows.length
                          ? { icon: 'magnifying-glass', title: 'No matches', description: 'Try a different search.' }
                          : { icon: 'user-slash', title: 'No recent disconnects', description: 'Players who leave the server show up here with the reason they dropped.' }
                }
            />
        </Box>
    );
}
