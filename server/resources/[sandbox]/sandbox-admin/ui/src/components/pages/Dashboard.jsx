import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Button, EmptyState, Tag, Icon } from '@sandbox/ui-kit';
import Card from '../common/Card.jsx';
import StatTile from '../common/StatTile.jsx';
import KeyValue from '../common/KeyValue.jsx';
import Meter from '../common/Meter.jsx';
import UserAvatar from '../common/UserAvatar.jsx';
import Sparkline from '../charts/Sparkline.jsx';
import AreaChart from '../charts/AreaChart.jsx';
import { useToast } from '../common/Toasts.jsx';
import { callNui, describeError } from '../../lib/nui.js';
import { fmtTime, fmtDateTime, pct } from '../../lib/format.js';
import { selectUser, selectPermissionName, selectPermissionLevel, selectPermission } from '../../features/app/reducer.js';

function normalise(res) {
    const history = Array.isArray(res?.history) ? res.history : [];
    const samples = history
        .map((h) => ({ t: Number(h?.time) || 0, v: Math.max(0, Number(h?.count) || 0) }))
        .filter((h) => h.t > 0)
        .sort((a, b) => a.t - b.t);
    return {
        current: Math.max(0, Number(res?.current) || 0),
        max: Math.max(0, Number(res?.max) || 0),
        queue: Math.max(0, Number(res?.queue) || 0),
        samples,
    };
}

export default function Dashboard() {
    const toast = useToast();
    const user = useSelector(selectUser);
    const permission = useSelector(selectPermission);
    const permissionName = useSelector(selectPermissionName);
    const permissionLevel = useSelector(selectPermissionLevel);

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await callNui('GetPlayerHistory', {});
            setData(normalise(res));
        } catch (e) {
            setError(describeError(e));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const points = useMemo(() => {
        if (!data) return [];
        const now = Math.floor(Date.now() / 1000);
        return [...data.samples, { t: now, v: data.current, label: 'Now' }];
    }, [data]);

    const peak = useMemo(() => points.reduce((best, p) => (p.v > best.v ? p : best), { t: 0, v: 0 }), [points]);
    const current = data?.current ?? 0;
    const max = data?.max ?? 0;
    const queue = data?.queue ?? 0;
    const used = pct(current, max);
    const recent = useMemo(() => [...points].reverse(), [points]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minHeight: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h3">Server at a glance</Typography>
                    <Typography variant="body2" sx={{ color: 'var(--sb-text-2)' }}>
                        {error ? error : loading ? 'Fetching the latest population figures…' : `Population sampled every 30 minutes · ${points.length - 1} samples kept`}
                    </Typography>
                </Box>
                <Box sx={{ flex: 1 }} />
                <Button tone="ghost" icon="arrows-rotate" onClick={load} disabled={loading}>
                    Refresh
                </Button>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 2 }}>
                <StatTile
                    label="Online now"
                    value={current}
                    suffix={max ? `/ ${max}` : undefined}
                    icon="users"
                    aside={points.length > 1 ? <Sparkline points={points} /> : null}
                    hint={points.length > 1 ? 'last 6 hours' : 'no history yet'}
                />
                <StatTile label="In queue" value={queue} icon="user-clock" tone={queue > 0 ? 'warning' : undefined} hint={queue > 0 ? 'players waiting to join' : 'nobody waiting'} />
                <StatTile label="Capacity used" value={`${Math.round(used)}%`} icon="gauge-high" tone={used >= 90 ? 'danger' : used >= 75 ? 'warning' : undefined}>
                    <Meter value={used} max={100} />
                </StatTile>
                <StatTile label="Peak · last 6 h" value={peak.v} icon="chart-line" hint={peak.t ? `at ${fmtTime(peak.t)}` : '—'} />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 2, flex: 1, minHeight: 0 }}>
                <Card title="Player count" subtitle="Players connected over the last six hours, plus right now" icon="chart-line" bodySx={{ display: 'flex', flexDirection: 'column' }}>
                    {points.length > 1 ? (
                        <AreaChart points={points} fill formatX={fmtTime} formatY={(v) => String(v)} />
                    ) : (
                        <EmptyState
                            icon="chart-line"
                            title={loading ? 'Loading history…' : 'No samples yet'}
                            description="The server records one population sample every 30 minutes after it starts. Check back shortly."
                            action={
                                !loading && (
                                    <Button tone="neutral" icon="arrows-rotate" onClick={load}>
                                        Refresh
                                    </Button>
                                )
                            }
                        />
                    )}
                </Card>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minHeight: 0 }}>
                    <Card title="Your session" icon="user-shield">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                            <UserAvatar src={user?.Avatar} name={user?.Name} size={40} />
                            <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontWeight: 600 }} className="sb-truncate">
                                    {user?.Name ?? 'Unknown'}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.75, mt: 0.25, flexWrap: 'wrap' }}>
                                    <Tag tone="warning" icon="crown">
                                        {permissionName || permission || 'Staff'}
                                    </Tag>
                                    <Tag>Level {permissionLevel}</Tag>
                                </Box>
                            </Box>
                        </Box>
                        <KeyValue
                            labelWidth={100}
                            items={[
                                { label: 'Account', value: String(user?.AccountID ?? '—'), mono: true },
                                { label: 'Server ID', value: String(user?.Source ?? '—'), mono: true },
                                { label: 'Groups', value: Array.isArray(user?.Groups) && user.Groups.length ? user.Groups.join(', ') : '—' },
                            ]}
                        />
                    </Card>

                    <Card title="Recent samples" subtitle="Newest first, every 30 minutes" icon="clock" sx={{ flex: 1 }} bodySx={{ overflow: 'auto', mr: -1, pr: 1 }}>
                        {recent.length ? (
                            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', '& td': { py: 0.55, borderBottom: '1px solid var(--sb-border)', fontSize: 12.5 }, '& tr:last-child td': { borderBottom: 'none' } }}>
                                <tbody>
                                    {recent.map((p, i) => {
                                        const prev = recent[i + 1];
                                        const delta = prev ? p.v - prev.v : null;
                                        return (
                                            <tr key={p.t}>
                                                <Box component="td" sx={{ color: 'var(--sb-text-2)' }}>
                                                    {p.label ?? fmtDateTime(p.t)}
                                                </Box>
                                                <Box component="td" className="sb-mono" sx={{ textAlign: 'right', fontWeight: 600 }}>
                                                    {p.v}
                                                </Box>
                                                <Box
                                                    component="td"
                                                    className="sb-mono"
                                                    sx={{ textAlign: 'right', width: 64, color: delta > 0 ? 'var(--sb-success)' : delta < 0 ? 'var(--sb-danger)' : 'var(--sb-text-3)' }}
                                                >
                                                    {delta === null ? '' : delta > 0 ? `+${delta}` : delta === 0 ? '±0' : delta}
                                                    {delta !== null && delta !== 0 && (
                                                        <Box component="span" sx={{ ml: 0.5, fontSize: 10 }}>
                                                            <Icon icon={delta > 0 ? 'arrow-up' : 'arrow-down'} />
                                                        </Box>
                                                    )}
                                                </Box>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Box>
                        ) : (
                            <Typography variant="caption">No samples recorded yet.</Typography>
                        )}
                    </Card>
                </Box>
            </Box>
        </Box>
    );
}
