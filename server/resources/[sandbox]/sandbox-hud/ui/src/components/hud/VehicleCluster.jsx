import React from 'react';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import { Icon, colors } from '@sandbox/ui-kit';
import RingGauge from './RingGauge.jsx';

function fuelColor(fuel) {
    if (fuel >= 50) return colors.success;
    if (fuel >= 10) return colors.warning;
    return colors.danger;
}

const NOS_COLOR = '#2f8cff';

function useVehicle() {
    return useSelector((s) => s.vehicle);
}

function DashIcon({ icon, active, color, pulse, label }) {
    return (
        <Box
            aria-label={label}
            sx={{
                width: 26,
                height: 26,
                display: 'grid',
                placeItems: 'center',
                fontSize: 13,
                color: active ? color : 'rgba(255,255,255,0.22)',
                animation: active && pulse ? `sb-pulse ${pulse} linear infinite` : 'none',
                transition: 'color 160ms var(--sb-ease)',
            }}
        >
            <Icon icon={icon} />
        </Box>
    );
}

function Speed({ speed, unit, ignition, size = 44 }) {
    const str = String(Math.max(0, Math.round(speed)));
    const pad = Math.max(0, 3 - str.length);
    return (
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '6px' }}>
            {ignition ? (
                <>
                    <Box className="sb-mono" sx={{ fontSize: size, fontWeight: 700, lineHeight: 1, letterSpacing: -1 }}>
                        <Box component="span" sx={{ color: 'rgba(255,255,255,0.18)' }}>
                            {'0'.repeat(pad)}
                        </Box>
                        {str}
                    </Box>
                    <Box sx={{ fontSize: Math.max(11, size * 0.3), fontWeight: 600, color: colors.text2 }}>{unit}</Box>
                </>
            ) : (
                <Box className="sb-mono" sx={{ fontSize: size * 0.6, fontWeight: 700, color: colors.text3, lineHeight: 1 }}>
                    OFF
                </Box>
            )}
        </Box>
    );
}

function HBar({ value, color, height = 6, flash = false }) {
    return (
        <Box sx={{ height, borderRadius: 999, background: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}>
            <Box
                sx={{
                    height: '100%',
                    width: `${Math.max(0, Math.min(100, value))}%`,
                    borderRadius: 999,
                    background: color,
                    transition: 'width 120ms linear',
                    animation: flash ? 'sb-pulse 0.6s linear infinite' : 'none',
                }}
            />
        </Box>
    );
}

/* ---------------------------------------------------------------- */

function DefaultCluster() {
    const v = useVehicle();
    const showRPM = useSelector((s) => s.hud.config.showRPM);
    const warnings = (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', px: '4px' }}>
            <DashIcon icon="gauge-high" active={v.cruise} color={colors.info} label="Cruise control" />
            <DashIcon
                icon="triangle-exclamation"
                active={!v.seatbelt && !v.seatbeltHide}
                color={colors.warning}
                pulse="3s"
                label="Seatbelt"
            />
            <DashIcon icon="car-burst" active={v.checkEngine} color={colors.danger} pulse="1s" label="Check engine" />
        </Box>
    );
    return (
        <Box className="sb-glass" sx={{ width: 272, p: '8px 12px 10px', borderRadius: '12px' }}>
            {warnings}
            <Box sx={{ py: '4px' }}>
                <Speed speed={v.speed} unit={v.speedMeasure} ignition={v.ignition} />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '5px', mt: '4px' }}>
                {v.ignition && showRPM && (
                    <HBar
                        value={v.rpm * 100}
                        color={`linear-gradient(90deg, ${colors.accent} 0%, ${colors.accent} 70%, ${colors.danger} 100%)`}
                        height={5}
                    />
                )}
                {v.ignition && !v.fuelHide && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Box sx={{ color: colors.text3, fontSize: 10, width: 12, textAlign: 'center' }}>
                            <Icon icon="gas-pump" />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <HBar value={v.fuel} color={fuelColor(v.fuel)} flash={v.fuel <= 10} />
                        </Box>
                    </Box>
                )}
                {v.ignition && v.nos > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Box sx={{ color: colors.text3, fontSize: 10, width: 12, textAlign: 'center' }}>
                            <Icon icon="wine-bottle" />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <HBar value={v.nos} color={NOS_COLOR} flash={v.nos <= 10} />
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

function MinimalCluster() {
    const v = useVehicle();
    return (
        <Box sx={{ position: 'relative', width: 230, height: 150, display: 'grid', placeItems: 'center' }}>
            {v.ignition && !v.fuelHide && (
                <Box sx={{ position: 'absolute', left: 0, top: 30 }}>
                    <RingGauge size={92} stroke={5} value={v.fuel} arc={90} rotation={-100} color={fuelColor(v.fuel)} counterClockwise>
                        <Box sx={{ position: 'absolute', left: 8, bottom: 6, color: colors.text3, fontSize: 10 }}>
                            <Icon icon="gas-pump" />
                        </Box>
                    </RingGauge>
                </Box>
            )}
            {v.ignition && v.nos > 0 && (
                <Box sx={{ position: 'absolute', right: 0, top: 30 }}>
                    <RingGauge size={92} stroke={5} value={v.nos} arc={90} rotation={100} color={NOS_COLOR}>
                        <Box sx={{ position: 'absolute', right: 8, bottom: 6, color: colors.text3, fontSize: 10 }}>
                            <Icon icon="wine-bottle" />
                        </Box>
                    </RingGauge>
                </Box>
            )}
            <RingGauge size={140} stroke={7} value={v.ignition ? v.rpm * 100 : 0} arc={270} rotation={0} color={colors.accent}>
                <Box sx={{ textAlign: 'center' }}>
                    {v.ignition ? (
                        <>
                            <Box className="sb-mono sb-overworld" sx={{ fontSize: 38, fontWeight: 700, lineHeight: 1 }}>
                                {Math.max(0, Math.round(v.speed))}
                            </Box>
                            <Box sx={{ fontSize: 11, fontWeight: 600, color: colors.text2, mt: '2px' }}>{v.speedMeasure}</Box>
                        </>
                    ) : (
                        <Box className="sb-mono" sx={{ fontSize: 20, fontWeight: 700, color: colors.text3 }}>
                            OFF
                        </Box>
                    )}
                </Box>
            </RingGauge>
            <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <DashIcon icon="gauge-high" active={v.cruise} color={colors.info} label="Cruise control" />
                <DashIcon icon="car-burst" active={v.checkEngine} color={colors.danger} pulse="1s" label="Check engine" />
                <DashIcon
                    icon="triangle-exclamation"
                    active={!v.seatbelt && !v.seatbeltHide}
                    color={colors.warning}
                    pulse="3s"
                    label="Seatbelt"
                />
            </Box>
        </Box>
    );
}

function VBar({ value, color, icon, flash }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', height: 110 }}>
            <Box sx={{ height: 88, width: 10, borderRadius: 999, background: 'rgba(255,255,255,0.12)', position: 'relative', overflow: 'hidden' }}>
                <Box
                    sx={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: `${Math.max(0, Math.min(100, value))}%`,
                        borderRadius: 999,
                        background: color,
                        transition: 'height 160ms var(--sb-ease)',
                        animation: flash ? 'sb-pulse 0.6s linear infinite' : 'none',
                    }}
                />
            </Box>
            <Box sx={{ color: colors.text3, fontSize: 10 }}>
                <Icon icon={icon} />
            </Box>
        </Box>
    );
}

function SimpleCluster() {
    const v = useVehicle();
    return (
        <Box className="sb-overworld" sx={{ display: 'flex', alignItems: 'stretch', gap: '14px', height: 120 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Speed speed={v.speed} unit={v.speedMeasure} ignition={v.ignition} size={64} />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '2px' }}>
                <DashIcon icon="car-burst" active={v.checkEngine} color={colors.danger} pulse="1s" label="Check engine" />
                <DashIcon icon="gauge-high" active={v.cruise} color={colors.info} label="Cruise control" />
                {!v.seatbeltHide && (
                    <DashIcon icon="triangle-exclamation" active={!v.seatbelt} color={colors.warning} pulse="3s" label="Seatbelt" />
                )}
            </Box>
            {v.ignition && (
                <Box sx={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {!v.fuelHide && <VBar value={v.fuel} color={fuelColor(v.fuel)} icon="gas-pump" flash={v.fuel <= 10} />}
                    {v.nos > 0 && <VBar value={v.nos} color={NOS_COLOR} icon="wine-bottle" />}
                </Box>
            )}
        </Box>
    );
}

/** Bottom-centre vehicle readout; `raised` lifts it above content that sits at the very bottom. */
export default function VehicleCluster({ raised = false }) {
    const showing = useSelector((s) => s.vehicle.showing);
    const variant = useSelector((s) => s.hud.config.vehicle);
    const Cluster = variant === 'simple' ? SimpleCluster : variant === 'minimal' ? MinimalCluster : DefaultCluster;
    return (
        <Fade in={showing} mountOnEnter unmountOnExit>
            <Box
                sx={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: raised ? 64 : 18,
                    display: 'flex',
                    justifyContent: 'center',
                    transition: 'bottom 200ms var(--sb-ease)',
                }}
            >
                <Cluster />
            </Box>
        </Fade>
    );
}
