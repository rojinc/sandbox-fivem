import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { Tag, Icon, IconButton, EmptyState } from '@sandbox/ui-kit';
import { ChargeTypes, chargeTone, chargeLabel } from '../../lib/data.js';
import { money } from '../../lib/format.js';
import SearchField from './SearchField.jsx';
import Modal from './Modal.jsx';
import { Field, FieldGrid } from './Fields.jsx';

const toneColor = { info: 'var(--sb-info)', warning: 'var(--sb-warning)', danger: 'var(--sb-danger)', neutral: 'var(--sb-text-3)' };

/** Resolve {id,count} pairs against the loaded charges list. */
export function useResolvedCharges(selected) {
    const charges = useSelector((s) => s.data.data.charges) ?? [];
    return useMemo(() => {
        const list = Array.isArray(selected) ? selected : [];
        return list
            .map((c) => {
                const def = charges.find((ch) => ch.id == c.id);
                return def ? { ...def, id: c.id, count: c.count ?? 1 } : null;
            })
            .filter(Boolean);
    }, [selected, charges]);
}

/** Totals used by the calculator, suspect cards and sentencing (same maths as before). */
export function chargeTotals(list) {
    const months = list.filter((c) => c.jail).reduce((a, b) => a + Number(b.jail), 0);
    const fine = list.filter((c) => c.fine).reduce((a, b) => a + Number(b.fine) * b.count, 0);
    const points = list.filter((c) => c.points).reduce((a, b) => a + Number(b.points) * b.count, 0);
    const isFelony = list.some((c) => c.type > 2);
    const isInfraction = !list.some((c) => c.type > 1);
    return { months, fine, points, isFelony, isInfraction };
}

export const sortCharges = (list) => [...list].sort((a, b) => a.type - b.type || a.jail - b.jail || a.fine - b.fine);

export function ChargeLegend({ sx }) {
    return (
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', ...sx }}>
            {ChargeTypes.map((t) => (
                <Box key={t.value} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, fontSize: 12, color: 'var(--sb-text-2)' }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '2px', background: toneColor[t.tone] }} />
                    {t.label}
                </Box>
            ))}
        </Box>
    );
}

/** Chip for a charge, coloured by type. */
export function ChargeTag({ charge, count, sx }) {
    const text = count != null ? `${charge.title} ×${count}` : charge.title;
    return (
        <Tooltip title={text}>
            <Tag tone={chargeTone(charge.type)} sx={{ maxWidth: 220, ...sx }}>
                <span className="sb-truncate" style={{ maxWidth: 200 }}>
                    {text}
                </span>
            </Tag>
        </Tooltip>
    );
}

/** Card for one charge in the penal code / calculator grids. */
export function ChargeCard({ charge, onClick, onInfo, selected = false }) {
    return (
        <Box
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick?.();
                }
            }}
            sx={{
                position: 'relative',
                p: '10px 12px',
                pl: '14px',
                borderRadius: 'var(--sb-radius-md)',
                border: '1px solid var(--sb-border)',
                background: selected ? 'var(--sb-accent-soft)' : 'var(--sb-surface-soft)',
                cursor: 'pointer',
                minWidth: 0,
                outline: 'none',
                transition: 'background var(--sb-dur-fast) var(--sb-ease), border-color var(--sb-dur-fast) var(--sb-ease)',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 10,
                    bottom: 10,
                    width: 3,
                    borderRadius: 2,
                    background: toneColor[chargeTone(charge.type)],
                },
                '&:hover': { background: 'var(--sb-surface-hover)', borderColor: 'var(--sb-border-strong)' },
                '&:focus-visible': { borderColor: 'var(--sb-accent)' },
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="body1" className="sb-truncate" sx={{ fontWeight: 500 }}>
                        {charge.title}
                    </Typography>
                    <Typography variant="caption" className="sb-mono" sx={{ display: 'block', color: 'var(--sb-text-2)' }}>
                        {charge.jail ? `${charge.jail} mo` : null}
                        {charge.jail && charge.fine ? ' · ' : null}
                        {charge.fine ? money(charge.fine) : null}
                        {charge.points ? ` · ${charge.points} pts` : null}
                        {!charge.jail && !charge.fine && !charge.points ? chargeLabel(charge.type) : null}
                    </Typography>
                </Box>
                {onInfo && (
                    <IconButton
                        icon="circle-info"
                        label="Details"
                        onClick={(e) => {
                            e.stopPropagation();
                            onInfo(charge);
                        }}
                    />
                )}
            </Box>
        </Box>
    );
}

/** Details dialog for one charge. */
export function ChargeDetails({ charge, onClose }) {
    return (
        <Modal open={Boolean(charge)} title={charge?.title ?? 'Charge'} icon="gavel" onClose={onClose} closeLabel="Close">
            {charge && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                        <Tag tone={chargeTone(charge.type)}>{chargeLabel(charge.type)}</Tag>
                    </Box>
                    <Field label="Description" wrap>
                        {charge.description || 'No description.'}
                    </Field>
                    <FieldGrid columns={3}>
                        <Field label="Jail sentence" mono>
                            {charge.jail ? `${charge.jail} months` : 'None'}
                        </Field>
                        <Field label="Fine" mono>
                            {charge.fine ? money(charge.fine) : 'None'}
                        </Field>
                        <Field label="License points" mono>
                            {charge.points ? `${charge.points} points` : 'None'}
                        </Field>
                    </FieldGrid>
                </Box>
            )}
        </Modal>
    );
}

/** Searchable grid of charges with a running total column. */
export default function ChargeCalculator({ selected, onAdd, onRemove, height = 420 }) {
    const charges = useSelector((s) => s.data.data.charges) ?? [];
    const [search, setSearch] = useState('');
    const [info, setInfo] = useState(null);
    const resolved = useResolvedCharges(selected);
    const totals = chargeTotals(resolved);
    const license = useSelector((s) => s.app.pointBreakpoints?.license ?? 20);

    const filtered = useMemo(() => {
        const term = search.trim().toUpperCase();
        return sortCharges(term ? charges.filter((c) => c.title?.toUpperCase().includes(term)) : charges);
    }, [charges, search]);

    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(260px, 1fr)', gap: 2, height }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <SearchField value={search} onChange={setSearch} placeholder="Search charges" sx={{ maxWidth: 320 }} />
                    <ChargeLegend />
                </Box>
                <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, alignContent: 'start', pr: 0.5 }}>
                    {filtered.map((c) => (
                        <ChargeCard key={c.id} charge={c} onClick={() => onAdd(c)} onInfo={setInfo} />
                    ))}
                    {filtered.length === 0 && (
                        <Box sx={{ gridColumn: '1 / -1' }}>
                            <EmptyState icon="gavel" title="No charges match" />
                        </Box>
                    )}
                </Box>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, borderRadius: 'var(--sb-radius-md)', border: '1px solid var(--sb-border)', background: 'var(--sb-surface-soft)' }}>
                <Typography variant="h6" sx={{ color: 'var(--sb-text-3)', p: '10px 14px', borderBottom: '1px solid var(--sb-border)' }}>
                    Current charges
                </Typography>
                <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 1 }}>
                    {resolved.length === 0 && <EmptyState icon="scale-balanced" title="No charges added" description="Click a charge to add it. Click again to stack it." sx={{ py: 3 }} />}
                    {resolved.map((c) => (
                        <Box key={c.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.75, borderRadius: '8px', '&:hover': { background: 'var(--sb-surface-hover)' } }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: toneColor[chargeTone(c.type)], flexShrink: 0 }} />
                            <Typography variant="body2" className="sb-truncate" sx={{ flex: 1 }}>
                                {c.title}
                            </Typography>
                            <Typography variant="body2" className="sb-mono" sx={{ color: 'var(--sb-text-2)' }}>
                                ×{c.count}
                            </Typography>
                            <IconButton icon="circle-xmark" label="Remove" onClick={() => onRemove(c)} sx={{ color: 'var(--sb-danger)' }} />
                        </Box>
                    ))}
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, p: '10px 14px', borderTop: '1px solid var(--sb-border)' }}>
                    <Field label="Months" mono>
                        {totals.months}
                    </Field>
                    <Field label="Fine" mono>
                        {money(totals.fine)}
                    </Field>
                    <Field label="Points" mono valueSx={{ color: totals.points >= license ? 'var(--sb-danger)' : undefined }}>
                        {totals.points}
                    </Field>
                </Box>
            </Box>
            <ChargeDetails charge={info} onClose={() => setInfo(null)} />
        </Box>
    );
}

export function ChargeTypeIcon({ type }) {
    return <Icon icon="square" style={{ color: toneColor[chargeTone(type)] }} />;
}
