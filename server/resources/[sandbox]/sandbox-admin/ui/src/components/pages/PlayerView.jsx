import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { Button, IconButton, Tag, Icon, EmptyState } from '@sandbox/ui-kit';
import Card from '../common/Card.jsx';
import KeyValue from '../common/KeyValue.jsx';
import DataTable from '../common/DataTable.jsx';
import ActionBar from '../common/ActionBar.jsx';
import UserAvatar from '../common/UserAvatar.jsx';
import { Loading, Problem } from '../common/LoadState.jsx';
import { useToast } from '../common/Toasts.jsx';
import { KickDialog, BanDialog } from '../player/PunishDialogs.jsx';
import { PlateChip } from './Vehicles.jsx';
import { callNui, describeError, readResult, copyToClipboard } from '../../lib/nui.js';
import { charLabel, charName, fmtAgo, fmtDate, fmtJobs, fmtMoney, vec3, text, vehicleName } from '../../lib/format.js';
import { LEVEL, siteUserUrl } from '../../lib/permissions.js';
import { selectUser, selectPermissionLevel } from '../../features/app/reducer.js';

export default function PlayerView() {
    const { id } = useParams();
    const source = Number(id);
    const navigate = useNavigate();
    const toast = useToast();
    const user = useSelector(selectUser);
    const level = useSelector(selectPermissionLevel);

    const [player, setPlayer] = useState(null);
    const [status, setStatus] = useState('loading');
    const [busy, setBusy] = useState(false);
    const [menuEl, setMenuEl] = useState(null);
    const [dialog, setDialog] = useState(null); // 'kick' | 'ban'
    const [reason, setReason] = useState('');
    const [banLength, setBanLength] = useState(1);

    const load = useCallback(async () => {
        if (!Number.isInteger(source) || source <= 0) {
            setStatus('missing');
            return;
        }
        setStatus('loading');
        try {
            const res = await callNui('GetPlayer', source);
            if (res && typeof res === 'object') {
                setPlayer(res);
                setStatus('ready');
            } else {
                setStatus('missing');
            }
        } catch (e) {
            setStatus('error');
        }
    }, [source]);

    useEffect(() => {
        load();
    }, [load]);

    const isSelf = Boolean(user && player && user.Source === player.Source);
    const offline = Boolean(player?.Disconnected);
    const hasChar = Boolean(player?.Character && typeof player.Character === 'object');
    const outranks = level >= Number(player?.Level ?? 0);
    const sensitive = level >= LEVEL.SENSITIVE;

    const act = async (action) => {
        if (action.key === 'marker') {
            // Lua never answers the "marker" branch of ActionPlayer (see CONTRACT.md).
            callNui('ActionPlayer', { targetSource: player.Source, action: 'marker' }, { timeout: 2000 }).catch(() => {});
            toast.info('GPS marker placed on your map');
            return;
        }
        setBusy(true);
        try {
            const res = await callNui('ActionPlayer', { targetSource: player.Source, action: action.key });
            const r = readResult(res, `${action.label}: done`, `${action.label} failed`);
            (r.ok ? toast.success : toast.error)(r.message);
        } catch (e) {
            toast.error(describeError(e));
        } finally {
            setBusy(false);
        }
    };

    const kick = async () => {
        setBusy(true);
        try {
            const res = await callNui('KickPlayer', { targetSource: player.Source, reason: reason.trim() });
            const r = readResult(res, `Kicked ${player.Name}`, 'Failed to kick the player');
            if (r.ok) {
                toast.success(r.message);
                setDialog(null);
                navigate(-1);
            } else toast.error(r.message);
        } catch (e) {
            toast.error(describeError(e));
        } finally {
            setBusy(false);
        }
    };

    const ban = async () => {
        setBusy(true);
        try {
            const res = await callNui('BanPlayer', { targetSource: player.Source, reason: reason.trim(), length: banLength });
            const r = readResult(res, `Banned ${player.Name}`, 'Failed to ban the player');
            if (r.ok) {
                toast.success(r.message);
                setDialog(null);
                load();
            } else toast.error(r.message);
        } catch (e) {
            toast.error(describeError(e));
        } finally {
            setBusy(false);
        }
    };

    const openDialog = (kind) => {
        setMenuEl(null);
        setReason('');
        setBanLength(1);
        setDialog(kind);
    };

    const copySiteUrl = () => {
        setMenuEl(null);
        if (copyToClipboard(siteUserUrl(player.AccountID))) toast.success('Copied admin site URL');
        else toast.error('Clipboard unavailable');
    };

    const actions = useMemo(() => {
        if (!player) return [];
        const noChar = !hasChar ? 'The player has no character selected' : null;
        const gone = offline ? 'The player is offline' : null;
        const self = isSelf ? 'You cannot do this to yourself' : null;
        const rank = !outranks ? 'Their staff level is above yours' : null;
        return [
            { key: 'goto', label: 'Go to', icon: 'location-arrow', hint: noChar || self || gone, disabled: Boolean(noChar || self || gone) },
            { key: 'bring', label: 'Bring', icon: 'person-walking-arrow-right', hint: noChar || self || gone || rank, disabled: Boolean(noChar || self || gone || rank) },
            {
                key: 'heal',
                label: 'Heal',
                icon: 'heart-pulse',
                hint: noChar || gone || (isSelf && level < LEVEL.SENIOR ? 'Healing yourself needs level 75' : null),
                disabled: Boolean(noChar || gone || (isSelf && level < LEVEL.SENIOR)),
            },
            { key: 'attach', label: 'Spectate', icon: 'eye', hint: noChar || self || gone || rank, disabled: Boolean(noChar || self || gone || rank) },
            ...(sensitive ? [{ key: 'marker', label: 'GPS marker', icon: 'location-dot', hint: self || gone, disabled: Boolean(self || gone) }] : []),
        ];
    }, [player, hasChar, offline, isSelf, outranks, sensitive, level]);

    const canKick = player && !isSelf && !offline && outranks;
    const canBan = canKick && level >= LEVEL.SENIOR;

    const characters = useMemo(() => {
        const list = Array.isArray(player?.Characters) ? player.Characters : [];
        return [...list].sort((a, b) => Number(Boolean(a.Deleted)) - Number(Boolean(b.Deleted)));
    }, [player]);

    if (status === 'loading') return <Loading text="Loading player…" />;
    if (status === 'missing') {
        return <Problem icon="user-slash" title="Player not found" description="Nobody with that server ID is online and they are not in the recent disconnect list." retry={load} back={() => navigate(-1)} />;
    }
    if (status === 'error') return <Problem title="Could not load the player" description="The server did not answer. Try again." retry={load} back={() => navigate(-1)} />;

    const c = hasChar ? player.Character : null;
    const v = player.Vehicle && typeof player.Vehicle === 'object' ? player.Vehicle : null;

    const characterColumns = [
        { key: 'SID', label: 'State ID', width: 90, mono: true },
        { key: 'Name', label: 'Name', render: (ch) => charName(ch) ?? '—' },
        { key: 'LastPlayed', label: 'Last played', width: 140, render: (ch) => fmtAgo(ch.LastPlayed) },
        { key: 'Jobs', label: 'Jobs', render: (ch) => <span style={{ color: 'var(--sb-text-2)' }}>{fmtJobs(ch.Jobs)}</span> },
        { key: 'Cash', label: 'Cash', width: 110, mono: true, align: 'right', render: (ch) => fmtMoney(ch.Cash) },
        { key: 'BankAccount', label: 'Bank account', width: 130, mono: true, muted: true, render: (ch) => text(ch.BankAccount) },
        ...(sensitive ? [{ key: 'Phone', label: 'Phone', width: 130, mono: true, muted: true, render: (ch) => text(ch.Phone) }] : []),
        { key: 'DOB', label: 'Born', width: 120, render: (ch) => fmtDate(ch.DOB) },
        { key: 'Deleted', label: '', width: 90, align: 'right', render: (ch) => (ch.Deleted ? <Tag tone="danger">Deleted</Tag> : null) },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {offline && (
                <Alert
                    severity="warning"
                    icon={<Icon icon="plug-circle-xmark" />}
                    sx={{ alignItems: 'center', '& .MuiAlert-message': { py: 0.5 }, '& .MuiAlert-icon': { fontSize: 18, py: 0.75 } }}
                    action={
                        player.Reconnected ? (
                            <Button size="small" tone="ghost" icon="arrow-right" onClick={() => navigate(`/player/${player.Reconnected}`)}>
                                View current session
                            </Button>
                        ) : null
                    }
                >
                    <strong>Disconnected {fmtAgo(player.DisconnectedTime)}</strong>
                    {' · '}
                    {text(player.Reason, 'no reason recorded')}
                    {player.Reconnected ? ` · they have since reconnected as ID ${player.Reconnected}.` : ''}
                </Alert>
            )}

            <Card sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <UserAvatar src={player.Avatar} name={player.Name} size={56} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="h3" className="sb-truncate">
                                {text(player.Name, 'Unknown player')}
                            </Typography>
                            {isSelf && <Tag tone="info">You</Tag>}
                            {player.StaffGroup && (
                                <Tag tone="warning" icon="crown">
                                    {player.StaffGroup}
                                </Tag>
                            )}
                            <Tag>Level {text(player.Level, '0')}</Tag>
                            {offline ? (
                                <Tag tone="danger">Offline</Tag>
                            ) : (
                                <Tag tone="success" icon="circle">
                                    Online
                                </Tag>
                            )}
                        </Box>
                        <Typography variant="body2" sx={{ color: 'var(--sb-text-2)', mt: 0.5 }}>
                            Account <span className="sb-mono">#{text(player.AccountID)}</span>
                            {' · '}
                            Server ID <span className="sb-mono">{text(player.Source)}</span>
                            {' · '}
                            {c ? `Playing as ${charLabel(c)}` : 'No character selected'}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ActionBar actions={actions} onAction={act} busy={busy} />
                        <IconButton icon="ellipsis" label="More actions" size="medium" onClick={(e) => setMenuEl(e.currentTarget)} sx={{ border: '1px solid var(--sb-border-strong)', width: 34, height: 34 }} />
                    </Box>
                </Box>
            </Card>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 2 }}>
                <Card title="Account" icon="id-badge">
                    <KeyValue
                        items={[
                            { label: 'Account ID', value: text(player.AccountID), mono: true, copy: true },
                            { label: 'Server ID', value: text(player.Source), mono: true },
                            { label: 'Game name', value: text(player.GameName) },
                            { label: 'Discord ID', value: text(player.Discord), mono: true, copy: Boolean(player.Discord) },
                            { label: 'Discord', value: text(player.Mention), mono: true, wrap: true },
                            { label: 'Identifier', value: text(player.Identifier), mono: true, copy: Boolean(player.Identifier), wrap: true },
                            { label: 'Staff group', value: text(player.StaffGroup, 'None') },
                            {
                                label: 'Groups',
                                value:
                                    Array.isArray(player.Groups) && player.Groups.length ? (
                                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                            {player.Groups.map((g) => (
                                                <Tag key={String(g)}>{String(g)}</Tag>
                                            ))}
                                        </Box>
                                    ) : (
                                        '—'
                                    ),
                            },
                        ]}
                    />
                </Card>

                <Card title="Character" icon="user">
                    {c ? (
                        <KeyValue
                            items={[
                                { label: 'Name', value: charName(c) ?? '—' },
                                { label: 'State ID', value: text(c.SID), mono: true, copy: c.SID !== undefined },
                                { label: 'Date of birth', value: fmtDate(c.DOB) },
                                { label: 'Phone', value: text(c.Phone), mono: true, copy: Boolean(c.Phone), hidden: !sensitive },
                                { label: 'Coordinates', value: vec3(c.Coords), mono: true, copy: Boolean(c.Coords), wrap: true, hidden: !sensitive || !c.Coords },
                                { label: 'Jobs', value: fmtJobs(c.Jobs) },
                            ]}
                        />
                    ) : (
                        <EmptyState icon="user-slash" title="Not logged in" description="This player has not picked a character yet." sx={{ py: 3 }} />
                    )}
                </Card>

                <Card title="Vehicle" icon="car">
                    {v ? (
                        <>
                            <KeyValue
                                items={[
                                    { label: 'Vehicle', value: vehicleName(v) },
                                    { label: 'Plate', value: <PlateChip plate={v.Plate} /> },
                                    { label: 'VIN', value: text(v.VIN), mono: true, copy: Boolean(v.VIN) },
                                    { label: 'Seat', value: v.Driver ? 'Driver' : 'Passenger' },
                                    { label: 'Entity', value: text(v.Entity), mono: true },
                                ]}
                            />
                            {level >= LEVEL.SENIOR && v.Entity && (
                                <Button tone="neutral" icon="arrow-right" onClick={() => navigate(`/vehicle/${v.Entity}`)} sx={{ mt: 1.5 }} fullWidth>
                                    Open vehicle
                                </Button>
                            )}
                        </>
                    ) : (
                        <EmptyState icon="person-walking" title="On foot" description={offline ? 'Vehicle data is only known for online players.' : 'This player is not inside a vehicle right now.'} sx={{ py: 3 }} />
                    )}
                </Card>
            </Box>

            <Card title={c ? 'Other characters' : 'Characters'} subtitle="Every character on this account, deleted ones last" icon="users" bodySx={{ display: 'flex', flexDirection: 'column' }}>
                <DataTable
                    columns={characterColumns}
                    rows={characters}
                    rowKey={(ch) => `${ch.SID}-${ch.First}`}
                    rowDisabled={(ch) => Boolean(ch.Deleted)}
                    empty={{ icon: 'users', title: 'No other characters', description: offline ? 'Character lists are only loaded for online players.' : 'This account has no other characters on record.' }}
                    sx={{ flex: 'none', maxHeight: 420 }}
                />
            </Card>

            <Menu anchorEl={menuEl} open={Boolean(menuEl)} onClose={() => setMenuEl(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <MenuItem onClick={copySiteUrl}>
                    <ListItemIcon>
                        <Icon icon="link" />
                    </ListItemIcon>
                    <ListItemText>Copy admin site URL</ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        setMenuEl(null);
                        load();
                    }}
                >
                    <ListItemIcon>
                        <Icon icon="arrows-rotate" />
                    </ListItemIcon>
                    <ListItemText>Refresh</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem disabled={!canKick} onClick={() => openDialog('kick')} sx={{ color: 'var(--sb-danger)' }}>
                    <ListItemIcon sx={{ color: 'inherit' }}>
                        <Icon icon="right-from-bracket" />
                    </ListItemIcon>
                    <ListItemText>Kick…</ListItemText>
                </MenuItem>
                <MenuItem disabled={!canBan} onClick={() => openDialog('ban')} sx={{ color: 'var(--sb-danger)' }}>
                    <ListItemIcon sx={{ color: 'inherit' }}>
                        <Icon icon="ban" />
                    </ListItemIcon>
                    <ListItemText>Ban…</ListItemText>
                </MenuItem>
            </Menu>

            <KickDialog open={dialog === 'kick'} playerName={player.Name} reason={reason} onReason={setReason} busy={busy} onClose={() => setDialog(null)} onConfirm={kick} />
            <BanDialog
                open={dialog === 'ban'}
                playerName={player.Name}
                level={level}
                reason={reason}
                onReason={setReason}
                length={banLength}
                onLength={setBanLength}
                busy={busy}
                onClose={() => setDialog(null)}
                onConfirm={ban}
            />
        </Box>
    );
}
