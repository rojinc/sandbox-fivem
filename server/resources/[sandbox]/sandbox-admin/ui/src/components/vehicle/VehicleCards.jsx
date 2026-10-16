import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Tag, IconTile, SectionTitle } from '@sandbox/ui-kit';
import Card from '../common/Card.jsx';
import KeyValue from '../common/KeyValue.jsx';
import Meter from '../common/Meter.jsx';
import { PlateChip } from '../pages/Vehicles.jsx';
import { vehicleName, vec3, round, fmtMoney, text } from '../../lib/format.js';

const PARTS = [
    ['Axle', 'Axle'],
    ['Radiator', 'Radiator'],
    ['Transmission', 'Transmission'],
    ['FuelInjectors', 'Fuel injectors'],
    ['Brakes', 'Brakes'],
    ['Clutch', 'Clutch'],
    ['Electronics', 'Electronics'],
];

export function ownerLabel(vehicle) {
    if (!vehicle?.Owned) return 'No';
    const owner = vehicle.Owner && typeof vehicle.Owner === 'object' ? vehicle.Owner.Id : vehicle.Owner;
    return `Yes · ${text(owner, 'unknown owner')}`;
}

export function VehicleHeader({ vehicle, actions, children }) {
    return (
        <Card sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconTile icon="car" tone="warning" size={52} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
                        <Typography variant="h3" className="sb-truncate">
                            {vehicleName(vehicle)}
                        </Typography>
                        <PlateChip plate={vehicle.Plate} />
                        {vehicle.Owned ? (
                            <Tag tone="success" icon="key">
                                Owned
                            </Tag>
                        ) : (
                            <Tag>Unowned</Tag>
                        )}
                    </Box>
                    <Typography variant="body2" className="sb-mono" sx={{ color: 'var(--sb-text-3)', mt: 0.25 }}>
                        VIN {text(vehicle.VIN)}
                    </Typography>
                </Box>
                {actions}
            </Box>
            {children}
        </Card>
    );
}

export function VehicleIdentityCard({ vehicle, extra = [] }) {
    const coords = vec3(vehicle.Coords, 2);
    const heading = round(vehicle.Heading, 2);
    return (
        <Card title="Identity" icon="id-card">
            <KeyValue
                items={[
                    { label: 'Owned', value: ownerLabel(vehicle) },
                    { label: 'Vehicle', value: vehicleName(vehicle) },
                    { label: 'VIN', value: text(vehicle.VIN), mono: true, copy: Boolean(vehicle.VIN) },
                    { label: 'Plate', value: text(vehicle.Plate), mono: true, copy: Boolean(vehicle.Plate) },
                    { label: 'Estimated value', value: fmtMoney(vehicle.Value ?? 0), mono: true },
                    { label: 'Entity model', value: text(vehicle.EntityModel), mono: true, copy: vehicle.EntityModel !== undefined },
                    { label: 'Coordinates', value: coords, mono: true, copy: coords !== '—' },
                    { label: 'Heading', value: heading === null ? '—' : String(heading), mono: true, copy: heading !== null },
                    ...extra,
                ]}
            />
        </Card>
    );
}

export function VehicleConditionCard({ vehicle }) {
    const dp = vehicle.DamagedParts && typeof vehicle.DamagedParts === 'object' ? vehicle.DamagedParts : null;
    const parts = dp ? PARTS.filter(([k]) => dp[k] !== undefined && dp[k] !== null) : [];
    return (
        <Card title="Condition" icon="screwdriver-wrench">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
                <Meter label="Fuel" value={vehicle.Fuel} max={100} />
                <Meter label="Engine health" value={vehicle.Damage?.Engine ?? 1000} max={1000} />
                <Meter label="Body health" value={vehicle.Damage?.Body ?? 1000} max={1000} />
                {parts.length > 0 ? (
                    <>
                        <SectionTitle sx={{ mt: 0.5, mb: 0 }}>Part wear</SectionTitle>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', columnGap: 3, rowGap: 1.5 }}>
                            {parts.map(([key, label]) => (
                                <Meter key={key} label={label} value={dp[key]} max={100} />
                            ))}
                        </Box>
                    </>
                ) : (
                    <Typography variant="caption">No part wear has been recorded for this vehicle.</Typography>
                )}
            </Box>
        </Card>
    );
}
