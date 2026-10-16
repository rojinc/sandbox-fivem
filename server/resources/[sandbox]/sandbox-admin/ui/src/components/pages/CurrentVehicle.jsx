import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import { Button } from '@sandbox/ui-kit';
import ActionBar from '../common/ActionBar.jsx';
import ConfirmDialog from '../common/ConfirmDialog.jsx';
import { Loading, Problem } from '../common/LoadState.jsx';
import { useToast } from '../common/Toasts.jsx';
import { VehicleHeader, VehicleIdentityCard, VehicleConditionCard } from '../vehicle/VehicleCards.jsx';
import { callNui, describeError, readResult } from '../../lib/nui.js';
import { vehicleName, text } from '../../lib/format.js';
import { LEVEL } from '../../lib/permissions.js';
import { selectPermissionLevel } from '../../features/app/reducer.js';

function seatLabel(seat) {
    const n = Number(seat);
    if (Number.isInteger(n)) return n === -1 ? 'Driver' : `Passenger seat ${n + 1}`;
    return text(seat, 'Not in vehicle');
}

export default function CurrentVehicle() {
    const toast = useToast();
    const level = useSelector(selectPermissionLevel);

    const [vehicle, setVehicle] = useState(null);
    const [status, setStatus] = useState('loading');
    const [busy, setBusy] = useState(false);
    const [confirm, setConfirm] = useState(null);

    const load = useCallback(async () => {
        setStatus('loading');
        try {
            const res = await callNui('GetCurrentVehicle', {});
            if (res && typeof res === 'object') {
                setVehicle(res);
                setStatus('ready');
            } else {
                setStatus('none');
            }
        } catch (e) {
            setStatus('error');
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const run = async (action) => {
        setBusy(true);
        try {
            const res = await callNui('CurrentVehicleAction', { action: action.key });
            const r = readResult(res, `${action.label}: done`, `${action.label} failed`);
            if (r.ok) {
                toast.success(r.message);
                if (action.refresh) load();
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
        level >= LEVEL.SENSITIVE && { key: 'alarm', label: 'Alarm', icon: 'bell', hint: 'Sets the alarm off for 25 seconds, or silences it' },
        level >= LEVEL.SENSITIVE && { key: 'customs', label: 'Open customs', icon: 'paint-roller', hint: 'Opens the customs shop for this vehicle and closes the console' },
    ].filter(Boolean);

    const danger = [
        level >= LEVEL.SENSITIVE && {
            key: 'explode',
            label: 'Explode',
            icon: 'bomb',
            tone: 'danger',
            confirm: 'Blow up the vehicle you are sitting in? You and everyone inside will be hurt.',
        },
    ].filter(Boolean);

    if (status === 'loading') return <Loading text="Checking your vehicle…" />;
    if (status === 'none') {
        return (
            <Problem
                icon="car"
                title="You are not in a vehicle"
                description="Get into a vehicle and check again. The actions on this page apply to the vehicle you are sitting in."
                retry={load}
                retryLabel="Check again"
            />
        );
    }
    if (status === 'error') return <Problem title="Could not read your vehicle" description="The game did not answer. Try again." retry={load} />;

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
                <VehicleIdentityCard vehicle={vehicle} extra={[{ label: 'Your seat', value: seatLabel(vehicle.Seat) }]} />
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
