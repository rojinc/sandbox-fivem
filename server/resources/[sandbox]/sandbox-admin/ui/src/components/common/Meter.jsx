import React from 'react';
import { ProgressBar, colors } from '@sandbox/ui-kit';

/** Health / fuel bar coloured by remaining percentage. */
export default function Meter({ label, value, max = 100, unit = '%', places = 0, sx }) {
    const n = Number(value);
    const known = Number.isFinite(n);
    const p = known ? Math.max(0, Math.min(100, (n / max) * 100)) : 0;
    const color = !known ? colors.text3 : p > 60 ? colors.success : p > 30 ? colors.warning : colors.danger;
    const shown = !known ? '—' : unit === '%' ? `${Math.round(p)}%` : `${n.toLocaleString('en-US', { maximumFractionDigits: places })}${unit}`;
    return <ProgressBar value={p} max={100} color={color} label={label} valueLabel={shown} height={5} sx={sx} />;
}
