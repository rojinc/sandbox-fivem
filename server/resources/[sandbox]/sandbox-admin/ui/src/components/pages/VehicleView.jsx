import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import { Button } from '@sandbox/ui-kit';
import ActionBar from '../common/ActionBar.jsx';
import ConfirmDialog from '../common/ConfirmDialog.jsx';
import { Loading, Problem } from '../common/LoadState.jsx';
import { useToast } from '../common/Toasts.jsx';
import { VehicleHeader, VehicleIdentityCard, VehicleConditionCard } from '../vehicle/VehicleCards.jsx';
import { callNui, describeError, readResult } from '../../lib/nui.js';
import { vehicleName } from '../../lib/format.js';
import { LEVEL } from '../../lib/permissions.js';
import { selectPermissionLevel } from '../../features/app/reducer.js';

export default function VehicleView() {
    const { id } = useParams();
    const entity = Number(id);
    const navigate = useNavigate();
    const toast = useToast();
    const level = useSelector(selectPermissionLevel);

    const [vehicle, setVehicle] = useState(null);
    const [status, setStatus] = useState('loading');
    const [busy, setBusy] = useState(false);
    const [confirm, setConfirm] = useState(null);

    const load = useCallback(async () => {
        if (!Number.isInteger(entity) || entity <= 0) {
            setStatus('missing');
            return;
        }
        setStatus('loading');
        try {
            const res = await callNui('GetVehicle', entity);
            if (res && typeof res === 'object') {
                setVehicle(res);
                setStatus('ready');
            } else {
                setStatus('missing');
            }
        } catch (e) {
            setStatus('error');
        }
    }, [entity]);

    useEffect(() => {
        load();
    }, [load]);

    const run = async (action) => {
        setBusy(true);
        try {
            const res = await callNui('ActionVehicle', { model: vehicle.EntityModel, target: vehicle.Entity ?? entity, action: action.key });
            const r = readResult(res, `${action.label}: done`, `${action.label} failed`);
            if (r.ok) {
                toast.success(r.message);
                if (action.key === 'delete') navigate(-1);
                else if (action.refresh) load();
            } else toast.error(r.message);
        } catch (e) {
            toast.error(describeError(e));
        } finally {
            setBusy(false);
            setConfirm(null);
        }
    };

    const primary = [
        { key: 'repair', label: 'Quick repair', icon: 'wrench', refresh: true },
        level >= LEVEL.SENSITIVE && { key: 'repair_full', label: 'Full repair', icon: 'screwdriver-wrench', refresh: true },
        level >= LEVEL.SENSITIVE && { key: 'repair_engine', label: 'Engine repair', icon: 'gear', refresh: true },
        level >= LEVEL.SENSITIVE && { key: 'fuel', label: 'Refuel', icon: 'gas-pump', refresh: true },
        level >= LEVEL.SENIOR && { key: 'sitinside', label: 'Sit inside', icon: 'chair', hint: 'Teleports you into the first free seat' },
        level >= LEVEL.SENSITIVE && { key: 'locks', label: 'Toggle locks', icon: 'lock' },
    ].filter(Boolean);

    const danger = [
        level >= LEVEL.SENSITIVE && {
            key: 'stall',
            label: 'Stall engine',
            icon: 'power-off',
            tone: 'danger',
            confirm: 'Cut the engine of this vehicle? The driver loses power until they restart it.',
        },
        level >= LEVEL.SENSITIVE && {
            key: 'explode',
            label: 'Explode',
            icon: 'bomb',
            tone: 'danger',
            confirm: 'Blow up this vehicle? Anyone inside will be hurt and the vehicle is wrecked.',
        },
        level >= LEVEL.SENIOR && {
            key: 'delete',
            label: 'Delete',
            icon: 'trash',
            tone: 'danger',
            confirm: 'Remove this vehicle from the world? This cannot be undone from here.',
        },
    ].filter(Boolean);

    if (status === 'loading') return <Loading text="Loading vehicle…" />;
    if (status === 'missing') {
        return <Problem icon="car" title="Vehicle not found" description="That entity no longer exists in the world, or you are not allowed to view it." retry={load} back={() => navigate(-1)} />;
    }
    if (status === 'error') {
        return <Problem title="Could not load the vehicle" description="The server did not answer. Check your connection and try again." retry={load} back={() => navigate(-1)} />;
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <VehicleHeader
                vehicle={vehicle}
                actions={
                    <Button tone="ghost" icon="arrows-rotate" onClick={load} disabled={busy}>
                        Refresh
                    </Button>
                }
            >
                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                    <ActionBar actions={primary} onAction={run} busy={busy} />
                    {danger.length > 0 && (
                        <>
                            <Box sx={{ flex: 1 }} />
                            <ActionBar actions={danger} onAction={(a) => setConfirm(a)} busy={busy} />
                        </>
                    )}
                </Box>
            </VehicleHeader>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 2 }}>
                <VehicleIdentityCard vehicle={vehicle} extra={[{ label: 'Entity', value: String(vehicle.Entity ?? entity), mono: true }]} />
                <VehicleConditionCard vehicle={vehicle} />
            </Box>

            <ConfirmDialog
                open={Boolean(confirm)}
                title={confirm ? `${confirm.label} · ${vehicleName(vehicle)}` : ''}
                description={confirm?.confirm}
                confirmLabel={confirm?.label}
                confirmIcon={confirm?.icon}
                tone="danger"
                busy={busy}
                onClose={() => setConfirm(null)}
                onConfirm={() => confirm && run(confirm)}
            />
        </Box>
    );
}
