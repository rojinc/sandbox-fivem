import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { Button, Tag } from '@sandbox/ui-kit';
import Toolbar from '../common/Toolbar.jsx';
import SearchField from '../common/SearchField.jsx';
import DataTable from '../common/DataTable.jsx';
import { callNui, describeError } from '../../lib/nui.js';
import { charName } from '../../lib/format.js';

export function matchesPlayer(p, term) {
    const q = term.trim().toLowerCase();
    if (!q) return true;
    const n = Number.parseInt(q, 10);
    const name = charName(p.Character);
    return (
        String(p.Name ?? '')
            .toLowerCase()
            .includes(q) ||
        (Number.isFinite(n) && (p.AccountID === n || p.Source === n || p.Character?.SID === n)) ||
        (name ? name.toLowerCase().includes(q) : false)
    );
}

export const toggleSx = {
    height: 36,
    '& .MuiToggleButton-root': {
        px: 1.5,
        fontSize: 12.5,
        fontWeight: 600,
        textTransform: 'none',
        color: 'var(--sb-text-2)',
        borderColor: 'var(--sb-border-strong)',
        '&.Mui-selected': { color: 'var(--sb-text)', background: 'var(--sb-accent-soft)' },
        '&.Mui-selected:hover': { background: 'var(--sb-accent-soft)' },
    },
};

export function CharacterCell({ character }) {
    const name = charName(character);
    if (!name) return <Tag>No character</Tag>;
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span>{name}</span>
            <Box component="span" className="sb-mono" sx={{ color: 'var(--sb-text-3)', fontSize: 12 }}>
                #{character.SID}
            </Box>
        </Box>
    );
}

export default function Players() {
    const navigate = useNavigate();
    const [term, setTerm] = useState('');
    const [onlyLoggedIn, setOnlyLoggedIn] = useState(true);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await callNui('GetPlayerList', { disconnected: false });
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
        () => rows.filter((p) => matchesPlayer(p, term) && (!onlyLoggedIn || Boolean(p.Character))).sort((a, b) => (a.Source ?? 0) - (b.Source ?? 0)),
        [rows, term, onlyLoggedIn],
    );

    const columns = [
        { key: 'Source', label: 'ID', width: 72, mono: true, skeleton: 28 },
        { key: 'AccountID', label: 'Account', width: 110, mono: true, skeleton: 48, render: (p) => `#${p.AccountID}` },
        { key: 'Name', label: 'Player' },
        { key: 'Character', label: 'Character', render: (p) => <CharacterCell character={p.Character} /> },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minHeight: 0 }}>
            <Toolbar
                count={loading ? undefined : shown.length}
                countLabel={shown.length === 1 ? 'player' : 'players'}
                actions={
                    <Button tone="ghost" icon="arrows-rotate" onClick={load} disabled={loading}>
                        Refresh
                    </Button>
                }
            >
                <SearchField value={term} onChange={setTerm} placeholder="Name, account, character or state ID" autoFocus />
                <ToggleButtonGroup exclusive size="small" value={onlyLoggedIn ? 'in' : 'all'} onChange={(_, v) => v && setOnlyLoggedIn(v === 'in')} sx={toggleSx}>
                    <ToggleButton value="in">Logged in</ToggleButton>
                    <ToggleButton value="all">Everyone</ToggleButton>
                </ToggleButtonGroup>
            </Toolbar>

            <DataTable
                columns={columns}
                rows={shown}
                rowKey={(p) => p.Source}
                loading={loading}
                onRowClick={(p) => navigate(`/player/${p.Source}`)}
                empty={
                    error
                        ? { icon: 'triangle-exclamation', title: 'Could not load players', description: error }
                        : rows.length
                          ? { icon: 'magnifying-glass', title: 'No matches', description: onlyLoggedIn ? 'Try a different search or include players who have not picked a character.' : 'Try a different search.' }
                          : { icon: 'users', title: 'Nobody is online', description: 'Players will appear here as soon as they connect.' }
                }
            />
        </Box>
    );
}
